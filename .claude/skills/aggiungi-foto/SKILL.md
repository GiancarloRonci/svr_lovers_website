---
name: aggiungi-foto
description: Aggiunge o sostituisce foto nel sito partendo dalle immagini in appo_immagini, in italiano e in inglese - percorsi (con la posizione sulla mappa), luoghi, classifica San Vito Top 100, articoli e copertine - con offuscamento di visi e targhe, verifica delle coordinate e didascalie. Sposta anche le foto sulla mappa, le riordina e toglie foto dalla Top 100. Usare ogni volta che l'utente chiede cose come "prendi l'immagine in input", "la foto nella cartella in input", "mettila nella posizione 41.88, 12.98", "aggiungi questa foto al percorso/luogo", "mettila nella top 100 al posto del progressivo N", "rimuovi la foto N", "metti questa copertina", "riordina i progressivi", anche quando indica solo un URL del sito e delle coordinate. Non serve per le locandine degli eventi, che seguono aggiorna-eventi, né per i nuovi articoli di Storie in sanvitese.
---

# Aggiungi foto al sito

L'utente lascia le immagini in `C:\Users\GiancarloRonci\appo_immagini` ("la cartella in input"; le sottocartelle come `backup/` non contano) e indica la destinazione con un URL del sito. Il push su `main` pubblica subito il sito: una foto sbagliata, o un viso non coperto, va online. Per questo i passi sotto danno più peso al guardare le foto che alla velocità.

Il lavoro meccanico lo fa `foto.mjs`, da lanciare dalla radice del repo. Usalo invece di scrivere script nuovi con sharp: `node .claude/skills/aggiungi-foto/foto.mjs <comando>` (l'elenco è in testa al file; senza argomenti stampa i comandi).

## Capire la richiesta

| L'utente scrive | Cosa significa |
|---|---|
| `/percorsi/<slug>/` | `src/content/percorsi/<slug>.md` e la cartella `<slug>/` |
| `/luoghi/<slug>/` | `src/content/luoghi/<slug>.md` e la cartella `<slug>/` |
| `/articoli/<slug>/` | `src/content/articoli/<slug>.md` e la cartella `<slug>/` |
| top 100 | `src/content/mappe-foto/san-vito-top-100.md` |
| "foto N", "progressivo N" | la N-esima voce dell'elenco, **non** il file `fotoN.jpg`: i due numeri spesso non coincidono |
| "la stessa foto", "mettila anche nella top 100" | la foto già pubblicata, compresi gli offuscamenti |

Nelle pagine dei percorsi le foto dell'elenco `foto:` sono numerate per primo, poi quelle di `galleria:`; la copertina non conta. Ogni contenuto ha il gemello in `<collection>-en` con lo stesso slug.

## Procedura

1. **Trova le immagini**: `input` elenca file, dimensioni e data. Se non c'è nulla, dillo all'utente e fermati.

2. **Guarda ogni immagine** con Read prima di decidere qualunque cosa: serve per la didascalia, la privacy e per capire se è davvero ciò che l'utente crede.

3. **Controlla la posizione**, se l'utente dà coordinate: `dove <lat> <lng> [slug]` restituisce l'indirizzo e, per un percorso, la distanza dalla traccia e il posto suggerito nell'elenco. Confronta con ciò che si vede. Se non tornano, chiedi prima di procedere: una volta le coordinate erano copiate da un altro luogo, e l'utente ha apprezzato la segnalazione. Con più di 50 m dalla traccia, verifica con più attenzione. Se il comando avvisa che l'elenco non segue la traccia, scegli il posto guardando le foto vicine.

4. **Proteggi la privacy** (dettagli sotto): se serve, `griglia` per stimare le aree, `ritaglia` per ingrandire i dubbi, `offusca`, poi riguarda il risultato con Read e ripeti se qualcosa resta riconoscibile.

5. **Scrivi le didascalie** in italiano e inglese. Se l'utente ne dà una, usala alla lettera e traducila. Altrimenti descrivi ciò che si vede, senza inventare fatti storici, e segnala quello che hai dedotto.

6. **Installa**: `stato <collection>/<slug>` dà il nome libero, poi `installa <src> <collection>/<slug>/<nome.jpg>` scrive lo stesso file in IT ed EN, raddrizzato, ridotto a 2048 px e senza metadati (quindi senza GPS). Se hai offuscato, `<src>` è il file offuscato. `--sostituisci` serve per rimpiazzare un file esistente.

7. **Aggiorna i due file `.md`** (IT ed EN) con Edit: vedi le destinazioni sotto.

8. **Verifica**: `verifica` controlla tutto il sito, oppure passa i contenuti toccati (`verifica percorsi/lattaceca mappe-foto/san-vito-top-100`). Poi `npx astro sync`, e `npx astro build` solo se hai usato `copertinaPosizione` o toccato una copertina. Un `EBUSY` su `dist` è un blocco di Windows, non un errore dei contenuti. Non usare `astro check`.

9. **Riepiloga e aspetta "commit e push"**: destinazione, numero della foto, didascalia IT, cosa hai offuscato ed eventuali dubbi. Le foto compaiono in "Ultime foto" del sito grazie al commit, quindi un commit che aggiunge foto non porta mai `[no-log]`. Per il messaggio segui lo stile dei precedenti, es. `Percorsi: nel percorso Lattaceca una nuova foto, la scalinata di un vicolo (IT ed EN)`.

## Destinazioni

**Percorso, con posizione.** Voce in `foto:`, nel posto scelto al passo 3, con le stesse coordinate in IT ed EN:
```yaml
  - lat: 41.883376
    lng: 12.984173
    immagine: ./lattaceca/foto9.jpg
    didascalia: "..."
```
**Percorso, senza posizione.** Voce in `galleria:` con `immagine` e `didascalia`, in fondo.

**Luogo.** Voce in `galleria:`, in fondo salvo richiesta diversa, file `photoN.jpg`. Le coordinate dell'utente servono solo al controllo del passo 3: quelle del luogo non cambiano.

**Top 100.** Le voci devono restare 100, quindi ogni aggiunta toglie un'altra foto. Prima `top100 <N>` per vedere cosa c'è a quel progressivo. Il progressivo è la posizione nell'elenco, e la voce nuova prende il posto di quella tolta.
- Foto già in un percorso: voce di riferimento, che eredita coordinate e didascalia e resta valida anche se l'elenco del percorso viene riordinato:
  ```yaml
  - percorso: lattaceca
    immagine: foto6.jpg
  ```
- Altrimenti foto propria della mappa: file `mappe-foto/san-vito-top-100/<nome-descrittivo>.jpg` e voce con `immagine`, `lat`, `lng`, `didascalia`.
- Se l'utente lascia a te il progressivo, `top100-vicine <lat> <lng>` trova le foto più vicine: metti la nuova accanto a loro. Se chiede di "togliere" senza dire quale, chiedi.
- Se la voce tolta era una foto propria, cancella il suo file in IT ed EN: `verifica` lo segnala come "file non usato".

**Immagine in un articolo.** `![didascalia](./<slug>/photoN.jpg)` nel punto più pertinente del testo, IT ed EN. Il testo alternativo diventa la didascalia sotto l'immagine: non aggiungere righe in corsivo.

**Copertina di un articolo.** Campo `immagine:` nel frontmatter, file `copertina.jpg` o il nome già in uso; `immagineAutore` per il credito. Due campi opzionali regolano la resa: `copertinaPosizione` sceglie la parte mostrata nelle schede (solo valori di sharp: `top`, `left bottom`; `center top` fa fallire la build), `copertinaBassa: true` limita l'altezza delle immagini verticali. Se l'utente vuole vedere tutta l'immagine, o parte di essa, guarda come è fatto negli articoli che già li usano.

**Spostare una foto sulla mappa.** Basta cambiare `lat` e `lng` in IT ed EN, dopo il controllo del passo 3.

**Riordinare i progressivi di un percorso.** Cambia solo l'ordine delle voci in `foto:`, in IT ed EN: il numero mostrato viene da lì. **Non rinominare i file**: la Top 100 li cita per nome, e dopo una rinumerazione la build passa ma la mappa mostra le foto sbagliate senza alcun errore (è successo con il Percorso B il 26 ottobre 2026). Se proprio servisse rinominare, aggiorna `src/content/mappe-foto{,-en}` nello stesso passaggio, dal vecchio nome al nuovo in un colpo solo, senza sostituzioni a catena.

## Privacy

**Percorsi, luoghi e Top 100.**
- Offusca i visi riconoscibili di persone vive e le targhe leggibili. L'utente non lo ripete ogni volta: fa parte della procedura.
- Non offuscare persone lontane, minuscole o di spalle, né i visi in ritratti, statue, dipinti e fotografie d'epoca.
- Per i visi usa aree abbondanti rispetto al viso. Per le targhe `targa:` applica la pixelatura grossa: una fine resta leggibile.

**Articoli.** Le foto d'epoca e quelle dei contributi della comunità restano intatte: l'utente ha chiesto di lasciarle così ("lascia le foto così come sono") e di togliere un offuscamento già applicato. Se però una foto è recente e mostra sconosciuti o minori riconoscibili, chiedi prima di pubblicarla.

Quando la stessa foto va in un'altra destinazione, parti dal file già pubblicato o da quello offuscato, non dall'originale in `appo_immagini`: ripartire da lì farebbe ricomparire i visi.

## Autore

Senza campi vale "Redazione SVR Lovers" (`src/lib/photoCredit.ts`): non scriverlo. Se l'autore è un altro, aggiungi `autore` (e `licenza` per Wikimedia e simili) alla voce, in IT ed EN; se ne hanno bisogno, `immagineAutore` e `immagineLicenza` per la copertina.
