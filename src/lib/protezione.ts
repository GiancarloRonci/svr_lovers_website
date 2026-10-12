// Attività di Cultura&Turismo ancora in lavorazione: la scheda, il regolamento e la pagina di
// ringraziamento (IT ed EN) chiedono una password prima di mostrare il contenuto.
// Per riaprire una pagina a tutti basta togliere il suo slug da questo elenco.
export const ATTIVITA_PROTETTE = ['contest-fotografico-il-sole-ridisegna-i-contorni'];

// Impronta SHA-256 della password (scritta in minuscolo). Per cambiarla:
//   node -e "console.log(require('crypto').createHash('sha256').update('nuova-password').digest('hex'))"
// È una barriera per i visitatori, non una cifratura: il testo resta nel sorgente della pagina.
export const HASH_PASSWORD = '4df47c4b37e29d29aec78dea740e3241bc39ce25b51a31097239b8a75a125efe';

export function isProtetta(id: string): boolean {
  return ATTIVITA_PROTETTE.includes(id);
}
