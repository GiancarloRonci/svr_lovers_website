/**
 * Selezione delle finaliste del contest fotografico di SanVitoRomano Lovers.
 *
 * Web app Google Apps Script collegata al foglio Google con le schede:
 *   - Abilitati: Email | Password            (una riga per selezionatore)
 *   - Foto:      Codice | ID file Drive | Email autore | Eliminata
 *                (compilata in automatico dagli invii Tally; i selezionatori non possono mettere
 *                il like alle foto con la loro email come autore, ma possono eliminarle: lo script
 *                scrive la data in "Eliminata" e la foto sparisce dalla pagina)
 *   - Like:      Email | Codice | Data        (scritta dallo script, non modificarla a mano)
 *   - Coda:      foto ricevute da Tally (webhook o CSV) in attesa di essere salvate su Drive
 *   - Import CSV: (facoltativa) risposte esportate da Tally, per importare gli invii vecchi
 *
 * La pagina del sito chiama questa web app con POST e riceve JSON. Tally chiama la stessa web
 * app (webhook) con `?chiave=...` nell'indirizzo: l'invio finisce nella Coda e un'esecuzione
 * automatica ogni minuto scarica le foto (Tally vuole una risposta entro 10 secondi).
 * Istruzioni complete: ISTRUZIONI.md nella stessa cartella.
 */

// Versione del codice, mostrata aprendo l'URL /exec nel browser: serve a controllare che il
// deployment esegua davvero l'ultima versione incollata. Va cambiata a ogni modifica.
var VERSIONE = '2026-10-17 eliminazione foto';

// Fine delle votazioni (ora italiana): dopo questa data i like non si possono più cambiare.
var CHIUSURA = new Date('2026-11-30T23:59:59+01:00');

// ID della cartella Google Drive con le foto in concorso (la parte finale dell'indirizzo
// della cartella, dopo /folders/).
var CARTELLA_FOTO_ID = 'INCOLLA-QUI-ID-CARTELLA';

var SCHEDA_ABILITATI = 'Abilitati';
var SCHEDA_FOTO = 'Foto';
var SCHEDA_LIKE = 'Like';
var SCHEDA_CODA = 'Coda';
var SCHEDA_CSV = 'Import CSV';

// Colonne della scheda Coda
var INTESTAZIONE_CODA = ['Data', 'ID invio', 'Email autore', 'Nome file', 'URL', 'Stato', 'Codice'];
var CODA = { data: 0, invio: 1, email: 2, nome: 3, url: 4, stato: 5, codice: 6 };

// ---------------------------------------------------------------------------------------------
// Web app

function doGet() {
  return ContentService.createTextOutput('Selezione contest: web app attiva (versione ' + VERSIONE + ').');
}

function doPost(e) {
  // Invio dal modulo Tally (webhook): l'indirizzo contiene la chiave segreta
  if (e.parameter && e.parameter.chiave !== undefined) return riceviTally(e);

  var richiesta;
  try {
    richiesta = JSON.parse(e.postData.contents);
  } catch (err) {
    return risposta({ ok: false, errore: 'richiesta' });
  }

  var email = String(richiesta.email || '').trim().toLowerCase();
  var password = String(richiesta.password || '').trim();
  // Visibile in Apps Script > Esecuzioni (password esclusa)
  console.log('Versione ' + VERSIONE + ' - azione ' + richiesta.azione + ' da ' + email + (richiesta.codice ? ' su ' + richiesta.codice : ''));
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

  if (richiesta.azione === 'elimina') {
    if (votazioneChiusa()) return risposta({ ok: false, errore: 'chiuso' });
    var esito = eliminaFoto(email, String(richiesta.codice || ''));
    if (esito) return risposta({ ok: false, errore: esito });
    var dopo = statoVotazione(email);
    dopo.foto = elencoFoto(email);
    return risposta(dopo);
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

// Righe della scheda Foto in gara: con codice e file, e non eliminate dall'autore
function fotoInGara(r) {
  return r[0] && r[1] && !r[3];
}

// L'email dell'autore non viene mai mandata alla pagina: solo il segnale "questa foto è tua"
function elencoFoto(email) {
  return righe(SCHEDA_FOTO)
    .filter(fotoInGara)
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
    if (fotoInGara(r)) autori[String(r[0]).trim()] = emailAutore(r);
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

// Un selezionatore può eliminare solo le proprie foto. La riga resta nella scheda Foto con la
// data in "Eliminata" (così il codice non viene riassegnato e la foto si può recuperare svuotando
// la cella); il file resta su Drive. Restituisce '' se riuscita, altrimenti il codice di errore.
function eliminaFoto(email, codice) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var s = scheda(SCHEDA_FOTO);
    var valori = s.getDataRange().getValues();
    for (var i = 1; i < valori.length; i++) {
      if (!fotoInGara(valori[i]) || String(valori[i][0]).trim() !== codice) continue;
      if (emailAutore(valori[i]) === '' || emailAutore(valori[i]) !== email) return 'nonPropria';
      s.getRange(i + 1, 4).setValue(new Date());
      return '';
    }
    return 'foto';
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
    .addSeparator()
    .addItem('Collega Tally (mostra URL del webhook)', 'mostraUrlWebhook')
    .addItem('Attiva il salvataggio automatico delle foto', 'attivaElaborazione')
    .addItem('Importa gli invii dalla scheda "Import CSV"', 'importaCsv')
    .addItem('Salva adesso le foto in coda', 'elaboraCodaManuale')
    .addItem('Riprova le foto con errore', 'riprovaErrori')
    .addSeparator()
    .addItem('Importa foto dalla cartella (manuale)', 'importaFoto')
    .addToUi();
}

// Crea le schede con le intestazioni, se mancano, e aggiunge le intestazioni mancanti
// a quelle già esistenti (es. la colonna "Email autore" nella scheda Foto)
function preparaSchede() {
  var foglio = SpreadsheetApp.getActiveSpreadsheet();
  [
    [SCHEDA_ABILITATI, ['Email', 'Password']],
    [SCHEDA_FOTO, ['Codice', 'ID file Drive', 'Email autore', 'Eliminata']],
    [SCHEDA_LIKE, ['Email', 'Codice', 'Data']],
    [SCHEDA_CODA, INTESTAZIONE_CODA],
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
  SpreadsheetApp.getUi().alert('Schede pronte: Abilitati, Foto, Like, Coda.');
}

// ---------------------------------------------------------------------------------------------
// Invii da Tally: webhook e import CSV finiscono nella Coda; elaboraCoda salva le foto su Drive

// Chiave segreta del webhook, generata la prima volta e conservata nelle proprietà dello script
function chiaveWebhook() {
  var props = PropertiesService.getScriptProperties();
  var chiave = props.getProperty('CHIAVE_WEBHOOK');
  if (!chiave) {
    chiave = Utilities.getUuid().replace(/-/g, '');
    props.setProperty('CHIAVE_WEBHOOK', chiave);
  }
  return chiave;
}

// L'indirizzo /exec non si può ricavare in modo affidabile dallo script (getService().getUrl()
// può restituire un indirizzo interno che dà 404): si mostra solo la parte da aggiungere.
function mostraUrlWebhook() {
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    'URL del webhook per Tally',
    'Prendi l\'URL dell\'app web del tuo deployment (Esegui il deployment > Gestisci deployment, ' +
      'quello che finisce con /exec, lo stesso usato dal sito) e aggiungi in fondo:\n\n' +
      '?chiave=' +
      chiaveWebhook() +
      '\n\nIncolla l\'indirizzo completo in Tally: modulo > Integrations > Webhooks > Connect.' +
      '\nNon condividerlo: contiene la chiave che autorizza gli invii.',
    ui.ButtonSet.OK
  );
}

function riceviTally(e) {
  if (e.parameter.chiave !== chiaveWebhook()) return risposta({ ok: false, errore: 'chiave' });
  var invio;
  try {
    invio = JSON.parse(e.postData.contents);
  } catch (err) {
    return risposta({ ok: false, errore: 'richiesta' });
  }
  if (invio.eventType !== 'FORM_RESPONSE' || !invio.data) return risposta({ ok: true, ignorato: true });

  var campi = invio.data.fields || [];
  var email = '';
  var file = [];
  campi.forEach(function (c) {
    if (c.type === 'INPUT_EMAIL' && !email && c.value) email = String(c.value);
    if (c.type === 'FILE_UPLOAD' && Array.isArray(c.value)) file = file.concat(c.value);
  });
  var id = invio.data.submissionId || invio.data.responseId || invio.eventId;
  var aggiunti = accoda(
    file.map(function (f) {
      return { invio: id, email: email, nome: f.name, url: f.url };
    })
  );
  return risposta({ ok: true, accodati: aggiunti });
}

// Aggiunge alla Coda le foto non ancora presenti (stesso invio e stesso nome file = doppione,
// per esempio quando Tally ripete un invio o lo stesso invio arriva anche dal CSV)
function accoda(elementi) {
  if (!elementi.length) return 0;
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    var s = scheda(SCHEDA_CODA);
    var presenti = {};
    righe(SCHEDA_CODA).forEach(function (r) {
      presenti[String(r[CODA.invio]) + '|' + String(r[CODA.nome])] = true;
    });
    var nuove = [];
    elementi.forEach(function (el) {
      var chiave = String(el.invio) + '|' + String(el.nome);
      if (!el.url || presenti[chiave]) return;
      presenti[chiave] = true;
      var riga = [];
      riga[CODA.data] = new Date();
      riga[CODA.invio] = el.invio;
      riga[CODA.email] = String(el.email || '').trim().toLowerCase();
      riga[CODA.nome] = el.nome;
      riga[CODA.url] = el.url;
      riga[CODA.stato] = '';
      riga[CODA.codice] = '';
      nuove.push(riga);
    });
    if (nuove.length) s.getRange(s.getLastRow() + 1, 1, nuove.length, INTESTAZIONE_CODA.length).setValues(nuove);
    return nuove.length;
  } finally {
    lock.releaseLock();
  }
}

// Esecuzione automatica ogni minuto (una sola)
function attivaElaborazione() {
  var gia = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'elaboraCoda';
  });
  if (!gia) ScriptApp.newTrigger('elaboraCoda').timeBased().everyMinutes(1).create();
  SpreadsheetApp.getUi().alert(
    gia ? 'Il salvataggio automatico era già attivo.' : 'Salvataggio automatico attivato: le foto in coda vengono salvate ogni minuto.'
  );
}

function elaboraCodaManuale() {
  var n = elaboraCoda();
  SpreadsheetApp.getUi().alert(n + ' foto salvate. Controlla la colonna Stato della scheda Coda per eventuali errori.');
}

function riprovaErrori() {
  var s = scheda(SCHEDA_CODA);
  var valori = s.getDataRange().getValues();
  var n = 0;
  for (var i = 1; i < valori.length; i++) {
    if (String(valori[i][CODA.stato]).indexOf('errore') === 0) {
      s.getRange(i + 1, CODA.stato + 1).setValue('');
      n++;
    }
  }
  SpreadsheetApp.getUi().alert(n + ' foto rimesse in coda.');
}

function prossimoCodice() {
  var ultimo = 0;
  righe(SCHEDA_FOTO).forEach(function (r) {
    var n = parseInt(String(r[0]).replace(/\D/g, ''), 10);
    if (n > ultimo) ultimo = n;
  });
  return 'F' + ('00' + (ultimo + 1)).slice(-3);
}

// Scarica le foto in coda, le salva nella cartella Drive con il codice anonimo come nome e le
// aggiunge alla scheda Foto con l'email dell'autore. Restituisce quante foto ha salvato.
function elaboraCoda() {
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(1000)) return 0; // un'altra elaborazione è già in corso
  var salvate = 0;
  try {
    var inizio = Date.now();
    var s = scheda(SCHEDA_CODA);
    var foto = scheda(SCHEDA_FOTO);
    var valori = s.getDataRange().getValues();
    var cartella = DriveApp.getFolderById(CARTELLA_FOTO_ID);
    for (var i = 1; i < valori.length; i++) {
      if (Date.now() - inizio > 4 * 60 * 1000) break; // il resto al giro successivo
      var r = valori[i];
      if (String(r[CODA.stato]) !== '') continue;
      try {
        var resp = UrlFetchApp.fetch(String(r[CODA.url]), { muteHttpExceptions: true, followRedirects: true });
        if (resp.getResponseCode() !== 200) throw new Error('download non riuscito (HTTP ' + resp.getResponseCode() + ')');
        var blob = resp.getBlob();
        var tipo = blob.getContentType() || '';
        if (tipo.indexOf('image/') !== 0) throw new Error('non è un\'immagine (' + tipo + ')');
        var codice = prossimoCodice();
        var estensione = (String(r[CODA.nome]).match(/\.[a-z0-9]{2,5}$/i) || ['.' + tipo.split('/')[1]])[0].toLowerCase();
        var file = cartella.createFile(blob.setName(codice + estensione));
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        foto.appendRow([codice, file.getId(), String(r[CODA.email]).trim().toLowerCase()]);
        s.getRange(i + 1, CODA.stato + 1, 1, 2).setValues([['ok', codice]]);
        salvate++;
      } catch (err) {
        s.getRange(i + 1, CODA.stato + 1).setValue('errore: ' + err.message);
      }
    }
  } finally {
    lock.releaseLock();
  }
  return salvate;
}

// Import una tantum degli invii già ricevuti: in Tally scarica le risposte in CSV e importale
// nel foglio (File > Importa > Carica > "Inserisci nuovi fogli"), poi rinomina la scheda in
// "Import CSV". Da ogni riga prende l'email e tutti i link alle foto caricate su Tally.
function importaCsv() {
  var ui = SpreadsheetApp.getUi();
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCHEDA_CSV);
  if (!s) {
    ui.alert('Manca la scheda "' + SCHEDA_CSV + '": importa il CSV di Tally e rinomina la nuova scheda così.');
    return;
  }
  var valori = s.getDataRange().getDisplayValues();
  var intestazione = valori[0].map(function (h) {
    return String(h).toLowerCase();
  });
  var colId = intestazione.findIndex(function (h) {
    return /submission id|response id/.test(h);
  });
  var colEmail = intestazione.findIndex(function (h) {
    return /e-?mail/.test(h);
  });

  var elementi = [];
  var senzaFoto = 0;
  valori.slice(1).forEach(function (r, i) {
    var id = colId >= 0 && r[colId] ? r[colId] : 'csv-riga-' + (i + 2);
    var email = colEmail >= 0 ? r[colEmail] : '';
    if (!email) {
      var trovata = r.join(' ').match(/[^\s,;"<>]+@[^\s,;"<>]+\.[a-z]{2,}/i);
      if (trovata) email = trovata[0];
    }
    var link = (r.join(' ').match(/https?:\/\/[^\s,;"]+/g) || []).filter(function (u) {
      return /tally/i.test(u);
    });
    if (!link.length) {
      senzaFoto++;
      return;
    }
    link.forEach(function (u) {
      var nome = decodeURIComponent(u.split('?')[0].split('/').pop());
      elementi.push({ invio: id, email: email, nome: nome, url: u });
    });
  });

  var aggiunte = accoda(elementi);
  var salvate = elaboraCoda();
  ui.alert(
    'Import CSV completato',
    aggiunte + ' foto aggiunte alla coda (' + (elementi.length - aggiunte) + ' già presenti), ' +
      salvate + ' salvate su Drive.' +
      (senzaFoto ? '\n' + senzaFoto + ' righe senza link a foto sono state saltate.' : '') +
      '\nSe alcune foto restano in coda, il salvataggio automatico le completa al prossimo giro.',
    ui.ButtonSet.OK
  );
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
