// Autore delle foto che non ne indicano uno proprio (campo `autore` nel frontmatter)
export const AUTORE_PREDEFINITO = 'Redazione SVR Lovers';

/** Riga dei crediti di una foto, es. "📷 Livioandronico2013 · CC BY-SA 4.0". */
export function formatCredit(autore?: string, licenza?: string): string {
  const nome = autore || AUTORE_PREDEFINITO;
  return licenza ? `📷 ${nome} · ${licenza}` : `📷 ${nome}`;
}
