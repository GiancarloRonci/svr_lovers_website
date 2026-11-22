---
name: aggiorna-cinema
description: Aggiorna la sezione "Al cinema" del sito (/cinema e /en/cinema) con i film in programmazione e gli orari nei cinema più vicini a San Vito Romano, e cerca eventuali nuove sale entro circa un'ora di macchina. Usare quando l'utente chiede di "aggiornare i cinema", "aggiornare i film in programmazione", "cosa danno al cinema" o simili.
---

# Aggiorna i film in programmazione nei cinema vicini

La sezione "Al cinema" (nel menu Cultura&Turismo) legge la collection Astro `src/content/cinema` (schema in `src/content.config.ts`, collection `cinema`; componente `src/components/CinemaList.astro`). Ogni sala è un file `.md` con solo frontmatter. I dati non hanno testo da tradurre, quindi **la collection è unica** e la usano sia `/cinema` sia `/en/cinema`: qui non serve una versione `-en`.

## Sale attuali

| File | Sala | Fonte della programmazione |
|---|---|---|
| `ariston-colleferro.md` | Multisala Ariston, Colleferro (35 min) | https://www.mymovies.it/cinema/roma/colleferro/5273/ (in alternativa https://www.comingsoon.it/cinema/roma/ariston-colleferro/424/ o http://www.multisale-ariston.it) |
| `giuseppetti-tivoli.md` | Cinema Teatro Giuseppetti, Tivoli (30 min) | https://www.mymovies.it/cinema/roma/tivoli/5293/ (in alternativa https://www.comingsoon.it/cinema/roma/giuseppetti-tivoli/567/) |
| `the-space-guidonia.md` | The Space Cinema Guidonia (45 min) | https://www.comingsoon.it/cinema/roma/the-space-cinema-guidonia-guidonia-montecelio/441/ |

A novembre 2026 non risultavano sale con film in programmazione a Valmontone, Subiaco, Palestrina, Zagarolo, Anagni e Fiuggi. Ricontrollali ogni tanto: `https://www.mymovies.it/cinema/roma/<comune>/` e `https://www.comingsoon.it/cinema/roma/<comune>/` (per Fiuggi e Anagni la provincia è `frosinone`).

## Procedura

1. **Leggi la programmazione di ogni sala** dalla fonte indicata nel file (`fonte.url`), con WebFetch o con l'agente `web-fetch`. Chiedi di riportare **solo gli orari letti direttamente nella pagina**, non riassunti. Le pagine "ora nelle sale" o i widget generici del sito non valgono: servono i film di quella sala.
2. **Riscrivi il blocco `film`** con i titoli del giorno, ciascuno con i suoi `orari` nel formato `"HH:MM"` (il punto diventa due punti: `21.30` → `"21:30"`). Se un film è in programmazione ma la fonte non ne mostra gli orari, lascialo senza `orari`: la pagina mostra "orari sul sito della sala". **Non inventare né dedurre orari.**
3. **Aggiorna `aggiornato`** con il giorno a cui si riferiscono gli orari (di solito oggi). Se la data è più vecchia di 7 giorni rispetto alla build, la pagina mostra l'avviso "potrebbe non essere più aggiornata".
4. Se una sala non ha film, lascia `film: []`. Se ha chiuso, chiedi all'utente prima di togliere il file.
5. **Nuove sale.** Se l'utente lo chiede, o se trovi una sala attiva in un comune entro circa un'ora da San Vito, crea un nuovo file `<nome>-<comune>.md` con lo stesso schema. Calcola `minutiAuto` con `node .claude/skills/aggiorna-eventi/drive-time.mjs "<indirizzo>, <comune>, Italia"` (sul PC Ospite usa il Node portable). Se una fonte non mostra l'indirizzo o le due fonti non concordano, verifica con il risultato di Nominatim dello script.
6. **Riepiloga all'utente** sala per sala: numero di film, eventuali film senza orari, fonti non raggiungibili.

## Schema del file

```yaml
---
nome: Multisala Ariston
comune: Colleferro
indirizzo: Via degli Atleti 5, Colleferro Scalo
telefono: "389 881 5970"      # facoltativo, tra virgolette
sito: http://www.multisale-ariston.it   # facoltativo
minutiAuto: 35
sale: 6                        # facoltativo
aggiornato: 2026-11-22
fonte:
  nome: MYmovies
  url: https://www.mymovies.it/cinema/roma/colleferro/5273/
film:
  - titolo: Se domani non torno
    orari: ["18:50", "21:00"]
  - titolo: Dio ride            # senza orari
---
```

Ordina i film come nella fonte o, per i multisala, dal più programmato al meno programmato. Scrivi i titoli come li riporta la fonte, con il titolo italiano.

## Regole comuni

- Non fare commit/push a meno che l'utente non lo chieda. Se lo chiede, aggiungi solo i file di `src/content/cinema/`.
- La programmazione cambia di solito il giovedì: è il giorno migliore per aggiornarla.
