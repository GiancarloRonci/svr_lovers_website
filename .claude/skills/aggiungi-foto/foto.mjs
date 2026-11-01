// Comandi per aggiungere foto al sito: vedi SKILL.md. Uso: node .claude/skills/aggiungi-foto/foto.mjs <comando> ...
//   input                                     immagini in appo_immagini (senza le sottocartelle)
//   stato <collection>/<slug>                 foto presenti e prossimo nome di file libero
//   dove <lat> <lng> [slug]                   indirizzo del punto; con un percorso o luogo, la distanza e il posto nell'elenco
//   griglia <src> <out>                       copia con griglia in % per stimare le aree da offuscare
//   ritaglia <src> <out> x,y,w,h              ingrandisce un'area (valori in % dell'immagine)
//   offusca <src> <out> viso:x,y,w,h targa:x,y,w,h ...
//   installa <src> <collection>/<slug>/<nome.jpg> [--sostituisci]     scrive il file in IT ed EN
//   top100 <N...>                             cosa c'è ai progressivi indicati
//   top100-vicine <lat> <lng> [quante]        foto della Top 100 più vicine al punto
//   verifica [collection/slug ...]            controlla l'allineamento IT/EN e la Top 100
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const sharp = createRequire(path.join(REPO, 'package.json'))('sharp');
sharp.cache(false); // su Windows la cache tiene aperti i file e la riscrittura fallisce con EBUSY

const ROOT = process.env.FOTO_ROOT || REPO; // FOTO_ROOT serve solo a provare lo script su una copia
const CONTENT = path.join(ROOT, 'src/content');
const INPUT = path.join(os.homedir(), 'appo_immagini');
const LATO_MAX = 2048; // le foto del sito arrivano a circa 2048 px sul lato lungo
const QUALITA = 88;
const TOP100 = 'mappe-foto/san-vito-top-100';
const COLLECTION = ['percorsi', 'luoghi', 'articoli', 'mappe-foto', 'soggiorno'];
const UA = { 'User-Agent': 'svrlovers-website-foto/1.0' };

const esci = (msg) => { console.error(msg); process.exit(1); };
const leggi = (f) => fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
const frontmatter = (t) => /^---\n([\s\S]*?)\n---/.exec(t)?.[1] ?? '';
const breve = (s, n = 90) => (s && s.length > n ? `${s.slice(0, n)}…` : s ?? '(senza didascalia)');
const metri = (a, b) => Math.hypot((a[0] - b[0]) * 111200, (a[1] - b[1]) * 82700);
const hash = (f) => createHash('sha1').update(fs.readFileSync(f)).digest('hex');
const mdIt = (rif) => path.join(CONTENT, `${rif}.md`);
const mdEn = (rif) => { const [c, ...r] = rif.split('/'); return path.join(CONTENT, `${c}-en`, `${r.join('/')}.md`); };

/** Voci di un elenco del frontmatter (`foto`, `galleria`) come oggetti semplici. */
function voci(file, chiave = 'foto') {
  const blocco = new RegExp(`^${chiave}:\\n((?:[ \\t-].*\\n?)*)`, 'm').exec(frontmatter(leggi(file)))?.[1] ?? '';
  return blocco.split(/^\s*- /m).slice(1).map((testo) => {
    const voce = {};
    for (const riga of testo.split('\n')) {
      const m = /^\s*(\w+):\s*(.*)$/.exec(riga);
      if (m) voce[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
    if (!Object.keys(voce).length) voce.immagine = testo.trim();
    if (voce.lat) { voce.lat = +voce.lat; voce.lng = +voce.lng; }
    return voce;
  });
}

const nomeFile = (v) => v.immagine.split('/').pop();
const percorsoDi = (slug, file) => path.join(CONTENT, file === 'en' ? 'percorsi-en' : 'percorsi', `${slug}.md`);

/** Voce della Top 100 con coordinate e didascalia, anche quando la foto è di un percorso. */
function risolvi(voce, lingua = 'it') {
  if (!voce.percorso) return { ...voce, origine: 'foto propria della mappa' };
  const lista = voci(percorsoDi(voce.percorso, lingua));
  const i = lista.findIndex((f) => nomeFile(f) === voce.immagine);
  if (i < 0) return { ...voce, origine: `${voce.percorso}: FOTO NON TROVATA` };
  return { ...lista[i], percorso: voce.percorso, immagine: voce.immagine, origine: `${voce.percorso}, Foto ${i + 1}` };
}

function regione(meta, testo) {
  const [x, y, w, h] = testo.split(',').map(Number);
  if ([x, y, w, h].some(Number.isNaN)) esci(`Area non valida: ${testo} (attesi x,y,w,h in %)`);
  const left = Math.max(0, Math.round((meta.width * x) / 100));
  const top = Math.max(0, Math.round((meta.height * y) / 100));
  return {
    left, top,
    width: Math.min(meta.width - left, Math.max(1, Math.round((meta.width * w) / 100))),
    height: Math.min(meta.height - top, Math.max(1, Math.round((meta.height * h) / 100))),
  };
}

/** Immagine già raddrizzata, letta in memoria per non tenere bloccato il file. */
async function carica(src) {
  const buffer = await sharp(fs.readFileSync(src)).rotate().toBuffer();
  return { buffer, meta: await sharp(buffer).metadata() };
}

const comandi = {
  async input() {
    const file = fs.readdirSync(INPUT).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f))
      .map((f) => path.join(INPUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    if (!file.length) return console.log(`Nessuna immagine in ${INPUT}`);
    for (const f of file) {
      const m = await sharp(f).metadata();
      const [w, h] = (m.orientation ?? 1) > 4 ? [m.height, m.width] : [m.width, m.height];
      console.log(`${f}  ${w}x${h}  ${Math.round(fs.statSync(f).size / 1024)} KB  ${fs.statSync(f).mtime.toISOString().slice(0, 16)}`);
    }
  },

  stato(rif) {
    if (!rif) esci('Uso: stato <collection>/<slug>');
    const [c, ...r] = rif.split('/');
    const slug = r.join('/');
    const cartelle = [path.join(CONTENT, c, slug), path.join(CONTENT, `${c}-en`, slug)];
    const nomi = cartelle.flatMap((d) => (fs.existsSync(d) ? fs.readdirSync(d) : []));
    const numeri = nomi.map((n) => /^(foto|photo)(\d+)\.jpe?g$/i.exec(n)).filter(Boolean);
    const conta = (p) => numeri.filter((m) => m[1].toLowerCase() === p).length;
    const prefisso = conta('foto') > conta('photo') || (!numeri.length && c === 'percorsi') ? 'foto' : 'photo';
    console.log(`Prossimo file: ${prefisso}${Math.max(0, ...numeri.map((m) => +m[2])) + 1}.jpg`);
    for (const k of ['foto', 'galleria']) {
      const lista = fs.existsSync(mdIt(rif)) ? voci(mdIt(rif), k) : [];
      if (lista.length) console.log(`${k}: ${lista.length} voci, ultima ${nomeFile(lista.at(-1))}: ${breve(lista.at(-1).didascalia)}`);
    }
  },

  async dove(lat, lng, slug) {
    if (!lng) esci('Uso: dove <lat> <lng> [slug]');
    const p = [+lat, +lng];
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&lat=${lat}&lon=${lng}`, { headers: UA });
    console.log(`Indirizzo: ${(await r.json()).display_name ?? 'non trovato'}`);
    if (!slug) return;
    const gpx = path.join(ROOT, 'public/gpx', `${slug}.gpx`);
    if (fs.existsSync(gpx)) {
      const traccia = [...leggi(gpx).matchAll(/lat="([\d.]+)"\s+lon="([\d.]+)"/g)].map((m) => [+m[1], +m[2]]);
      const indice = (q) => traccia.reduce((b, t, i) => (metri(t, q) < metri(traccia[b], q) ? i : b), 0);
      const lista = voci(percorsoDi(slug, 'it')).map((f) => ({ ...f, t: indice([f.lat, f.lng]) }));
      const t = indice(p);
      console.log(`Distanza dalla traccia: ${metri(traccia[t], p).toFixed(0)} m`);
      const ordinata = lista.every((f, i) => !i || lista[i - 1].t <= f.t);
      let posto = lista.findIndex((f) => f.t > t);
      if (posto < 0) posto = lista.length;
      console.log(`Posto suggerito nell'elenco: Foto ${posto + 1} di ${lista.length + 1}${ordinata ? '' : ' (ATTENZIONE: l\'elenco non segue la traccia, decidi guardando le foto vicine)'}`);
      if (posto) console.log(`  prima: Foto ${posto} ${nomeFile(lista[posto - 1])}: ${breve(lista[posto - 1].didascalia)}`);
      if (lista[posto]) console.log(`  dopo:  ora Foto ${posto + 1} ${nomeFile(lista[posto])}: ${breve(lista[posto].didascalia)}`);
    } else if (fs.existsSync(mdIt(`luoghi/${slug}`))) {
      const m = /coordinate:\n\s+lat:\s*([\d.]+)\n\s+lng:\s*([\d.]+)/.exec(frontmatter(leggi(mdIt(`luoghi/${slug}`))));
      console.log(m ? `Distanza dalle coordinate del luogo: ${metri([+m[1], +m[2]], p).toFixed(0)} m` : 'Il luogo non ha coordinate');
    } else esci(`Né percorso né luogo: ${slug}`);
  },

  async griglia(src, out) {
    if (!out) esci('Uso: griglia <src> <out>');
    const { buffer, meta: { width: W, height: H } } = await carica(src);
    const font = Math.round(Math.max(W, H) / 55);
    let svg = '';
    for (let p = 10; p < 100; p += 10) {
      const x = (W * p) / 100, y = (H * p) / 100;
      svg += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#ff0" stroke-width="2"/><line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ff0" stroke-width="2"/>`;
      svg += `<text x="${x + 4}" y="${font}" font-size="${font}" fill="#ff0" stroke="#000" stroke-width="1">${p}</text><text x="4" y="${y - 4}" font-size="${font}" fill="#ff0" stroke="#000" stroke-width="1">${p}</text>`;
    }
    await sharp(buffer).composite([{ input: Buffer.from(`<svg width="${W}" height="${H}">${svg}</svg>`) }]).jpeg({ quality: 80 }).toFile(out);
    console.log(`${out}  ${W}x${H}`);
  },

  async ritaglia(src, out, area) {
    if (!area) esci('Uso: ritaglia <src> <out> x,y,w,h');
    const { buffer, meta } = await carica(src);
    await sharp(buffer).extract(regione(meta, area)).resize({ width: 1100 }).jpeg({ quality: 90 }).toFile(out);
    console.log(out);
  },

  async offusca(src, out, ...aree) {
    if (!aree.length) esci('Uso: offusca <src> <out> viso:x,y,w,h targa:x,y,w,h ...');
    const { buffer, meta } = await carica(src);
    const strati = [];
    for (const voce of aree) {
      const [tipo, area] = voce.split(':');
      if (!['viso', 'targa'].includes(tipo) || !area) esci(`Area non valida: ${voce}`);
      const r = regione(meta, area);
      const pezzo = await sharp(buffer).extract(r).raw().toBuffer({ resolveWithObject: true });
      const piccolo = sharp(pezzo.data, { raw: pezzo.info });
      // Targa: pochissimi blocchi, una pixelatura fine resta leggibile. Viso: pochi pixel e sfocatura, per non lasciare riquadri.
      const [bw, bh] = tipo === 'targa' ? [4, 2] : [8, Math.max(2, Math.round((8 * r.height) / r.width))];
      const ridotto = await piccolo.resize(bw, bh, { fit: 'fill' }).toBuffer({ resolveWithObject: true });
      const input = await sharp(ridotto.data, { raw: ridotto.info })
        .resize(r.width, r.height, { kernel: tipo === 'targa' ? 'nearest' : 'cubic', fit: 'fill' })
        .blur(Math.max(3, r.width / (tipo === 'targa' ? 6 : 10))).png().toBuffer();
      strati.push({ input, left: r.left, top: r.top });
    }
    await sharp(buffer).composite(strati).jpeg({ quality: 95 }).toFile(out);
    console.log(`${out}  ${strati.length} aree offuscate`);
  },

  async installa(src, dest, opzione) {
    if (!dest) esci('Uso: installa <src> <collection>/<slug>/<nome.jpg> [--sostituisci]');
    const [c, ...r] = dest.split('/');
    const destinazioni = [path.join(CONTENT, c, ...r), path.join(CONTENT, `${c}-en`, ...r)];
    const esistenti = destinazioni.filter((f) => fs.existsSync(f));
    if (esistenti.length && opzione !== '--sostituisci') esci(`File già presente: ${esistenti.join(', ')}`);
    const dati = await sharp(fs.readFileSync(src)).rotate()
      .resize({ width: LATO_MAX, height: LATO_MAX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITA, mozjpeg: true }).toBuffer({ resolveWithObject: true });
    for (const f of destinazioni) {
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, dati.data);
    }
    console.log(`${dest}  ${dati.info.width}x${dati.info.height}  ${Math.round(dati.data.length / 1024)} KB (IT ed EN)`);
  },

  top100(...numeri) {
    if (!numeri.length) esci('Uso: top100 <N...>');
    const lista = voci(mdIt(TOP100));
    const en = voci(mdEn(TOP100));
    for (const n of numeri) {
      const v = lista[n - 1];
      if (!v) { console.log(`${n}: non esiste (la Top 100 ha ${lista.length} voci)`); continue; }
      const it = risolvi(v);
      console.log(`${n}: ${it.origine}, ${nomeFile(it)}, ${it.lat}, ${it.lng}\n   IT: ${breve(it.didascalia, 140)}\n   EN: ${breve(risolvi(en[n - 1], 'en').didascalia, 140)}`);
    }
  },

  'top100-vicine'(lat, lng, quante = 5) {
    if (!lng) esci('Uso: top100-vicine <lat> <lng> [quante]');
    voci(mdIt(TOP100)).map((v, i) => ({ ...risolvi(v), n: i + 1 })).filter((v) => v.lat)
      .map((v) => ({ ...v, d: metri([v.lat, v.lng], [+lat, +lng]) })).sort((a, b) => a.d - b.d).slice(0, +quante)
      .forEach((v) => console.log(`${v.n}: ${v.d.toFixed(0)} m, ${v.origine}: ${breve(v.didascalia)}`));
  },

  verifica(...rif) {
    const errori = [];
    const avvisi = [];
    const elenco = rif.length ? rif : COLLECTION.flatMap((c) => fs.readdirSync(path.join(CONTENT, c))
      .filter((f) => f.endsWith('.md')).map((f) => `${c}/${f.slice(0, -3)}`));
    for (const r of elenco) {
      const [fi, fe] = [mdIt(r), mdEn(r)];
      if (!fs.existsSync(fi) || !fs.existsSync(fe)) { errori.push(`${r}: manca il file IT o EN`); continue; }
      const [c, ...resto] = r.split('/');
      const slug = resto.join('/');
      const riferimenti = (f) => [...new Set([...leggi(f).matchAll(/\.\/([^\s"')]+\.(?:jpe?g|png|webp|avif))/gi)].map((m) => m[1]))];
      const [ri, re] = [riferimenti(fi), riferimenti(fe)];
      for (const x of ri.filter((n) => !re.includes(n))) errori.push(`${r}: ${x} manca nella versione EN`);
      for (const x of re.filter((n) => !ri.includes(n))) errori.push(`${r}: ${x} manca nella versione IT`);
      for (const n of ri) {
        const [a, b] = [path.join(CONTENT, c, n), path.join(CONTENT, `${c}-en`, n)];
        if (!fs.existsSync(a) || !fs.existsSync(b)) errori.push(`${r}: file assente in IT o EN: ${n}`);
        else if (hash(a) !== hash(b)) errori.push(`${r}: ${n} è diverso tra IT ed EN`);
      }
      for (const k of ['foto', 'galleria']) {
        const [li, le] = [voci(fi, k), voci(fe, k)];
        if (li.map(nomeFile).join() !== le.map(nomeFile).join()) errori.push(`${r}: elenco ${k} diverso tra IT ed EN`);
        else li.forEach((v, i) => {
          if (v.lat !== le[i].lat || v.lng !== le[i].lng) errori.push(`${r}: coordinate diverse tra IT ed EN per ${nomeFile(v)}`);
          if (v.didascalia && !le[i].didascalia) errori.push(`${r}: manca la didascalia EN di ${nomeFile(v)}`);
          // Le didascalie brevi uguali sono di solito nomi di vie, che in inglese restano tali
          if (v.didascalia?.split(' ').length > 5 && v.didascalia === le[i].didascalia) avvisi.push(`${r}: didascalia EN identica a quella IT per ${nomeFile(v)}`);
        });
      }
      const cartella = path.join(CONTENT, c, slug);
      if (fs.existsSync(cartella)) for (const n of fs.readdirSync(cartella)) {
        if (fs.statSync(path.join(cartella, n)).isFile() && !ri.includes(`${slug}/${n}`)) avvisi.push(`${r}: file non usato ${n}`);
      }
    }
    if (elenco.includes(TOP100)) {
      const [it, en] = [voci(mdIt(TOP100)), voci(mdEn(TOP100))];
      if (it.length !== 100) errori.push(`Top 100: ${it.length} voci invece di 100`);
      const chiave = (v) => `${v.percorso ?? ''}/${nomeFile(v)}`;
      const doppie = it.map(chiave).filter((k, i, a) => a.indexOf(k) !== i);
      if (doppie.length) errori.push(`Top 100: foto ripetute ${doppie.join(', ')}`);
      if (it.map(chiave).join() !== en.map(chiave).join()) errori.push('Top 100: ordine o foto diversi tra IT ed EN');
      it.forEach((v, i) => {
        if (v.percorso && risolvi(v).lat === undefined) errori.push(`Top 100, progressivo ${i + 1}: ${chiave(v)} non è nell'elenco foto del percorso`);
      });
    }
    avvisi.forEach((a) => console.log(`AVVISO  ${a}`));
    errori.forEach((e) => console.log(`ERRORE  ${e}`));
    console.log(`${elenco.length} contenuti controllati: ${errori.length} errori, ${avvisi.length} avvisi`);
    if (errori.length) process.exitCode = 1;
  },
};

const [comando, ...argomenti] = process.argv.slice(2);
if (!comandi[comando]) esci(`Comandi: ${Object.keys(comandi).join(', ')}`);
await comandi[comando](...argomenti);
