async function run() {
  const query = `[out:json];relation["name"="Moianès"]["admin_level"="7"];out geom;`;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  const res = await fetch(url);
  const json = await res.json();
  const rel = json.elements.find(e => e.type === "relation");
  
  if (rel) {
    const coords = rel.members.filter(m => m.type === "way").map(way => way.geometry.map(pt => [pt.lon, pt.lat]));
    console.log(JSON.stringify(coords.slice(0, 1))); // Print snippet
  } else {
    console.log("Not found.");
  }
}
run();
