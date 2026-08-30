---
title: "Esempio: percorso fotografico"
description: Un percorso dimostrativo che mostra come collegare foto a punti precisi lungo un tracciato GPX.
tipo: naturalistico
difficolta: facile
lunghezzaKm: 1.8
durata: "40min"
immagine: ./esempio-percorso-fotografico/foto1.jpg
gpx: /gpx/esempio-percorso-fotografico.gpx
foto:
  - lat: 41.9052
    lng: 12.4990
    immagine: ./esempio-percorso-fotografico/foto2.jpg
    didascalia: "Vista panoramica sulla vallata"
  - lat: 41.9059
    lng: 12.4988
    immagine: ./esempio-percorso-fotografico/foto3.jpg
    didascalia: "Area di sosta con fontana"
  - lat: 41.9052
    lng: 12.4978
    immagine: ./esempio-percorso-fotografico/foto4.jpg
    didascalia: "Rientro verso il punto di partenza"
---

Questo è un percorso di esempio (le coordinate e il tracciato GPX sono fittizi, non
un vero itinerario di San Vito Romano) che mostra come funziona l'abbinamento tra
foto e punti precisi della mappa.

Nel frontmatter di questo file, oltre al campo `gpx` per il tracciato, è presente
il campo `foto`: un elenco di punti, ciascuno con coordinate `lat`/`lng`,
un'immagine e una didascalia facoltativa. Sulla mappa questi punti compaiono come
marker con l'icona della fotocamera 📷: cliccandoci sopra si apre un popup con la
foto e la didascalia, nella posizione esatta in cui è stata scattata.

Per creare un percorso reale basta:

1. Esportare il tracciato `.gpx` dall'app di trekking e salvarlo in `public/gpx/`.
2. Indicare il percorso del file nel campo `gpx` del frontmatter.
3. Per ogni foto da geolocalizzare, aggiungere una voce in `foto` con le
   coordinate del punto in cui è stata scattata (rilevabili anche dai metadati
   EXIF della foto, se presenti) e l'immagine da mostrare.
