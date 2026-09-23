---
name: aggiorna-concerti
description: Cerca concerti pop, rock o musica dance entro circa un'ora di macchina da San Vito Romano nelle prossime settimane, e propone quelli nuovi da aggiungere alle collection eventi/eventi-en (tipologiaEvento Concerto). Usare quando l'utente chiede di "cercare concerti", "aggiornare i concerti", "trovare eventi musicali pop/rock/dance nei dintorni" o simili.
---

# Aggiorna concerti (pop, rock, dance) nei dintorni di San Vito Romano

Questa skill è una variante specializzata di `aggiorna-eventi`, focalizzata solo sui **concerti di musica pop, rock o dance**. Scrive nella stessa collection Astro `src/content/eventi` (e nel gemello `src/content/eventi-en`), usando sempre `tipologiaEvento: Concerto`.

Non gestisce la rimozione di eventi passati: per quello (concerti compresi) usa la Modalità B di `aggiorna-eventi`.

## Cosa cercare (e cosa scartare)

Includi solo concerti dal vivo di musica **pop, rock o dance/elettronica** (cantanti, band, dj set, festival musicali di questi generi). Scarta esplicitamente:

- Musica classica, lirica, jazz, folk/popolare tradizionale, bandistica, cori.
- Sagre o feste patronali con "serata musicale" generica non da headliner riconoscibile (quelle restano di competenza di `aggiorna-eventi`).
- Concerti tribute band/cover a meno che non siano l'unica offerta rilevante nel periodo richiesto: in tal caso segnalali come tali nel titolo (es. "Tributo a ...").

Se un evento è ambiguo (es. "concerto" senza genere chiaro), verifica il genere dell'artista/gruppo prima di includerlo.

## Contesto geografico

Stesso raggio di `aggiorna-eventi`: comuni entro circa un'ora di macchina da San Vito Romano — Palestrina, Zagarolo, Cave, Genazzano, Olevano Romano, Capranica Prenestina, Castel San Pietro Romano, Rocca di Cave, Guadagnolo, Bellegra, Roiate, San Cesareo, Colonna, Gallicano nel Lazio, Colleferro, Paliano, Subiaco, Monte Livata, Canterano, Affile, Piglio, Serrone.

I concerti pop/rock/dance in questi comuni sono rari e perlopiù legati a sagre estive o eventi patronali: è normale che la ricerca non trovi nulla per lunghi periodi. Non ampliare il raggio a Roma città o a grandi venue/stadi/arene salvo esplicita richiesta dell'utente per quella ricerca specifica: mantieniti sullo stesso perimetro delle altre skill di eventi, per coerenza con l'ambito "dintorni di San Vito Romano" del sito.

## Procedura

1. **Controlla cosa è già presente.** Elenca i file in `src/content/eventi/*.md` con `tipologiaEvento: Concerto` (e in generale tutti i titoli/date) per evitare duplicati.

2. **Cerca concerti nel periodo richiesto** (di default dalla data odierna alle prossime 6-8 settimane, salvo indicazione diversa dell'utente). Fonti utili:
   - Siti dei Comuni interessati (pagine "eventi/agenda", spesso i concerti sono legati a feste patronali o sagre estive).
   - **NumeroZero** (numerozero.org) e **Monti Prenestini** (montiprenestini.info), come per gli altri eventi.
   - Pagine social (Facebook/Instagram) di Pro Loco e Comuni, dove spesso vengono annunciati i nomi degli artisti prima che compaiano sul sito ufficiale.
   - Usa WebSearch per query come `concerto <comune> 2026`, `"<nome comune>" festa patronale 2026 concerto`, poi WebFetch sulla fonte più autorevole per confermare artista, data e luogo.

3. **Scarta i concerti con data, artista o genere incerto o contraddittorio** finché non trovi una fonte ufficiale che li confermi. Se più fonti danno informazioni diverse, fidati della fonte istituzionale (Comune/Pro Loco/organizzatore).

4. **Per ogni concerto nuovo confermato**, crea il file in `src/content/eventi/<slug-descrittivo>.md` seguendo lo schema Zod (`src/content.config.ts`, `eventiSchema`):
   ```yaml
   ---
   title: "<Nome artista/evento> in concerto a <Comune>"
   description: <una frase riassuntiva, genere musicale incluso>
   dataInizio: YYYY-MM-DD
   dataFine: YYYY-MM-DD   # opzionale, solo se il festival dura più giorni
   luogo: "<piazza/palco, Comune (Roma)>"
   tipologiaEvento: Concerto
   ---

   <1-3 paragrafi in italiano, stile giornalistico locale: chi si esibisce, genere musicale, orari, contesto (es. festa patronale/sagra), come partecipare/biglietti se previsti>

   *Fonte: [Nome fonte](URL)*
   ```

5. **Crea sempre anche la versione inglese** in `src/content/eventi-en/<stesso-slug>.md`, stessa struttura e stesse date, con titolo/descrizione/corpo tradotti (vedi memoria "Keep English content aligned").

6. **Alla fine, riepiloga all'utente** i concerti trovati (artista/evento, genere, date, luogo, fonte) e proponili prima di scrivere i file, a meno che l'utente non abbia già chiesto esplicitamente di procedere senza conferma.

## Regole comuni

- Non fare commit/push automaticamente a meno che l'utente non lo chieda esplicitamente. Se lo chiede, usa il flusso git standard del progetto (git add solo dei file interessati, commit descrittivo, push).
- Ogni contenuto IT deve avere sempre il corrispettivo EN con lo stesso slug: non lasciare mai una collection disallineata dall'altra.
- Se non trovi concerti pop/rock/dance nuovi e verificati nel periodo richiesto, dillo esplicitamente senza modificare file: è un risultato normale, non un fallimento della ricerca.
