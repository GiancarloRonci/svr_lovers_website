---
name: aggiorna-news-comune
description: Controlla il sito del Comune di San Vito Romano (comune.sanvitoromano.rm.it) per nuove notizie/avvisi e aggiunge gli articoli mancanti alle collection news e news-en del sito. Usare quando l'utente chiede di "aggiornare le news del comune", "controllare nuove notizie del comune di San Vito Romano" o simili.
---

# Aggiorna news del Comune di San Vito Romano

Questa skill sincronizza le notizie pubblicate dal Comune di San Vito Romano con le collection Astro del sito (`src/content/news` e `src/content/news-en`).

## Passi

1. **Trova l'ultima notizia già presente sul sito.**
   Elenca i file in `src/content/news/*.md` e leggi il campo `data:` di ciascuno per individuare la data più recente già pubblicata.

2. **Recupera le notizie più recenti dal sito del Comune.**
   Il sito comunale (comune.sanvitoromano.rm.it) usa un CMS le cui pagine di categoria (`/novita/1-news`, `/novita/3-avviso`, ecc.) spesso mostrano solo un widget "in evidenza" cache-ato e NON riflettono le notizie più recenti. Il modo affidabile per trovare le notizie nuove è recuperare la **homepage** (`https://comune.sanvitoromano.rm.it`) con WebFetch, chiedendo esplicitamente di elencare *tutti* gli elementi notizia/avviso presenti in ogni sezione della pagina (non solo quelli "in evidenza"), con titolo, data e URL completo (pattern `/notizie/<id>/<slug>`).
   Se serve, prova anche browser automation (Claude in Chrome) se WebFetch non basta, ma WebFetch sulla homepage è di solito sufficiente.

3. **Confronta le date/URL trovati con quanto già presente nel repo.**
   Ogni notizia sul sito comunale ha un ID numerico crescente incorporato nell'URL (es. `3647564`) e una data di pubblicazione. Considera "nuova" solo una notizia con data successiva all'ultima già presente in `src/content/news`, e verifica che non esista già un file con lo stesso URL sorgente (cerca l'URL nei file esistenti con Grep prima di aggiungerla).

4. **Per ogni notizia nuova, apri la pagina dell'articolo** (`https://comune.sanvitoromano.rm.it/notizie/<id>/<slug>`) con WebFetch e chiedi il testo completo: titolo, data di pubblicazione, corpo, scadenze, contatti, documenti collegati.

5. **Scrivi il file Markdown in italiano** in `src/content/news/<slug-descrittivo>.md` seguendo lo schema Zod del progetto (vedi `src/content.config.ts`, `newsSchema`):
   ```yaml
   ---
   title: <titolo breve e chiaro>
   description: <una frase riassuntiva, stile giornalistico>
   data: YYYY-MM-DD
   ---

   <corpo dell'articolo in 1-3 paragrafi, tono giornalistico locale come negli altri file della collection>

   *Fonte: [Comune di San Vito Romano](<URL originale>)*
   ```
   Non copiare/incollare il testo del Comune parola per parola: riscrivilo in modo simile allo stile editoriale già usato negli altri file di `src/content/news` (frasi dirette, paragrafi brevi, dettagli pratici come scadenze e orari in evidenza).

6. **Crea SEMPRE anche la versione inglese** in `src/content/news-en/<stesso-slug>.md`, con lo stesso `data:` e la stessa struttura, traducendo titolo/descrizione/corpo. Questo è un requisito fisso del progetto: ogni contenuto IT deve avere il corrispettivo EN con lo stesso slug (vedi memoria "Keep English content aligned").

7. **Verifica** che i nuovi file abbiano frontmatter valido (title, description, data) e che lo slug del filename non contenga caratteri strani.

8. **Non fare commit/push automaticamente** a meno che l'utente non lo chieda esplicitamente. Se lo chiede, segui il flusso git standard del progetto (git add dei soli file nuovi, commit con messaggio descrittivo, push).

## Note

- Se non ci sono notizie nuove rispetto a quelle già presenti, dillo esplicitamente all'utente senza creare file.
- Se un articolo del Comune è molto tecnico/lungo (es. bandi con allegati), riassumilo mantenendo le informazioni chiave: scadenze, moduli richiesti, contatti/uffici di riferimento, link a documenti se rilevanti.
- Usa sempre l'anno corrente coerente con la data odierna quando interpreti date ambigue nel testo del Comune.
