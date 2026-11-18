---
title: "Cos'è un data catalog? L'indice della biblioteca per i tuoi dati"
description: "Un data catalog è l'elenco centrale e consultabile dei dati di un'organizzazione: dice quali dati esistono, cosa significano, come sono calcolati, da dove vengono, chi ne è responsabile e quanto ci si può fidare. Lo spieghiamo con l'esempio della biblioteca."
data: 2026-11-18
categoria: community
immagine: ./cos-e-un-data-catalog/data-catalog.webp
immagineIntera: true
copertinaBassa: true
---

Chiunque abbia passato un pomeriggio in una biblioteca sa che i libri, da soli, non bastano. Servono gli scaffali ordinati, le etichette sul dorso, le schede con autore, titolo e argomento, e soprattutto serve qualcuno a cui chiedere: il bibliotecario, che sa dove si trova un volume, se è aggiornato, se esiste un'edizione migliore. Senza tutto questo, anche la biblioteca più ricca diventa un magazzino di carta in cui si entra con una domanda e si esce con un mal di testa.

Con i dati succede esattamente la stessa cosa. Oggi qualunque organizzazione, da una grande azienda a un Comune, da un'associazione a un piccolo negozio, produce e conserva una quantità enorme di informazioni: fogli di calcolo, database, report, indicatori, tabelle scaricate da qualche gestionale. Il problema non è più avere i dati, ma ritrovarli, capirli e usarli con fiducia. È qui che entra in gioco il **data catalog**, il catalogo dei dati: in poche parole, l'indice della biblioteca per i tuoi dati.

## Una definizione semplice

Un data catalog è una **directory centrale e consultabile** che elenca i dati disponibili (i cosiddetti *data asset*), spiega che cosa sono e aiuta le persone a **trovare e usare il dato giusto con fiducia**.

Non è un nuovo database e non sostituisce i sistemi in cui i dati vengono effettivamente conservati. È piuttosto uno strato che sta sopra di essi e che raccoglie le informazioni *sui* dati, i cosiddetti metadati: come si chiama un dato, che cosa misura, come viene calcolato, da quale sistema arriva, quando è stato aggiornato l'ultima volta, chi ne è responsabile e quanto è affidabile. Proprio come la scheda di una biblioteca non contiene il libro, ma dice tutto quello che serve per trovarlo e decidere se è quello giusto.

L'obiettivo finale si riassume in tre parole: **trovare, capire, usare**. E, come conseguenza, tre valori che ogni organizzazione cerca nei propri dati: **qualità**, **fiducia** e **valore**.

## L'analogia della biblioteca

Per capire davvero a cosa serve un catalogo, conviene immaginare due scenari.

### Senza catalogo

Immaginate di entrare in una biblioteca senza schedario, senza cartelli e senza personale. I libri ci sono, migliaia, ma sono ammucchiati su tavoli e scaffali senza un ordine evidente. Cosa succede?

- **Non sapete quali libri esistono.** Forse il volume che cercate c'è, forse no. L'unico modo per scoprirlo è frugare tra le pile, sperando nella fortuna.
- **Lo stesso titolo significa cose diverse per persone diverse.** Due libri intitolati "Storia del paese" possono raccontare paesi diversi o epoche diverse, e nessuno ve lo dice.
- **Vi affidate al passaparola.** "Chiedi a Mario, lui l'altra volta l'aveva trovato." Ma Mario oggi non c'è, e forse ricorda male.
- **Rischiate di usare il libro sbagliato o superato.** Prendete il primo volume che sembra giusto, senza sapere che ne esiste un'edizione più recente e corretta.

Nel mondo dei dati questi problemi sono quotidiani. Un collega chiede "quanti clienti abbiamo?" e riceve tre risposte diverse da tre uffici diversi, perché ognuno conta in modo diverso: chi include i clienti inattivi, chi no, chi conta le famiglie e chi le singole persone. Un report viene costruito su una tabella che nessuno aggiorna da due anni. Una persona nuova impiega settimane solo per capire dove si trovano le informazioni che le servono. Tempo perso, decisioni prese su basi fragili, discussioni infinite su numeri che non tornano.

### Con un data catalog

Ora immaginate la stessa biblioteca, ma con un catalogo ben fatto: un terminale con una barra di ricerca, schede chiare, un bibliotecario disponibile. Cercate "vendite", "clienti" o "tasso di raccolta differenziata" e trovate subito le voci giuste, ciascuna con un segno di spunta che ne indica lo stato. Adesso potete:

- **Trovare quali dati esistono**: indicatori, dataset, report, tabelle, tutti elencati in un unico posto.
- **Capirli**: per ogni voce ci sono la definizione, la formula, le regole con cui è costruita.
- **Sapere a chi chiedere**: ogni dato ha un responsabile, il *data owner* o il *data steward*, il "bibliotecario" di quel pezzo di conoscenza.
- **Fidarvi**: il catalogo indica lo stato del dato, la sua qualità e le indicazioni d'uso. Sapete se è certificato, se va usato con cautela o se è meglio lasciarlo stare.

La differenza tra i due scenari non sta nei dati, che sono gli stessi. Sta nella possibilità di orientarsi.

## Cosa trovi in un catalogo

Un buon data catalog organizza le informazioni su ogni dato in alcune sezioni ricorrenti. Ognuna ha il suo corrispettivo nel mondo della biblioteca.

### 1. Gli asset di dati

È l'elenco dei dati disponibili, come la collezione di una biblioteca ordinata dalla A alla Z. Qui compaiono le tabelle dei database, i file, i report, i cruscotti, gli indicatori. Il solo fatto di sapere che un certo dato *esiste* è già un enorme passo avanti: quante volte capita di ricostruire da zero un'informazione che qualcun altro aveva già calcolato, magari meglio?

### 2. La definizione

Una descrizione chiara di cosa significa il dato: il "riassunto" del libro, quello che si legge sulla quarta di copertina. Che cosa intendiamo per "cliente attivo"? Che cosa conta come "presenza" a un evento? Che cosa vuol dire "residente" in una statistica comunale? La definizione è il punto in cui un'organizzazione decide di parlare una lingua sola. Sembra un dettaglio, ma è spesso la parte più preziosa del catalogo, perché la maggior parte dei disaccordi sui numeri nasce da definizioni diverse, non da calcoli sbagliati.

### 3. Formula e regole

Come viene calcolato il dato e quali regole di business lo governano: il "contenuto e metodo" del libro. Se il tasso di raccolta differenziata è dato dal rapporto tra rifiuti differenziati e rifiuti totali, quali rifiuti entrano nel totale? Gli ingombranti contano? E gli scarti del compostaggio domestico? Scrivere la formula nero su bianco permette a chiunque di verificare il risultato, di rifarlo e di capire perché due numeri apparentemente simili non coincidono.

### 4. Origine e lineage

Da dove viene il dato e come è stato costruito: l'"origine e il viaggio" del libro. In gergo si chiama *lineage*, la genealogia del dato. Un indicatore che compare in un report è spesso il risultato di una lunga catena di passaggi: un modulo compilato, un gestionale che lo registra, un'estrazione notturna, una tabella intermedia, un calcolo finale. Conoscere questa catena serve a due cose. La prima è la fiducia: so da dove arriva il numero e posso valutarne la solidità. La seconda è la manutenzione: se cambia qualcosa all'inizio della catena, so subito quali report e quali indicatori ne saranno influenzati.

### 5. Owner e steward

La persona da contattare per le domande: il "bibliotecario responsabile" di quello scaffale. Il *data owner* è chi ha la responsabilità del dato dal punto di vista del business, cioè chi decide cosa significa e come va usato; il *data steward* è chi se ne prende cura nel quotidiano, ne controlla la qualità e risponde ai dubbi. Avere un nome e un cognome accanto a ogni dato cambia tutto: invece di girare per uffici chiedendo "chi sa qualcosa di questa tabella?", si sa esattamente a chi scrivere.

### 6. Stato e qualità

Il livello di validazione del dato, una sorta di bollino. Le etichette più comuni sono tre: **affidabile** (il dato è certificato e può essere usato tranquillamente), **da usare con cautela** (il dato è utile ma ha limiti noti, per esempio è incompleto o aggiornato di rado), **da non usare** (il dato è obsoleto, sostituito o sbagliato, e resta nel catalogo solo perché nessuno lo usi per errore). Questa sezione è quella che trasforma il catalogo da semplice elenco a strumento di fiducia.

## I benefici

Perché un'organizzazione dovrebbe investire tempo nel costruire e mantenere un catalogo? I vantaggi si possono riassumere in tre grandi capitoli.

### Risparmiare tempo

Trovare rapidamente il dato giusto. Gli studi sul lavoro degli analisti indicano da anni che una parte rilevante della loro giornata se ne va non nell'analisi vera e propria, ma nella ricerca e nella verifica dei dati. Un catalogo riduce drasticamente questo tempo: la ricerca diventa una questione di secondi, e l'inserimento di una persona nuova in un gruppo di lavoro si accorcia da settimane a giorni. Inoltre si evitano i doppioni, cioè lo stesso indicatore calcolato tre volte da tre persone diverse, con tre risultati leggermente diversi.

### Parlare la stessa lingua

Definizioni condivise, chiare e coerenti tra i diversi gruppi di lavoro. Quando l'ufficio commerciale e l'amministrazione usano la stessa definizione di "cliente", le riunioni smettono di trasformarsi in discussioni su quale numero sia quello giusto e tornano a occuparsi di ciò che conta: cosa fare. Il catalogo diventa una sorta di vocabolario comune, il glossario ufficiale dell'organizzazione, a cui tutti possono fare riferimento.

### Prendere decisioni migliori

Usare dati affidabili e ben compresi, con fiducia. Una decisione è buona quanto le informazioni su cui si basa. Sapere che un indicatore è certificato, conoscere la sua formula e la sua origine, avere un responsabile a cui chiedere chiarimenti: tutto questo riduce il rischio di scegliere sulla base di un numero sbagliato o frainteso. E quando qualcuno chiede "da dove viene questo dato?", la risposta è pronta.

## Un esempio vicino a noi

Proviamo a calare il discorso in una realtà che conosciamo bene: un piccolo Comune come San Vito Romano. Anche un ente di poche migliaia di abitanti gestisce moltissimi dati: l'anagrafe, i tributi, la raccolta dei rifiuti, le pratiche edilizie, le presenze turistiche, gli eventi, le scuole, i servizi sociali.

Prendiamo un indicatore che compare spesso nei notiziari locali: il **tasso di raccolta differenziata**. In un catalogo dei dati comunali, la sua scheda potrebbe contenere:

- **Asset**: "Percentuale di raccolta differenziata annua".
- **Definizione**: quota dei rifiuti urbani raccolti in modo differenziato sul totale dei rifiuti urbani prodotti nel territorio comunale in un anno.
- **Formula e regole**: rifiuti differenziati diviso rifiuti totali, per cento, secondo i criteri di calcolo stabiliti a livello nazionale e regionale, con l'indicazione di quali frazioni sono incluse.
- **Origine**: i dati di pesatura comunicati dal gestore del servizio, poi trasmessi agli enti che li certificano.
- **Responsabile**: l'ufficio comunale che segue il servizio di igiene urbana.
- **Stato**: affidabile per gli anni già certificati, da usare con cautela per l'anno in corso, ancora provvisorio.

Con una scheda così, un cittadino, un consigliere comunale o un giornalista locale sanno esattamente cosa stanno guardando. Non ci sono più discussioni su "il numero vero", perché la scheda dice da dove viene, come si calcola e quanto è definitivo.

In fondo, anche un sito come il nostro funziona un po' come un catalogo: raccoglie luoghi, percorsi, eventi, storie e notizie di San Vito Romano, li descrive, li organizza in categorie e li rende facili da trovare. Senza un indice, tutte queste informazioni resterebbero sparse tra ricordi, gruppi social e passaparola. Con un indice, diventano un patrimonio che chiunque può consultare.

## Come si costruisce un catalogo

Non serve partire con un progetto enorme. Le esperienze migliori seguono di solito alcuni passi semplici.

1. **Partire dai dati più usati.** Invece di censire tutto, si comincia dai dieci o venti indicatori che compaiono più spesso nei report e nelle riunioni. Sono quelli che generano più domande e più discussioni.
2. **Scrivere le definizioni insieme.** Le definizioni non si calano dall'alto: si concordano tra chi produce il dato e chi lo usa. È un lavoro che richiede qualche riunione, ma ripaga moltissimo.
3. **Dare un nome a ogni responsabile.** Ogni dato del catalogo deve avere un owner e, se possibile, uno steward. Un dato senza responsabile è un dato che prima o poi nessuno aggiornerà più.
4. **Indicare lo stato con onestà.** È meglio dichiarare che un dato è "da usare con cautela" piuttosto che lasciar credere che sia perfetto. La fiducia nasce dalla trasparenza, non dalla perfezione.
5. **Tenerlo vivo.** Un catalogo non è un documento da scrivere una volta e archiviare. I dati cambiano, nascono nuovi indicatori, altri diventano obsoleti. Serve un minimo di manutenzione periodica, esattamente come in una biblioteca si aggiungono le nuove acquisizioni e si tolgono i volumi rovinati.

Esistono strumenti software dedicati, alcuni molto sofisticati, capaci di leggere automaticamente i database e ricostruire la genealogia dei dati. Ma per iniziare può bastare anche un foglio di calcolo condiviso o una pagina wiki ben organizzata. Lo strumento conta meno dell'abitudine: quella di descrivere i dati, di dare loro un responsabile e di dichiararne la qualità.

## Gli errori da evitare

Anche i cataloghi possono fallire. I casi più frequenti sono tre. Il primo è il **catalogo cimitero**: costruito con entusiasmo, mai aggiornato, pieno di schede che descrivono dati ormai scomparsi. Il secondo è il **catalogo enciclopedia**: si cerca di descrivere tutto, fino all'ultima colonna dell'ultima tabella, e il lavoro non finisce mai. Il terzo è il **catalogo senza padroni**: tante schede, nessun nome, nessuno a cui chiedere. In tutti e tre i casi il problema non è tecnico ma organizzativo, e la soluzione è la stessa: partire in piccolo, assegnare responsabilità chiare e considerare il catalogo un servizio, non un progetto con una data di fine.

## In sintesi

Un data catalog è per i dati ciò che lo schedario e il bibliotecario sono per i libri. Non crea nuove informazioni, ma rende utilizzabili quelle che già esistono. Dice **quali dati ci sono**, **che cosa significano**, **come sono calcolati**, **da dove vengono**, **a chi chiedere** e **quanto ci si può fidare**.

I risultati si vedono su tre fronti: si **risparmia tempo**, perché il dato giusto si trova in pochi secondi; si **parla la stessa lingua**, perché le definizioni sono condivise; si **prendono decisioni migliori**, perché ci si basa su dati affidabili e compresi.

In un mondo in cui i dati crescono ogni giorno, la vera ricchezza non è possederne tanti, ma sapere dove sono e di quali fidarsi. Proprio come in una buona biblioteca, dove il valore non sta solo nel numero dei volumi, ma nella possibilità di trovare, in pochi minuti, il libro giusto.
