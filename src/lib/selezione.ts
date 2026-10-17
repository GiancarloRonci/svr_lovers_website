// Pagina riservata ai selezionatori di un contest fotografico: galleria anonima delle foto in
// concorso, like da mettere e togliere e classifica parziale. Accessi, foto e like stanno in un
// foglio Google gestito dallo script in `strumenti/selezione-contest/` (vedi ISTRUZIONI.md).

export interface Selezione {
  // Indirizzo della web app dello script Google (finisce con /exec). Vuoto = votazione non attiva.
  scriptUrl: string;
  // Fine delle votazioni (ora italiana). Lo script applica la stessa scadenza lato server.
  chiusura: string;
}

// Chiave: slug della scheda del contest in `src/content/associazione`
export const SELEZIONI: Record<string, Selezione> = {
  'contest-fotografico-il-sole-ridisegna-i-contorni': {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwEdpxqx6Rbr-dOki547m8tqyu0GtnxP4wwuTCdxqQ4ulhtXVU-A1s-bJn_YbZMp9qrYA/exec',
    chiusura: '2026-11-30T23:59:59+01:00',
  },
};
