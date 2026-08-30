---
title: "Example: photo trail"
description: A demo trail showing how to attach photos to precise points along a GPX track.
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
    didascalia: "Panoramic view over the valley"
  - lat: 41.9059
    lng: 12.4988
    immagine: ./esempio-percorso-fotografico/foto3.jpg
    didascalia: "Resting area with a fountain"
  - lat: 41.9052
    lng: 12.4978
    immagine: ./esempio-percorso-fotografico/foto4.jpg
    didascalia: "Heading back to the starting point"
---

This is a demo trail (the coordinates and GPX track are fictional, not a real
San Vito Romano route) showing how photos can be linked to precise points on
the map.

In this file's frontmatter, besides the `gpx` field for the track, there is a
`foto` field: a list of points, each with `lat`/`lng` coordinates, an image and
an optional caption. On the map these points show up as markers with a camera
icon 📷: clicking one opens a popup with the photo and caption, right at the
spot where it was taken.

To build a real trail:

1. Export the `.gpx` track from your trekking app and save it under `public/gpx/`.
2. Point the frontmatter's `gpx` field to that file.
3. For each photo you want to geotag, add an entry under `foto` with the
   coordinates of where it was taken (readable from the photo's EXIF metadata,
   if present) and the image to display.
