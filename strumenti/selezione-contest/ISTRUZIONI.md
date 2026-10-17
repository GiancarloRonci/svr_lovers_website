# Selezione delle finaliste: come attivarla

La pagina riservata ai selezionatori è
`/culturaturismo/contest-fotografico-il-sole-ridisegna-i-contorni/selezione/`
(in inglese `/en/culturaturismo/contest-fotografico-il-sole-ridisegna-i-contorni/selezione/`).
Non è collegata dai menu e non viene indicizzata dai motori di ricerca.

Il sito è statico: accessi, foto e like stanno in un **foglio Google** con uno **script** che fa da
server. Le password non finiscono mai nel codice del sito né su GitHub.

Le foto arrivano **in automatico** dal modulo Tally: a ogni invio Tally avvisa lo script
(webhook), lo script mette le foto in una coda e ogni minuto le salva nella cartella Drive, con un
codice anonimo (F001, F002…) e l'email dell'autore.

## 1. Cartella delle foto

1. In Google Drive crea una cartella vuota, per esempio `Contest 2026 - foto in concorso`.
2. Apri la cartella e copia la parte finale dell'indirizzo, dopo `/folders/`: è l'**ID della cartella**.

## 2. Foglio Google e script

1. Crea un nuovo foglio Google, per esempio `Contest 2026 - selezione`.
2. Menu **Estensioni > Apps Script**.
3. Cancella il contenuto del file `Codice.gs` e incolla tutto il file `Codice.gs` di questa cartella.
4. In alto nel codice sostituisci `INCOLLA-QUI-ID-CARTELLA` con l'ID della cartella del punto 1.
   Lì c'è anche la data di chiusura (`CHIUSURA`, 30 novembre 2026 alle 23:59:59).
5. Salva (icona del disco), torna al foglio e ricarica la pagina: compare il menu **Contest**.
6. **Contest > Prepara le schede**: crea le schede `Abilitati`, `Foto`, `Like` e `Coda` (se esistono
   già, aggiunge solo quelle o le intestazioni mancanti).
   La prima volta Google chiede l'autorizzazione: scegli il tuo account, poi
   "Avanzate" > "Vai a … (non sicuro)" > "Consenti" (lo script è tuo, l'avviso è normale).

## 3. Selezionatori

Nella scheda **Abilitati** scrivi una riga per ogni selezionatore: email nella colonna A, password
nella colonna B. La password distingue maiuscole e minuscole; l'email no.
Per togliere l'accesso a qualcuno cancella la sua riga o cambiagli la password.

Un selezionatore non può mettere il like alle proprie foto: lo script lo riconosce perché l'email
dell'autore (presa dal modulo Tally) coincide con quella con cui entra nella pagina. Per questo i
selezionatori che partecipano al contest devono usare **la stessa email** nel modulo e nella
scheda Abilitati. Sulle loro foto vedono "La tua foto" al posto del cuore.

## 4. Pubblicare la web app

1. In Apps Script: **Esegui il deployment > Nuovo deployment**.
2. Tipo: **App web**. Esegui come: **Me**. Chi ha accesso: **Chiunque**.
   ("Chiunque" serve perché la pagina del sito e Tally possano contattarla: lo script risponde
   solo a chi ha email e password valide, o la chiave segreta del webhook.)
3. Copia l'**URL dell'app web** (finisce con `/exec`) e mandalo a Claude, oppure incollalo in
   `src/lib/selezione.ts` nel campo `scriptUrl`, poi commit e push.

Se in seguito modifichi il codice dello script: **Esegui il deployment > Gestisci deployment >
modifica (matita) > Versione: Nuova versione > Esegui il deployment**. L'URL resta lo stesso.

## 5. Collegare Tally (automatico)

1. Nel foglio: **Contest > Attiva il salvataggio automatico delle foto** (una volta sola).
   Google chiede di nuovo l'autorizzazione, perché ora lo script scarica file da internet.
2. Nel foglio: **Contest > Collega Tally (mostra URL del webhook)**. Compare un indirizzo del tipo
   `https://script.google.com/macros/s/…/exec?chiave=…`: copialo. Non condividerlo, contiene la
   chiave che autorizza gli invii. Se l'indirizzo mostrato non corrisponde al tuo `/exec`, usa il
   tuo `/exec` aggiungendo in fondo la parte `?chiave=…`.
3. In Tally apri il modulo del contest > **Integrations > Webhooks > Connect**, incolla l'indirizzo e
   salva. Non serve impostare il "signing secret" né intestazioni HTTP.
4. Prova: invia una foto di prova con il modulo. Entro un paio di minuti compare una riga nella
   scheda **Coda** con Stato `ok`, la foto nella cartella Drive e una riga nella scheda **Foto**.
   In Tally, nella pagina del webhook, la consegna deve risultare riuscita.

Se una foto non si scarica, nella scheda **Coda** la colonna Stato dice `errore: …`.
**Contest > Riprova le foto con errore** le rimette in coda.

## 6. Invii arrivati prima del collegamento (import CSV, una volta sola)

1. In Tally: modulo > **Submissions > Download > CSV**.
2. Nel foglio: **File > Importa > Carica**, scegli il CSV, opzione **Inserisci nuovi fogli**.
3. Rinomina la nuova scheda in **Import CSV** (esattamente così).
4. **Contest > Importa gli invii dalla scheda "Import CSV"**.

Fallo subito dopo aver scaricato il CSV: i link alle foto di Tally scadono dopo un po'. Gli invii
già arrivati con il webhook vengono riconosciuti e non si duplicano. Finito l'import puoi
cancellare la scheda Import CSV.

## Gestione

- Per escludere una foto (per esempio non conforme al regolamento) cancella la sua riga nella scheda
  **Foto**: sparisce dalla pagina e i suoi like non vengono più contati. Il file resta su Drive.
- **Contest > Importa foto dalla cartella (manuale)** resta disponibile per aggiungere a mano foto
  messe direttamente nella cartella Drive (senza email dell'autore).

## Risultati

La scheda **Like** contiene ogni like (email, codice foto, data). Dopo la chiusura, la classifica
finale resta visibile nella pagina; per il conteggio puoi anche usare una tabella pivot sulla
colonna Codice.
