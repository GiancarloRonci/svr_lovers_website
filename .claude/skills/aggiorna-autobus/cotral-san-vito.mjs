// Estrae dal GTFS ufficiale Cotral le corse che passano da San Vito Romano in una settimana e scrive
// src/data/autobus-san-vito.json, letto dalle pagine /autobus e /en/autobus.
//
// Uso: node .claude/skills/aggiorna-autobus/cotral-san-vito.mjs <cartella GTFS estratta> [lunedì YYYY-MM-DD]
// Senza data usa il lunedì successivo a oggi. Il GTFS si scarica da https://cotralspa.it/open-data/
// (http://travel.mob.cotralspa.it:7777/GTFS/GTFS_COTRAL.zip) e va estratto fuori dal progetto.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const [dir, lunediArg] = process.argv.slice(2);
if (!dir) {
  console.error('Indica la cartella del GTFS estratto');
  process.exit(1);
}
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../src/data/autobus-san-vito.json');

// ---- utilità ----
const parseLine = (line) => {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') (cur += '"'), i++;
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') out.push(cur), (cur = '');
    else cur += c;
  }
  out.push(cur);
  return out;
};
async function* rows(file) {
  const rl = readline.createInterface({ input: fs.createReadStream(path.join(dir, file)), crlfDelay: Infinity });
  let header;
  for await (const line of rl) {
    if (!line.trim()) continue;
    const v = parseLine(line.replace(/^﻿/, ''));
    if (!header) {
      header = v;
      continue;
    }
    yield Object.fromEntries(header.map((h, i) => [h, v[i]]));
  }
}
const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
const iso = (d) => d.toISOString().slice(0, 10);
const titolo = (s) =>
  s
    .toLowerCase()
    .replace(/(^|[\s'(.-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase())
    .replace(/\b(Di|De|Del|Della|Dei|Delle|In|Sul|Al|Lo|La|Le|E)\b/g, (w, _, i) => (i === 0 ? w : w.toLowerCase()));
// Nomi abbreviati dei comuni nel GTFS -> nome ufficiale (aggiungerne se ne compaiono di nuovi)
const NOMI_COMUNI = {
  'San Vito': 'San Vito Romano',
  'S.Cesareo': 'San Cesareo',
  'S. Cesareo': 'San Cesareo',
  'Rocca S. Stefano': 'Rocca Santo Stefano',
  Olevano: 'Olevano Romano',
  Gallicano: 'Gallicano nel Lazio',
};
// "SAN VITO | Viale Piave # f14186" -> { comune: "San Vito Romano", fermata: "Viale Piave" }
const fermata = (nome) => {
  const senzaId = nome.replace(/\s*#.*$/, '').trim();
  const [c, f] = senzaId.includes('|') ? senzaId.split('|').map((s) => s.trim()) : [senzaId.split(' ')[0], senzaId];
  const comune = titolo(c);
  return {
    comune: NOMI_COMUNI[comune.replace(/\s+/g, ' ')] ?? comune,
    fermata: / DEP$/i.test(f) ? 'Deposito Cotral' : f,
  };
};
const ora = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${String(h % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// ---- settimana ----
let lunedi;
if (lunediArg) lunedi = new Date(`${lunediArg}T00:00:00Z`);
else {
  const oggi = new Date();
  lunedi = new Date(Date.UTC(oggi.getFullYear(), oggi.getMonth(), oggi.getDate()));
  lunedi.setUTCDate(lunedi.getUTCDate() + (((8 - lunedi.getUTCDay()) % 7) || 7));
}
if (lunedi.getUTCDay() !== 1) {
  console.error('La data deve essere un lunedì');
  process.exit(1);
}
const giorni = [...Array(7)].map((_, i) => {
  const d = new Date(lunedi);
  d.setUTCDate(d.getUTCDate() + i);
  return d;
});
const COL = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ---- calendario: per ogni servizio i giorni della settimana (0 = lunedì) in cui circola ----
const serviziGiorni = new Map();
for await (const r of rows('calendar.txt')) {
  const g = giorni.flatMap((d, i) => (r[COL[i]] === '1' && r.start_date <= ymd(d) && r.end_date >= ymd(d) ? [i] : []));
  if (g.length) serviziGiorni.set(r.service_id, g);
}
if (fs.existsSync(path.join(dir, 'calendar_dates.txt'))) {
  for await (const r of rows('calendar_dates.txt')) {
    const i = giorni.findIndex((d) => ymd(d) === r.date);
    if (i < 0) continue;
    const g = new Set(serviziGiorni.get(r.service_id) ?? []);
    r.exception_type === '1' ? g.add(i) : g.delete(i);
    serviziGiorni.set(r.service_id, [...g].sort());
  }
}
if (serviziGiorni.size === 0) {
  console.error(`Il GTFS non copre la settimana dal ${iso(giorni[0])}: scarica un file più recente`);
  process.exit(1);
}

const routes = new Map();
for await (const r of rows('routes.txt')) routes.set(r.route_id, r.route_short_name);
const trips = new Map();
for await (const r of rows('trips.txt')) {
  const g = serviziGiorni.get(r.service_id);
  if (g?.length) trips.set(r.trip_id, { linea: routes.get(r.route_id), giorni: g });
}
const stops = new Map();
const sanVito = new Set();
for await (const r of rows('stops.txt')) {
  stops.set(r.stop_id, r.stop_name);
  if (/^SAN VITO\s*\|/.test(r.stop_name)) sanVito.add(r.stop_id);
}

// ---- stop_times: due passaggi, prima le corse che toccano San Vito poi le loro fermate ----
const corseSV = new Set();
for await (const r of rows('stop_times.txt')) if (sanVito.has(r.stop_id) && trips.has(r.trip_id)) corseSV.add(r.trip_id);
const fermate = new Map();
for await (const r of rows('stop_times.txt')) {
  if (!corseSV.has(r.trip_id)) continue;
  if (!fermate.has(r.trip_id)) fermate.set(r.trip_id, []);
  fermate.get(r.trip_id).push({ seq: Number(r.stop_sequence), arr: r.arrival_time, dep: r.departure_time, stop: r.stop_id });
}

// ---- corse ----
const unisci = new Map();
const aggiungi = (tipo, voce, g) => {
  const k = JSON.stringify([tipo, voce]);
  if (!unisci.has(k)) unisci.set(k, { tipo, ...voce, giorni: new Set() });
  g.forEach((i) => unisci.get(k).giorni.add(i));
};
for (const [id, lista] of fermate) {
  lista.sort((a, b) => a.seq - b.seq);
  const { linea, giorni: g } = trips.get(id);
  const idxSV = lista.flatMap((f, i) => (sanVito.has(f.stop) ? [i] : []));
  const primo = idxSV[0];
  const ultimo = idxSV.at(-1);
  // Comuni attraversati tra San Vito e il capolinea, senza San Vito e senza il comune del capolinea
  const via = (da, a, escluso) => {
    const comuni = [];
    for (const f of lista.slice(da, a)) {
      const c = fermata(stops.get(f.stop)).comune;
      if (c !== 'San Vito Romano' && c !== escluso && !comuni.includes(c)) comuni.push(c);
    }
    return comuni;
  };
  if (ultimo < lista.length - 1) {
    const da = lista[primo];
    const a = lista.at(-1);
    const dest = fermata(stops.get(a.stop));
    aggiungi(
      'partenza',
      {
        linea,
        ora: ora(da.dep),
        fermata: fermata(stops.get(da.stop)).fermata,
        comune: dest.comune,
        capolinea: dest.fermata,
        oraArrivo: ora(a.arr),
        via: via(ultimo + 1, lista.length - 1, dest.comune),
      },
      g,
    );
  }
  if (primo > 0) {
    const da = lista[0];
    const a = lista[primo];
    const orig = fermata(stops.get(da.stop));
    aggiungi(
      'arrivo',
      {
        linea,
        ora: ora(a.arr),
        fermata: fermata(stops.get(a.stop)).fermata,
        comune: orig.comune,
        capolinea: orig.fermata,
        oraPartenza: ora(da.dep),
        via: via(1, primo, orig.comune),
      },
      g,
    );
  }
}

const corse = [...unisci.values()]
  .map(({ tipo, giorni: g, ...v }) => ({ tipo, ...v, giorni: [...g].sort() }))
  .sort((a, b) => a.ora.localeCompare(b.ora) || a.comune.localeCompare(b.comune));

const dati = {
  generato: iso(new Date()),
  settimana: { dal: iso(giorni[0]), al: iso(giorni[6]) },
  fonte: 'https://cotralspa.it/open-data/',
  partenze: corse.filter((c) => c.tipo === 'partenza').map(({ tipo, ...c }) => c),
  arrivi: corse.filter((c) => c.tipo === 'arrivo').map(({ tipo, ...c }) => c),
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(dati, null, 2) + '\n');

const conta = (l) => [...Array(7)].map((_, i) => l.filter((c) => c.giorni.includes(i)).length).join('/');
console.log(`Settimana ${dati.settimana.dal} – ${dati.settimana.al}`);
console.log(`Partenze da San Vito (lun..dom): ${conta(dati.partenze)}`);
console.log(`Arrivi a San Vito (lun..dom): ${conta(dati.arrivi)}`);
console.log(`Destinazioni: ${[...new Set(dati.partenze.map((c) => c.comune))].join(', ')}`);
console.log(`Provenienze: ${[...new Set(dati.arrivi.map((c) => c.comune))].join(', ')}`);
console.log(`Scritto ${OUT}`);
