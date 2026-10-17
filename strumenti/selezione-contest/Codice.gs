/**
 * Selezione delle finaliste del contest fotografico di SanVitoRomano Lovers.
 *
 * Web app Google Apps Script collegata al foglio Google con le schede:
 *   - Abilitati: Email | Password            (una riga per selezionatore)
 *   - Foto:      Codice | ID file Drive | Email autore
 *                (le prime due colonne le compila il menu "Contest > Importa foto"; l'email
 *                dell'autore si scrive a mano, almeno per le foto dei selezionatori, che non
 *                possono mettere il like alle proprie foto)
 *   - Like:      Email | Codice | Data        (scritta dallo script, non modificarla a mano)
 *
 * La pagina del sito chiama questa web app con POST e riceve JSON.
 * Istruzioni complete: ISTRUZIONI.md nella stessa cartella.
 */

// Fine delle votazioni (ora italiana): dopo questa data i like non si possono più cambiare.
var CHIUSURA = new Date('2026-11-30T23:59:59+01:00');

// ID della cartella Google Drive con le foto in concorso (la parte finale dell'indirizzo
// della cartella, dopo /folders/).
var CARTELLA_FOTO_ID = 'INCOLLA-QUI-ID-CARTELLA';

var SCHEDA_ABILITATI = 'Abilitati';
var SCHEDA_FOTO = 'Foto';
var SCHEDA_LIKE = 'Like';

// ---------------------------------------------------------------------------------------------
// Web app

function doGet() {
  return ContentService.createTextOutput('Selezione contest: web app attiva.');
}

function doPost(e) {
  var richiesta;
  try {
    richiesta = JSON.parse(e.postData.contents);
  } catch (err) {
    return risposta({ ok: false, errore: 'richiesta' });
  }

  var email = String(richiesta.email || '').trim().toLowerCase();
  var password = String(richiesta.password || '').trim();
  if (!credenzialiValide(email, password)) return risposta({ ok: false, errore: 'credenziali' });

  if (richiesta.azione === 'accesso') {
    var stato = statoVotazione(email);
    stato.foto = elencoFoto(email);
    return risposta(stato);
  }

  if (richiesta.azione === 'like') {
    if (votazioneChiusa()) return risposta({ ok: false, errore: 'chiuso' });
    var codice = String(richiesta.codice || '');
    var autori = autoriFoto();
    if (!(codice in autori)) return risposta({ ok: false, errore: 'foto' });
    // Il like alle proprie foto è vietato (toglierlo resta possibile, nel caso ci fosse già)
    if (richiesta.valore === true && autori[codice] === email) return risposta({ ok: false, errore: 'propria' });
    impostaLike(email, codice, richiesta.valore === true);
    return risposta(statoVotazione(email));
  }

  return risposta({ ok: false, errore: 'azione' });
}

function risposta(oggetto) {
  return ContentService.createTextOutput(JSON.stringify(oggetto)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------------------------
// Dati

function scheda(nome) {
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nome);
  if (!s) throw new Error('Manca la scheda "' + nome + '"');
  return s;
}

// Righe della scheda senza l'intestazione
function righe(nome) {
  var valori = scheda(nome).getDataRange().getValues();
  return valori.slice(1);
}

function credenzialiValide(email, password) {
  if (!email || !password) return false;
  return righe(SCHEDA_ABILITATI).some(function (r) {
    return String(r[0]).trim().toLowerCase() === email && String(r[1]).trim() === password;
  });
}

function votazioneChiusa() {
  return new Date() > CHIUSURA;
}

function emailAutore(r) {
  return String(r[2] || '').trim().toLowerCase();
}

// L'email dell'autore non viene mai mandata alla pagina: solo il segnale "questa foto è tua"
function elencoFoto(email) {
  return righe(SCHEDA_FOTO)
    .filter(function (r) {
      return r[0] && r[1];
    })
    .map(function (r) {
      var id = String(r[1]).trim();
      return {
        codice: String(r[0]).trim(),
        img: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w800',
        grande: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w2400',
        propria: emailAutore(r) !== '' && emailAutore(r) === email,
      };
    });
}

// Codice foto -> email dell'autore ('' se non indicata)
function autoriFoto() {
  var autori = {};
  righe(SCHEDA_FOTO).forEach(function (r) {
    if (r[0] && r[1]) autori[String(r[0]).trim()] = emailAutore(r);
  });
  return autori;
}

// Like dell'utente e classifica di tutte le foto (anche quelle senza like)
function statoVotazione(email) {
  var autori = autoriFoto();
  var conteggi = {};
  Object.keys(autori).forEach(function (c) {
    conteggi[c] = 0;
  });
  var miei = [];
  righe(SCHEDA_LIKE).forEach(function (r) {
    var e = String(r[0]).trim().toLowerCase();
    var c = String(r[1]).trim();
    if (!(c in conteggi)) return;
    // Un like dato a una propria foto (prima che fosse indicato l'autore) non conta
    if (autori[c] && autori[c] === e) return;
    conteggi[c]++;
    if (e === email) miei.push(c);
  });
  var classifica = Object.keys(conteggi)
    .map(function (c) {
      return { codice: c, like: conteggi[c] };
    })
    .sort(function (a, b) {
      return b.like - a.like || (a.codice < b.codice ? -1 : 1);
    });
  return {
    ok: true,
    chiuso: votazioneChiusa(),
    miei: miei,
    classifica: classifica,
  };
}

function impostaLike(email, codice, valore) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var s = scheda(SCHEDA_LIKE);
    var valori = s.getDataRange().getValues();
    var trovato = false;
    // Dal basso verso l'alto, così cancellare una riga non sposta quelle ancora da controllare
    for (var i = valori.length - 1; i >= 1; i--) {
      if (String(valori[i][0]).trim().toLowerCase() === email && String(valori[i][1]).trim() === codice) {
        if (valore) trovato = true;
        else s.deleteRow(i + 1);
      }
    }
    if (valore && !trovato) s.appendRow([email, codice, new Date()]);
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------------------------
// Menu del foglio

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Contest')
    .addItem('Prepara le schede', 'preparaSchede')
    .addItem('Importa foto dalla cartella', 'importaFoto')
    .addToUi();
}

// Crea le tre schede con le intestazioni, se mancano, e aggiunge le intestazioni mancanti
// a quelle già esistenti (es. la colonna "Email autore" nella scheda Foto)
function preparaSchede() {
  var foglio = SpreadsheetApp.getActiveSpreadsheet();
  [
    [SCHEDA_ABILITATI, ['Email', 'Password']],
    [SCHEDA_FOTO, ['Codice', 'ID file Drive', 'Email autore']],
    [SCHEDA_LIKE, ['Email', 'Codice', 'Data']],
  ].forEach(function (d) {
    var s = foglio.getSheetByName(d[0]);
    if (!s) {
      s = foglio.insertSheet(d[0]);
      s.appendRow(d[1]);
      s.setFrozenRows(1);
      return;
    }
    d[1].forEach(function (titolo, i) {
      var cella = s.getRange(1, i + 1);
      if (!cella.getValue()) cella.setValue(titolo);
    });
  });
  SpreadsheetApp.getUi().alert('Schede pronte: Abilitati, Foto, Like.');
}

// Aggiunge alla scheda Foto le immagini della cartella non ancora presenti, con un codice
// anonimo progressivo (F001, F002…), e le rende visibili a chi ha il link.
function importaFoto() {
  var s = scheda(SCHEDA_FOTO);
  var presenti = {};
  var ultimo = 0;
  righe(SCHEDA_FOTO).forEach(function (r) {
    presenti[String(r[1]).trim()] = true;
    var n = parseInt(String(r[0]).replace(/\D/g, ''), 10);
    if (n > ultimo) ultimo = n;
  });

  var nuove = [];
  var file = DriveApp.getFolderById(CARTELLA_FOTO_ID).getFiles();
  while (file.hasNext()) {
    var f = file.next();
    if (f.getMimeType().indexOf('image/') !== 0 || presenti[f.getId()]) continue;
    nuove.push(f);
  }
  // Ordine di arrivo nella cartella, così i codici seguono l'ordine di caricamento
  nuove.sort(function (a, b) {
    return a.getDateCreated() - b.getDateCreated();
  });

  nuove.forEach(function (f) {
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    ultimo++;
    s.appendRow(['F' + ('00' + ultimo).slice(-3), f.getId()]);
  });
  SpreadsheetApp.getUi().alert(nuove.length + ' foto nuove importate.');
}
