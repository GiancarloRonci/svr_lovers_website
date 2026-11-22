---
name: aggiorna-autobus
description: Aggiorna la sezione "Autobus Cotral" del sito (/autobus e /en/autobus) con gli orari degli autobus Cotral da e per San Vito Romano, ricavati dai dati aperti ufficiali Cotral (GTFS). Usare quando l'utente chiede di "aggiornare gli orari Cotral", "aggiornare gli autobus", "orari dei pullman" o simili.
---

# Aggiorna gli orari degli autobus Cotral

La sezione "Autobus Cotral" (nel menu Cultura&Turismo) legge `src/data/autobus-san-vito.json`. Il componente è `src/components/OrariAutobus.astro`, le pagine sono `src/pages/autobus/index.astro` e `src/pages/en/autobus/index.astro`. Il file JSON **non va scritto a mano**: lo genera lo script `cotral-san-vito.mjs` di questa cartella dal GTFS ufficiale Cotral. Il JSON non contiene testo da tradurre e lo usano sia la pagina italiana sia quella inglese.

## Procedura

1. **Scarica il GTFS bus di Cotral** (circa 30 MB, chiedi conferma all'utente prima di scaricarlo) in una cartella nuova dello scratchpad, **non nel progetto**, ed estrailo:
   - pagina ufficiale: https://cotralspa.it/open-data/
   - file: http://travel.mob.cotralspa.it:7777/GTFS/GTFS_COTRAL.zip (Cotral lo aggiorna circa ogni settimana; con una richiesta HEAD vedi dimensione e `Last-Modified`)
   ```powershell
   Invoke-WebRequest -Uri "http://travel.mob.cotralspa.it:7777/GTFS/GTFS_COTRAL.zip" -OutFile "<scratchpad>\gtfs-cotral\GTFS_COTRAL.zip" -UseBasicParsing
   Expand-Archive -Force "<scratchpad>\gtfs-cotral\GTFS_COTRAL.zip" "<scratchpad>\gtfs-cotral\data"
   ```
2. **Lancia lo script** dalla cartella del progetto, passando la cartella estratta (sul PC Ospite usa `C:\Users\Ospite\node\node.exe`). Ci vogliono un paio di minuti, perché `stop_times.txt` pesa circa 180 MB:
   ```powershell
   node .claude/skills/aggiorna-autobus/cotral-san-vito.mjs "<scratchpad>\gtfs-cotral\data" [YYYY-MM-DD]
   ```
   Senza data usa la settimana che inizia il lunedì successivo. **Scegli una settimana "normale"**: senza festivi infrasettimanali (8 dicembre, Natale, Pasqua, 25 aprile, 1° maggio, 2 giugno, 15 agosto, 1° novembre) e, se possibile, con le scuole aperte. Nelle settimane festive le corse sono meno e la pagina mostrerebbe un orario ridotto. Il GTFS copre solo poche settimane avanti: se la settimana non è coperta, lo script lo dice.
3. **Controlla il riepilogo** stampato dallo script, che conta le corse per giorno e le destinazioni. Come riferimento, a novembre 2026 c'erano circa 61 partenze nei feriali, 45 il sabato e 13 la domenica, e le destinazioni erano Roma (Anagnina, Ponte Mammolo, Termini), Tivoli, Valmontone, Genazzano, Bellegra, Olevano Romano, Rocca Santo Stefano e Zagarolo. Se i numeri cambiano molto, verifica prima di pubblicare. Se compare un comune con un nome abbreviato (es. "S.Cesareo"), aggiungilo a `NOMI_COMUNI` nello script e rilancialo.
4. **Controlla la pagina** `/autobus` nell'anteprima. Prova i filtri per direzione, giorno e comune.
5. Cancella il GTFS scaricato dallo scratchpad e riepiloga all'utente la settimana usata e i numeri delle corse.

## Come legge i dati lo script

- Fermate di San Vito: quelle con nome che inizia per `SAN VITO |` nel GTFS (Viale Piave, Viale Giovanni XXIII, Via Sisto Jella, Via Vittorio Emanuele, ecc.).
- **Partenze**: le corse che passano da San Vito e proseguono. L'orario è quello della prima fermata in paese, e la riga riporta capolinea, orario di arrivo e comuni attraversati.
- **Arrivi**: le corse che arrivano a San Vito da un altro comune. L'orario è quello della prima fermata in paese, insieme alla provenienza e all'orario di partenza.
- Le corse uguali nei vari giorni si uniscono. Il campo `giorni` (0 = lunedì … 6 = domenica) serve ai filtri "Lun – ven", "Sabato" e "Domenica". Le corse feriali che non circolano tutti i giorni riportano "solo lun, mer…".
- Se la settimana degli orari è finita da più di due mesi, la pagina mostra l'avviso "potrebbero non essere più aggiornati".

## Regole comuni

- Non fare commit/push a meno che l'utente non lo chieda. Se lo chiede, aggiungi solo `src/data/autobus-san-vito.json` (e lo script, se l'hai modificato).
- Non mettere mai nel progetto il GTFS scaricato.
- Conviene aggiornare a inizio settembre (orario invernale/scolastico), a metà giugno (orario estivo) e quando Cotral annuncia cambi di orario.
