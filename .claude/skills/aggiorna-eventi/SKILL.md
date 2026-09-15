---
name: aggiorna-eventi
description: Cerca sagre, feste e altri eventi entro circa un'ora di macchina da San Vito Romano nelle prossime settimane, propone quelli nuovi da aggiungere alle collection eventi/eventi-en, e rimuove gli eventi ormai passati. Usare quando l'utente chiede di "aggiornare gli eventi", "cercare nuovi eventi nei dintorni", "eliminare gli eventi passati" o simili.
---

# Aggiorna eventi nei dintorni di San Vito Romano

Questa skill mantiene aggiornata la collection Astro `src/content/eventi` (e il suo gemello `src/content/eventi-en`) con gli eventi in programma entro circa un'ora di macchina da San Vito Romano.

Ha due modalità, spesso richieste insieme: **aggiungere eventi nuovi** e **rimuovere eventi passati**. Se l'utente non specifica, chiedi (o deduci dal contesto) quale delle due vuole, oppure fai entrambe.

## Contesto geografico

Comuni entro circa un'ora di macchina da San Vito Romano (Roma), da usare come riferimento per la ricerca: Palestrina, Zagarolo, Cave, Genazzano, Olevano Romano, Capranica Prenestina, Castel San Pietro Romano, Rocca di Cave, Guadagnolo, Bellegra, Roiate, San Cesareo, Colonna, Gallicano nel Lazio, Colleferro, Paliano, Subiaco, Canterano, Affile, Piglio, Serrone. Verifica sempre che il comune trovato sia plausibilmente entro un'ora (evita Roma centro, Frosinone, Latina o comuni oltre i Monti Ernici/Lepini a meno che l'utente non lo chieda).

## Modalità A — Cercare e aggiungere eventi nuovi

1. **Controlla cosa è già presente.** Elenca i file in `src/content/eventi/*.md` leggendo `title`, `dataInizio`, `dataFine`, `luogo` per sapere cosa è già coperto ed evitare duplicati.

2. **Cerca eventi nel periodo richiesto** (tipicamente dalla data odierna fino a una data limite indicata dall'utente, es. "fino al 15 ottobre"). Fonti utili trovate finora, in ordine di affidabilità:
   - Siti dei Comuni interessati (cerca "comune di <nome> eventi/novità/agenda" o la pagina "vivere il comune/eventi").
   - **NumeroZero** (numerozero.org) e **Monti Prenestini** (montiprenestini.info): testate locali che aggregano sagre/feste dei Castelli Romani e Prenestini, spesso più aggiornate delle pagine "categoria" dei siti comunali (che a volte mostrano un widget "in evidenza" cache-ato e non riflettono gli eventi più recenti — se capita, prova a recuperare la pagina di dettaglio diretta o cerca l'evento per nome).
   - Portali di sagre generalisti (es. sagreautentiche.it, itinerarinelgusto.it, sagr.it) utili per scoprire eventi ma da **verificare sempre con una fonte ufficiale** (sito del Comune, Pro Loco, sito dedicato all'evento) prima di pubblicare, perché spesso riportano date di edizioni passate o discordanti tra loro.
   - Usa WebSearch per query come `"<nome evento>" <comune> 2026 programma date`, poi WebFetch sulla fonte più autorevole trovata per confermare le date esatte.

3. **Scarta gli eventi con data incerta o contraddittoria** finché non trovi una fonte ufficiale che la confermi (es. il sito del Comune o della Pro Loco organizzatrice). Se più fonti danno date diverse, fidati della fonte istituzionale.

4. **Per ogni evento nuovo confermato**, crea il file in `src/content/eventi/<slug-descrittivo>.md` seguendo lo schema Zod (`src/content.config.ts`, `eventiSchema`):
   ```yaml
   ---
   title: "<nome evento>"
   description: <una frase riassuntiva>
   dataInizio: YYYY-MM-DD
   dataFine: YYYY-MM-DD   # opzionale, solo se l'evento dura più giorni
   luogo: "<luogo/piazza, Comune (Roma)>"   # opzionale ma quasi sempre presente
   tipologiaEvento: <categoria>   # opzionale
   ---

   <1-3 paragrafi in italiano, stile giornalistico locale, con dettagli pratici: orari, programma, come partecipare/prenotare>

   *Fonte: [Nome fonte](URL)*
   ```
   Valori tipici già usati per `tipologiaEvento`: Concerto, Evento Cittadino, Evento Culturale, Evento Religioso, Evento Scientifico, Evento Sportivo, Sagra Enogastronomica, Spettacolo Teatrale. Riusa uno di questi se pertinente, altrimenti conia una nuova categoria breve e coerente.

5. **Crea sempre anche la versione inglese** in `src/content/eventi-en/<stesso-slug>.md`, stessa struttura e stesse date, con titolo/descrizione/corpo tradotti (vedi memoria "Keep English content aligned").

6. **Alla fine, riepiloga all'utente** gli eventi trovati (titolo, date, luogo, fonte) e proponili prima di scrivere i file, a meno che l'utente non abbia già chiesto esplicitamente di procedere senza conferma.

## Modalità B — Rimuovere eventi passati

1. Elenca tutti i file in `src/content/eventi/*.md` con `dataInizio` e `dataFine`.
2. Confronta con la data odierna: un evento è "passato" se `dataFine` (o, in sua assenza, `dataInizio`) è precedente a oggi.
3. Segnala anche eventuali file anomali (es. senza `dataFine`, con date dell'anno sbagliato, o con contenuto placeholder/non compilato) invece di cancellarli automaticamente senza avviso.
4. Rimuovi con `git rm` sia il file in `src/content/eventi/` sia il corrispondente in `src/content/eventi-en/`.
5. Riepiloga all'utente cosa è stato rimosso e perché.

## Regole comuni

- Non fare commit/push automaticamente a meno che l'utente non lo chieda esplicitamente. Se lo chiede, usa il flusso git standard del progetto (git add/rm solo dei file interessati, commit descrittivo, push).
- Ogni contenuto IT deve avere sempre il corrispettivo EN con lo stesso slug: non lasciare mai una collection disallineata dall'altra.
- Se non trovi eventi nuovi, o non ci sono eventi passati da rimuovere, dillo esplicitamente senza modificare file.
