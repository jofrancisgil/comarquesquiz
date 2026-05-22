const fs = require('fs');

async function fetchGeom(name) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&polygon_geojson=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Node.js/GeoJSONFetcher' } });
  const json = await res.json();
  if (json.length > 0) {
    const geo = json[0].geojson;
    console.log(name, geo.type);
    fs.writeFileSync(name + '.json', JSON.stringify(geo));
  } else {
    console.log(name, "Not found.");
  }
}

async function run() {
  await fetchGeom("Moianès");
  await fetchGeom("Lluçanès");
}
run();
