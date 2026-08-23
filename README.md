# Sito del paese

Sito statico realizzato con [Astro](https://astro.build): storia, luoghi, percorsi
di trekking urbano e naturalistico, eventi/feste e attività dell'associazione
culturale (scacchi, bocce, dama, proiezioni delle partite).

## Comandi

| Comando           | Azione                                          |
| ------------------ | ------------------------------------------------ |
| `npm install`       | Installa le dipendenze                           |
| `npm run dev`       | Avvia il server di sviluppo su `localhost:4321`  |
| `npm run build`     | Genera il sito statico in `./dist/`              |
| `npm run preview`   | Anteprima locale della build di produzione       |

## Struttura dei contenuti

Ogni sezione è una "content collection" con i file Markdown in
`src/content/<sezione>/`:

- `percorsi/` — percorsi di trekking (urbano o naturalistico)
- `storia/` — articoli storici
- `luoghi/` — località e attrazioni
- `eventi/` — ricordi di feste e iniziative
- `associazione/` — attività dell'associazione culturale (scacchi, bocce, dama, proiezioni)

Per aggiungere un nuovo contenuto, copia un file `.md` esistente nella cartella
della sezione, rinominalo e modifica i campi in cima al file (il "frontmatter",
tra i due `---`) e il testo sotto.

Campi disponibili per ogni sezione: vedi `src/content.config.ts`.

### Immagini

Aggiungi il campo `immagine: ./nome-file.jpg` nel frontmatter e metti il file
immagine nella stessa cartella del contenuto Markdown. Astro la ottimizza
automaticamente in fase di build.

### Tracciati GPX per i percorsi

1. Esporta il tracciato dalla tua app di trekking in formato `.gpx`.
2. Copia il file in `public/gpx/nome-percorso.gpx`.
3. Nel frontmatter del percorso aggiungi: `gpx: /gpx/nome-percorso.gpx`.

La mappa interattiva (OpenStreetMap + Leaflet) disegnerà automaticamente il
tracciato nella pagina di dettaglio del percorso.

## Pubblicazione su GitHub Pages

1. Crea un repository su GitHub e collega questa cartella:
   ```sh
   git remote add origin https://github.com/<utente>/<nome-repo>.git
   git branch -M main
   git push -u origin main
   ```
2. Nelle impostazioni del repository (**Settings → Pages**), imposta la sorgente
   su **GitHub Actions**: il workflow in `.github/workflows/deploy.yml` costruirà
   e pubblicherà il sito ad ogni push su `main`.
3. Modifica `astro.config.mjs` impostando `site` (e `base`, se il repo non si
   chiama `<utente>.github.io`) con l'URL definitivo del sito, come indicato nei
   commenti del file.
