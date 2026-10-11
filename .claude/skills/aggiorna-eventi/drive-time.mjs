// Minuti di auto da San Vito Romano a uno o più luoghi, per il campo `minutiAuto` degli eventi.
// Uso: node .claude/skills/aggiorna-eventi/drive-time.mjs "Cave, Roma, Italia" "Campo dell'Osso, Subiaco, Italia"
// Geocodifica con Nominatim (OpenStreetMap) e calcola il percorso con OSRM; il risultato è arrotondato
// per eccesso ai 5 minuti, perché OSRM non considera il traffico e sottostima un po' le strade di montagna.
const UA = { 'User-Agent': 'svrlovers-website-drive-times/1.0' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
    { headers: UA },
  );
  const [hit] = await res.json();
  await sleep(1100); // Nominatim: al massimo una richiesta al secondo
  return hit && { lat: hit.lat, lon: hit.lon, name: hit.display_name };
}

const queries = process.argv.slice(2);
if (queries.length === 0) {
  console.error('Indica almeno un luogo, es. "Cave, Roma, Italia"');
  process.exit(1);
}

const origin = await geocode('San Vito Romano, Roma, Italia');
for (const query of queries) {
  const dest = await geocode(query);
  if (!dest) {
    console.log(`${query}: luogo non trovato, prova con il solo comune`);
    continue;
  }
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=false`,
    { headers: UA },
  );
  const { routes } = await res.json();
  const minutes = routes[0].duration / 60;
  console.log(
    `${query}: minutiAuto ${Math.ceil(minutes / 5) * 5} (${minutes.toFixed(1)} min, ${(routes[0].distance / 1000).toFixed(1)} km) → ${dest.name}`,
  );
}
