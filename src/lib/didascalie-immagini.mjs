// Negli articoli ogni immagine da sola in un paragrafo diventa una <figure> con la didascalia,
// presa dal testo alternativo: così basta scrivere ![didascalia](./foto.jpg) nel Markdown.
// La didascalia è nascosta agli screen reader, che leggono già lo stesso testo dall'alt.
// È un plugin HAST di Sätteri, il processore Markdown di Astro 7 (l'equivalente di un plugin rehype).

const isSpazio = (n) => n.type === 'text' && n.value.trim() === '';

export const didascalieImmagini = {
  name: 'didascalie-immagini',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      // Solo le collection articoli e articoli-en
      const percorso = decodeURIComponent(ctx.fileURL?.pathname ?? '');
      if (!/\/content\/articoli(-en)?\//.test(percorso)) return;

      const contenuto = node.children.filter((n) => !isSpazio(n));
      const img = contenuto[0];
      const alt = img?.properties?.alt;
      if (contenuto.length !== 1 || img.type !== 'element' || img.tagName !== 'img' || !alt) return;

      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['didascalia'] },
        children: [
          img,
          {
            type: 'element',
            tagName: 'figcaption',
            properties: { ariaHidden: 'true' },
            children: [{ type: 'text', value: alt }],
          },
        ],
      });
    },
  },
};
