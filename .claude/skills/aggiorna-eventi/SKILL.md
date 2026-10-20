---
name: aggiorna-eventi
description: Cerca sagre, feste e altri eventi entro circa un'ora di macchina da San Vito Romano nelle prossime settimane (incluse le partite in casa della Sanvitese Calcio a 5), propone quelli nuovi da aggiungere alle collection eventi/eventi-en, verifica se gli eventi già inseriti delle prossime due settimane hanno aggiornamenti importanti (rinvii, annullamenti, orari, programma), rimuove gli eventi ormai passati e aggiorna l'articolo "Il weekend" con i consigli per il prossimo fine settimana. Usare quando l'utente chiede di "aggiornare gli eventi", "cercare nuovi eventi nei dintorni", "aggiungere le partite della Sanvitese", "eliminare gli eventi passati" o simili.
---

# Aggiorna eventi nei dintorni di San Vito Romano

Questa skill mantiene aggiornata la collection Astro `src/content/eventi` (e il suo gemello `src/content/eventi-en`) con gli eventi in programma entro circa un'ora di macchina da San Vito Romano.

Ha tre modalità, spesso richieste insieme: **aggiungere eventi nuovi** (A), **rimuovere eventi passati** (B) e **verificare aggiornamenti agli eventi già inseriti nelle prossime due settimane** (C). Se l'utente chiede genericamente di "aggiornare gli eventi", esegui tutte e tre; altrimenti fai quella richiesta.

**Ogni volta** che la skill gira, qualunque modalità sia stata richiesta, alla fine esegui anche la modalità D: **aggiornare l'articolo "Il weekend"** con i consigli per il prossimo fine settimana, in base agli eventi come risultano dopo le modifiche.

## Contesto geografico

Comuni entro circa un'ora di macchina da San Vito Romano (Roma), da usare come riferimento per la ricerca: Palestrina, Zagarolo, Cave, Genazzano, Olevano Romano, Capranica Prenestina, Castel San Pietro Romano, Rocca di Cave, Guadagnolo, Bellegra, Roiate, Gerano, San Cesareo, Colonna, Gallicano nel Lazio, Colleferro, Paliano, Subiaco, Monte Livata (frazione montana di Subiaco: eventi escursionistici, sciistici e sportivi legati all'altopiano), Canterano, Affile, Jenne (borgo della Valle dell'Aniene nel Parco dei Monti Simbruini: laboratori all'Antico Forno, iniziative del Parco), Piglio, Serrone, Pisoniano, Rocca Santo Stefano, Cerreto Laziale, Ciciliano, Rocca Canterano, Sambuci, Agosta, Marano Equo, Arcinazzo Romano, Castel Madama, Anticoli Corrado, Poli, Casape, San Gregorio da Sassola, Valmontone, Labico, Artena, Acuto, Anagni, Segni. Verifica sempre che il comune trovato sia plausibilmente entro un'ora (evita Roma centro, Frosinone, Latina o comuni oltre i Monti Ernici/Lepini a meno che l'utente non lo chieda).

## Modalità A — Cercare e aggiungere eventi nuovi

1. **Controlla cosa è già presente.** Elenca i file in `src/content/eventi/*.md` leggendo `title`, `dataInizio`, `dataFine`, `luogo` per sapere cosa è già coperto ed evitare duplicati.

2. **Cerca eventi nel periodo richiesto** (tipicamente dalla data odierna fino a una data limite indicata dall'utente, es. "fino al 15 ottobre"). Fonti utili trovate finora, in ordine di affidabilità:
   - Siti dei Comuni interessati (cerca "comune di <nome> eventi/novità/agenda" o la pagina "vivere il comune/eventi").
   - **NumeroZero** (numerozero.org) e **Monti Prenestini** (montiprenestini.info): testate locali che aggregano sagre/feste dei Castelli Romani e Prenestini, spesso più aggiornate delle pagine "categoria" dei siti comunali (che a volte mostrano un widget "in evidenza" cache-ato e non riflettono gli eventi più recenti — se capita, prova a recuperare la pagina di dettaglio diretta o cerca l'evento per nome).
   - **CAI Palestrina** (sezione del Club Alpino Italiano di Palestrina): controlla il sito/pagina eventi e i canali social (Facebook/Instagram) per escursioni, camminate e altre iniziative in programma. Trattale come evento di tipologia "Escursione"/"Evento Sportivo" a seconda del caso, con luogo di partenza/ritrovo se indicato.
   - **Parco Naturale Regionale Monti Simbruini** ([eventi e iniziative](https://www.parcomontisimbruini.it/eventi-iniziative.php), con filtro per comune, es. `?id_comune=58048` per Jenne e `?id_comune=58103` per Subiaco/Monte Livata): escursioni, laboratori e serate a Subiaco, Monte Livata e Jenne, con orari, costi e contatti nella pagina di dettaglio `iniziativa.php?id=...`. Scarta i comuni del Parco troppo lontani (Filettino, Vallepietra, Camerata Nuova).
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
   minutiAuto: <minuti>   # minuti di auto da San Vito Romano; da omettere per gli eventi a San Vito
   tipologiaEvento: <categoria>   # opzionale
   ---

   <1-3 paragrafi in italiano, stile giornalistico locale, con dettagli pratici: orari, programma, come partecipare/prenotare>

   *Fonte: [Nome fonte](URL)*
   ```
   Valori tipici già usati per `tipologiaEvento`: Concerto, Evento Cittadino, Evento Culturale, Evento Religioso, Evento Scientifico, Evento Sportivo, Sagra Enogastronomica, Spettacolo Teatrale. Riusa uno di questi se pertinente, altrimenti conia una nuova categoria breve e coerente.

   **`minutiAuto`** è il tempo di percorrenza in auto da San Vito Romano, mostrato accanto al luogo ("circa 20 min in auto da San Vito"). Riusa il valore di un evento già presente nello stesso luogo o comune; per un luogo nuovo calcolalo con `node .claude/skills/aggiorna-eventi/drive-time.mjs "<Comune>, Roma, Italia"` (per un punto di ritrovo fuori paese indica il punto, es. `"Campo dell'Osso, Subiaco, Italia"`) e controlla che il luogo trovato sia quello giusto. Non inventare il valore: se il calcolo non riesce, ometti il campo e segnalalo. Per gli eventi a San Vito Romano (partite della Sanvitese comprese) il campo non va messo. Il valore è identico nel file IT e in quello EN.

5. **Crea sempre anche la versione inglese** in `src/content/eventi-en/<stesso-slug>.md`, stessa struttura e stesse date, con titolo/descrizione/corpo tradotti (vedi memoria "Keep English content aligned").

6. **Partite in casa della Sanvitese Calcio a 5.** Oltre a sagre e feste, cerca sempre le partite **casalinghe** (non le trasferte) della ASD Sanvitese Calcio a 5, la squadra di futsal di San Vito Romano, che rientrano nel periodo richiesto.
   - **Fonte principale:** il PDF ufficiale dei calendari di calcio a 5 del Comitato Regionale LND Lazio (per il 2026/27: [Calendario-completo-C1_CFemminile_U19.pdf](https://lazio.lnd.it/wp-content/uploads/2026/09/Calendario-completo-C1_CFemminile_U19.pdf), annunciato su lazio.lnd.it nella sezione Calcio a Cinque; per le stagioni successive cerca il nuovo PDF). Scaricalo con `curl` e convertilo con `pdftotext -layout`, poi cerca "SANVITESE": le partite in casa sono quelle in cui la Sanvitese è scritta per prima. Il PDF riporta la data di ogni giornata ma non orario né impianto.
   - **Altre fonti:** calendario della squadra su tuttocampo.it (visibile solo agli utenti registrati: non fare login, usalo solo se accessibile) (pagina `Lazio/CalcioA5SerieC1/Girone<X>/Squadra/SanviteseCalcioa5/1105941/Calendario`; verifica stagione e girone correnti, perché cambiano di anno in anno), pagina Facebook ufficiale [facebook.com/Sanvitesecalcioa5](https://www.facebook.com/Sanvitesecalcioa5) e scheda sul sito del [Comune](https://comune.sanvitoromano.rm.it/luoghi/2453724/sanvitese-calcio-a5). tuttocampo.it risponde 403 a WebFetch: usa gli snippet di WebSearch (es. `Sanvitese Calcio a 5 calendario <stagione> tuttocampo`), oppure, se disponibile, il browser (Claude in Chrome) per leggere la pagina; se non riesci a ottenere il calendario, chiedi all'utente invece di inventare date.
   - **Un file per partita**, solo con data (e orario, se noto) confermati. Slug: `sanvitese-calcio-a5-<avversario>-<YYYY-MM-DD>`.
   - **Frontmatter:** `title: "Sanvitese Calcio a 5 - <Avversario>"`, `tipologiaEvento: Evento Sportivo`, solo `dataInizio` (niente `dataFine`), `luogo: "Campetto di Calcio a 5, San Vito Romano (Roma)"` (in inglese `(Rome)`), che è l'impianto delle gare interne indicato dall'utente; se una fonte ufficiale indica un campo diverso per una singola partita, usa quello. Se l'orario non è noto, scrivilo nel corpo e invita a seguire la pagina Facebook della squadra.
   - **Corpo:** 1-2 frasi con campionato e girone, giornata, orario del calcio d'inizio e invito a tifare la squadra del paese; chiudi con la riga `*Fonte: ...*` come per gli altri eventi.
   - Anche per le partite crea la versione inglese in `eventi-en` (title: `"Sanvitese Calcio a 5 vs <Opponent>"`, `tipologiaEvento: Sports Event`) e, se una partita viene rinviata, aggiorna o rimuovi il file corrispondente.

7. **Alla fine, riepiloga all'utente** gli eventi trovati (titolo, date, luogo, fonte) e proponili prima di scrivere i file, a meno che l'utente non abbia già chiesto esplicitamente di procedere senza conferma.

## Modalità B — Rimuovere eventi passati

1. Elenca tutti i file in `src/content/eventi/*.md` con `dataInizio` e `dataFine`.
2. Confronta con la data odierna: un evento è "passato" se `dataFine` (o, in sua assenza, `dataInizio`) è precedente a oggi.
3. Segnala anche eventuali file anomali (es. senza `dataFine`, con date dell'anno sbagliato, o con contenuto placeholder/non compilato) invece di cancellarli automaticamente senza avviso.
4. Rimuovi con `git rm` sia il file in `src/content/eventi/` sia il corrispondente in `src/content/eventi-en/`.
5. Riepiloga all'utente cosa è stato rimosso e perché.

## Modalità C — Verificare aggiornamenti agli eventi già inseriti

Da eseguire ogni volta che la skill gira (insieme alle modalità A e B), limitatamente agli eventi delle **prossime due settimane**.

1. Seleziona i file in `src/content/eventi/*.md` non ancora passati la cui `dataInizio` cade entro 14 giorni da oggi (includi anche gli eventi già in corso, cioè con `dataFine` successiva a oggi).
2. Per ciascuno, ricontrolla la fonte citata nella riga `*Fonte: ...*` e, se serve, cerca l'evento per nome (WebSearch) per trovare notizie più recenti dal Comune, dalla Pro Loco o dall'organizzatore. Per le partite della Sanvitese Calcio a 5 controlla il calendario LND Lazio e la pagina Facebook della squadra.
3. Cerca solo **integrazioni importanti**, in ordine di priorità:
   - rinvio, cambio di data o annullamento;
   - cambio di luogo;
   - orari prima non noti (es. calcio d'inizio, orario di partenza di un'escursione);
   - programma dettagliato pubblicato, ospiti o concerti annunciati, apertura delle prenotazioni, costi.
   Ignora differenze irrilevanti (formulazioni diverse, dettagli minori già coperti dal testo).
4. **Non modificare nulla in automatico.** Nel riepilogo finale elenca, in una sezione separata da eventi nuovi e rimossi, ogni evento da aggiornare con: modifica proposta, testo attuale → testo nuovo (in sintesi) e fonte. Applica le modifiche solo dopo la conferma dell'utente.
5. Quando applichi una modifica, aggiorna sempre insieme il file IT e quello EN con lo stesso slug (frontmatter e corpo), aggiorna la riga `*Fonte: ...*` se la notizia viene da una fonte diversa e, in caso di annullamento, rimuovi entrambi i file con `git rm` segnalandolo nel riepilogo.
6. Se non trovi aggiornamenti rilevanti, dillo esplicitamente in una riga.

## Modalità D — Aggiornare l'articolo "Il weekend"

Gli articoli "Il weekend" sono articoli della collection `articoli` (e `articoli-en`) con `categoria: weekend`: compaiono nella sezione "Il weekend" di Cultura&Turismo. Vanno aggiornati **dopo** aver scritto le modifiche delle modalità A, B e C, così l'articolo riflette gli eventi effettivamente pubblicati.

1. **Individua il weekend.** Da lunedì a giovedì è il venerdì-domenica successivo; da venerdì a domenica è quello in corso. Se il venerdì o il lunedì sono festivi (es. 1° novembre, 8 dicembre), includili nel weekend lungo.
2. **Slug:** `weekend-<giorno-inizio>-<giorno-fine>-<mese>-<anno>`, es. `weekend-23-25-ottobre-2026`; se il weekend scavalca il mese, `weekend-30-ottobre-1-novembre-2026`. Stesso slug in `articoli-en`.
3. **Se l'articolo di quel weekend esiste già**, aggiornalo: aggiungi gli eventi nuovi pertinenti, togli quelli annullati o rinviati, correggi orari e dettagli cambiati. Lascia invariato il campo `data`. **Se non esiste**, crealo nuovo. Non modificare mai gli articoli dei weekend già passati: restano come archivio, non vanno cancellati.
4. **Scelta degli eventi:** tutti i file di `src/content/eventi` che si svolgono in almeno un giorno del weekend (eventi di un giorno in quella data, o eventi su più giorni il cui intervallo copre il weekend). Non serve citarli tutti se sono molti: privilegia quelli a San Vito Romano (sempre, partite della Sanvitese comprese), le sagre e gli eventi gratuiti o più vicini, e raggruppa quelli simili (es. le escursioni sui Simbruini).
5. **Struttura** (vedi `src/content/articoli/weekend-23-25-ottobre-2026.md` come modello):
   ```yaml
   ---
   title: "Il weekend: <tema in poche parole> (<gg>-<gg> <mese>)"
   description: "<una o due frasi con gli appuntamenti principali>"
   data: YYYY-MM-DD   # giorno in cui l'articolo è stato creato
   categoria: weekend
   ---
   ```
   Poi un'introduzione breve (con eventuali note pratiche: cambio dell'ora, festività, meteo), una sezione `##` per giorno (Venerdì, Sabato, Domenica), un **consiglio della settimana** evidenziato (di preferenza un evento a San Vito), la riga finale **"Se avete solo mezza giornata"** e la chiusura che rimanda alle schede degli [eventi](/eventi/) per orari e contatti.
6. **Link:** ogni evento citato ha il link alla sua scheda, `/eventi/<slug>` nel file IT e `/en/eventi/<slug>` in quello EN. Linka solo slug che esistono in entrambe le collection (controllalo prima di finire). Quando un evento viene poi rimosso, la pagina trasforma da sola il suo link in testo semplice: non serve ritoccare l'articolo.
7. **Stile:** italiano scorrevole, tono da consiglio tra compaesani, frasi brevi; orari e prenotazioni solo quando sono utili a decidere (es. scadenza delle iscrizioni). Non inventare dettagli che non sono nelle schede degli eventi.
8. **Versione inglese** in `src/content/articoli-en/<stesso-slug>.md` con titolo `"The Weekend: ... (<dd>-<dd> <Month>)"`, stesse sezioni e stessi eventi, link con prefisso `/en/`.
9. **Nel riepilogo finale** indica se l'articolo è stato creato o aggiornato e quali eventi hai aggiunto o tolto. Non serve una conferma separata: l'articolo va aggiornato insieme agli eventi, e l'utente lo rivede nel riepilogo prima del commit.

## Regole comuni

- Non fare commit/push automaticamente a meno che l'utente non lo chieda esplicitamente. Se lo chiede, usa il flusso git standard del progetto (git add/rm solo dei file interessati, commit descrittivo, push).
- Ogni contenuto IT deve avere sempre il corrispettivo EN con lo stesso slug: non lasciare mai una collection disallineata dall'altra.
- Se non trovi eventi nuovi, o non ci sono eventi passati da rimuovere, dillo esplicitamente senza modificare file.
