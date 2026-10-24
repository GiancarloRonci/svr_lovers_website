// Link alla posizione di una foto su OpenStreetMap, con il segnaposto e lo zoom sul punto
export function osmUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
}

export function osmLabel(lang: 'it' | 'en'): string {
  return lang === 'en' ? '📍 See on the map' : '📍 Vedi sulla mappa';
}

// Per le foto senza posizione propria che usano quella del luogo: non è il punto esatto dello scatto
export function osmLabelLuogo(lang: 'it' | 'en'): string {
  return lang === 'en' ? '📍 The place on the map' : '📍 Il luogo sulla mappa';
}
