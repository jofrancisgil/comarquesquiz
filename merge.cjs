const fs = require('fs');

const content = fs.readFileSync('src/data/comarcas.ts', 'utf8');
const prefix = content.substring(0, content.indexOf('{'));
const jsonStr = content.substring(content.indexOf('{')).replace(/;\s*$/, '');
const geojson = JSON.parse(jsonStr);

const grouped = {};
geojson.features.forEach(f => {
  const name = f.properties.nom_comar;
  if (!grouped[name]) {
    grouped[name] = { ...f, geometry: { type: "MultiPolygon", coordinates: [] } };
  }
  
  if (f.geometry.type === 'Polygon') {
    grouped[name].geometry.coordinates.push(f.geometry.coordinates);
  } else if (f.geometry.type === 'MultiPolygon') {
    grouped[name].geometry.coordinates.push(...f.geometry.coordinates);
  }
});

geojson.features = Object.values(grouped);

console.log("Total unique comarcas:", geojson.features.length);

const newContent = prefix + JSON.stringify(geojson) + ';';
fs.writeFileSync('src/data/comarcas.ts', newContent);
console.log("Updated comarcas.ts!");
