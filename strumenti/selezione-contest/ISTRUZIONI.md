# Selezione delle finaliste: come attivarla

La pagina riservata ai selezionatori è
`/culturaturismo/contest-fotografico-il-sole-ridisegna-i-contorni/selezione/`
(in inglese `/en/culturaturismo/contest-fotografico-il-sole-ridisegna-i-contorni/selezione/`).
Non è collegata dai menu e non viene indicizzata dai motori di ricerca.

Il sito è statico: accessi, foto e like stanno in un **foglio Google** con uno **script** che fa da
server. Le password non finiscono mai nel codice del sito né su GitHub.

## 1. Cartella delle foto

1. In Google Drive crea una cartella, per esempio `Contest 2026 - foto in concorso`.
2. Mettici le foto ricevute con il modulo Tally (scaricale dalle risposte del modulo).
   Il nome dei file non viene mai mostrato: nella pagina ogni foto ha solo un codice anonimo.
3. Apri la cartella e copia la parte finale dell'indirizzo, dopo `/folders/`: è l'**ID della cartella**.

## 2. Foglio Google e script

1. Crea un nuovo foglio Google, per esempio `Contest 2026 - selezione`.
2. Menu **Estensioni > Apps Script**.
3. Cancella il contenuto del file `Codice.gs` e incolla tutto il file `Codice.gs` di questa cartella.
4. In alto nel codice sostituisci `INCOLLA-QUI-ID-CARTELLA` con l'ID della cartella del punto 1.
   Lì c'è anche la data di chiusura (`CHIUSURA`, 30 novembre 2026 alle 23:59:59).
5. Salva (icona del disco), torna al foglio e ricarica la pagina: compare il menu **Contest**.
6. **Contest > Prepara le schede**: crea le schede `Abilitati`, `Foto` e `Like` (se esistono già,
   aggiunge solo le intestazioni mancanti, come la colonna "Email autore").
   La prima volta Google chiede l'autorizzazione: scegli il tuo account, poi
   "Avanzate" > "Vai a … (non sicuro)" > "Consenti" (lo script è tuo, l'avviso è normale).

## 3. Selezionatori

Nella scheda **Abilitati** scrivi una riga per ogni selezionatore: email nella colonna A, password
nella colonna B. La password distingue maiuscole e minuscole; l'email no.
Per togliere l'accesso a qualcuno cancella la sua riga o cambiagli la password.

## 4. Foto

**Contest > Importa foto dalla cartella**: aggiunge alla scheda **Foto** le immagini nuove della
cartella, con i codici F001, F002… in ordine di caricamento, e le rende visibili a chi ha il link
(serve per mostrarle nella pagina). Puoi ripeterlo quando arrivano altre foto: quelle già
importate non vengono duplicate e i codici esistenti non cambiano.

Per escludere una foto (per esempio non conforme al regolamento) cancella la sua riga nella scheda
Foto: sparisce dalla pagina e i suoi like non vengono più contati.

### Foto dei selezionatori

Un selezionatore non può mettere il like alle proprie foto. Nella scheda **Foto**, colonna C
(**Email autore**), scrivi l'email dell'autore accanto alle foto dei selezionatori: deve essere la
stessa email che il selezionatore usa per entrare nella pagina (quella della scheda Abilitati).
Per le altre foto la colonna può restare vuota.

Nella pagina, sulle sue foto il selezionatore vede la scritta "La tua foto" al posto del cuore.
L'email dell'autore non viene mai mostrata. Se un selezionatore aveva già messo il like a una sua
foto prima che compilassi la colonna, quel like non viene più contato.

## 5. Pubblicare la web app

1. In Apps Script: **Esegui il deployment > Nuovo deployment**.
2. Tipo: **App web**. Esegui come: **Me**. Chi ha accesso: **Chiunque**.
   ("Chiunque" serve perché la pagina del sito possa contattarla: lo script risponde solo a chi
   ha email e password valide.)
3. Copia l'**URL dell'app web** (finisce con `/exec`) e mandalo a Claude, oppure incollalo in
   `src/lib/selezione.ts` nel campo `scriptUrl`, poi commit e push.

Se in seguito modifichi il codice dello script: **Esegui il deployment > Gestisci deployment >
modifica (matita) > Versione: Nuova versione > Esegui il deployment**. L'URL resta lo stesso.

## Risultati

La scheda **Like** contiene ogni like (email, codice foto, data). Dopo la chiusura, la classifica
finale resta visibile nella pagina; per il conteggio puoi anche usare una tabella pivot sulla
colonna Codice.
