---
name: aggiorna-cinema
description: Aggiorna la sezione "Al cinema" del sito (/cinema e /en/cinema) con i film in programmazione e gli orari nei cinema più vicini a San Vito Romano, e cerca eventuali nuove sale entro circa un'ora di macchina. Usare quando l'utente chiede di "aggiornare i cinema", "aggiornare i film in programmazione", "cosa danno al cinema" o simili.
---

# Aggiorna i film in programmazione nei cinema vicini

La sezione "Al cinema" (nel menu Cultura&Turismo) legge la collection Astro `src/content/cinema` (schema in `src/content.config.ts`, collection `cinema`; componente `src/components/CinemaList.astro`). Ogni sala è un file `.md` con solo frontmatter. I dati non hanno testo da tradurre, quindi **la collection è unica** e la usano sia `/cinema` sia `/en/cinema`: qui non serve una versione `-en`.

## Sale attuali

| File | Sala | Fonte della programmazione |
|---|---|---|
| `ariston-colleferro.md` | Multisala Ariston, Colleferro (35 min) | https://www.comingsoon.it/cinema/roma/ariston-colleferro/424/ e le sue pagine ticket (solo per oggi anche https://www.mymovies.it/cinema/roma/colleferro/5273/ o http://www.multisale-ariston.it) |
| `giuseppetti-tivoli.md` | Cinema Teatro Giuseppetti, Tivoli (30 min) | https://www.teatrogiuseppetti.it/programmazione/ e le schede dei film (solo per oggi anche https://www.mymovies.it/cinema/roma/tivoli/5293/ o https://www.comingsoon.it/cinema/roma/giuseppetti-tivoli/567/) |
| `the-space-guidonia.md` | The Space Cinema Guidonia (45 min) | https://www.comingsoon.it/cinema/roma/the-space-cinema-guidonia-guidonia-montecelio/441/ |

A novembre 2026 non risultavano sale con film in programmazione a Valmontone, Subiaco, Palestrina, Zagarolo, Anagni e Fiuggi. Ricontrollali ogni tanto: `https://www.mymovies.it/cinema/roma/<comune>/` e `https://www.comingsoon.it/cinema/roma/<comune>/` (per Fiuggi e Anagni la provincia è `frosinone`).

## Procedura

1. **Leggi la programmazione di domani di ogni sala.** L'utente vuole sempre gli orari del **giorno dopo** quello dell'aggiornamento: chi apre la pagina la sera o la mattina dopo li trova ancora validi. Le pagine delle sale su MYmovies e ComingSoon mostrano solo i film di oggi, senza date né parametri per altri giorni, quindi si procede così:
   - Dalla pagina della sala su **ComingSoon** (per Colleferro e Tivoli sono le alternative nella tabella) prendi l'elenco dei film e, per ognuno, il link "Acquista biglietto e vedi tutte le date", del tipo `https://www.comingsoon.it/cinema/roma/<sala>/<id>/ticket/?idf=<id-film>`.
   - In ogni pagina `ticket/?idf=...` la sezione "Scegli una data e un orario disponibile" elenca i giorni (`venerdì 27 NOV`, `sabato 28 NOV`, ...) con i loro orari: prendi quelli sotto l'intestazione di domani. Un film che non ha domani nell'elenco non è in programmazione domani: non metterlo.
   - Con WebFetch o con l'agente `web-fetch` (un agente per sala, in parallelo) chiedi di riportare **solo gli orari letti direttamente nella pagina**, non riassunti, dicendo per ogni film a quale giorno appartengono. Se il testo estratto non chiarisce se gli orari sono di oggi o di domani, il film resta senza `orari`. Le pagine "ora nelle sale" o i widget generici del sito non valgono: servono i film di quella sala.
   - Se la pagina ticket dice solo "la prevendita al momento non è disponibile", senza date, non è detto che il film non ci sia domani: lascialo senza `orari`.
   - **Tivoli (Giuseppetti)** su ComingSoon non ha pagine ticket. Usa il sito della sala: `https://www.teatrogiuseppetti.it/programmazione/` elenca i film, e ogni scheda `https://www.teatrogiuseppetti.it/movie/<film>/` ha la sezione "Data / Orario" con i giorni ("Venerdi 27") e i loro orari. Gli spettacoli teatrali della stessa pagina non vanno messi. In `fonte` metti `nome: teatrogiuseppetti.it` e la pagina della programmazione.
   - La pagina della sala elenca i film di oggi: un film che esce domani può mancare. Se l'aggiornamento è di mercoledì (domani escono i film nuovi), avvisa l'utente che l'elenco di giovedì potrebbe essere incompleto.
   - Se per una sala gli orari di domani non si trovano proprio (pagine ticket assenti o irraggiungibili), usa quelli di oggi dalla pagina della sala, metti `aggiornato` a oggi e dillo nel riepilogo.
2. **Riscrivi il blocco `film`** con i titoli del giorno, ciascuno con i suoi `orari` nel formato `"HH:MM"` (il punto diventa due punti: `21.30` → `"21:30"`). Se un film è in programmazione ma la fonte non ne mostra gli orari, lascialo senza `orari`: la pagina mostra "orari sul sito della sala". **Non inventare né dedurre orari.**
   **Trailer.** Accanto a ogni titolo la pagina mostra il pulsante "▶ Trailer". Senza il campo `trailer` il pulsante apre la ricerca su YouTube del titolo (con "trailer ita" in italiano, "trailer" in inglese), quindi funziona sempre. Per i film nuovi puoi aggiungere `trailer:` con l'indirizzo del trailer ufficiale italiano, ma solo se lo trovi su un canale ufficiale: il distributore italiano, la casa di produzione oppure la scheda del film su MYmovies o ComingSoon. Se non sei sicuro, lascia la ricerca. Quando riscrivi il blocco `film`, conserva i `trailer` dei film che restano in programmazione.
3. **Aggiorna `aggiornato`** con il giorno a cui si riferiscono gli orari (di solito domani): la pagina lo mostra come "Orari del venerdì 27 novembre 2026". Se usi la pagina ticket di ComingSoon, metti in `fonte` la pagina della sala su ComingSoon. Se la data è più vecchia di 7 giorni rispetto alla build, la pagina mostra l'avviso "potrebbe non essere più aggiornata".
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
    trailer: https://www.youtube.com/watch?v=...   # facoltativo, solo trailer ufficiale
  - titolo: Dio ride            # senza orari
---
```

Ordina i film come nella fonte o, per i multisala, dal più programmato al meno programmato. Scrivi i titoli come li riporta la fonte, con il titolo italiano.

## Regole comuni

- Non fare commit/push a meno che l'utente non lo chieda. Se lo chiede, aggiungi solo i file di `src/content/cinema/`.
- La programmazione cambia di solito il giovedì: aggiornando il giovedì si pubblicano gli orari del venerdì, già della nuova settimana.
