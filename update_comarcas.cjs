const fs = require('fs');

const moianesGeom = JSON.parse(fs.readFileSync('Moianès.json', 'utf8'));
const llucanesGeom = JSON.parse(fs.readFileSync('Lluçanès.json', 'utf8'));

// Convert Polygon to MultiPolygon for Moianès if needed to match others
if (moianesGeom.type === 'Polygon') {
  moianesGeom.type = 'MultiPolygon';
  moianesGeom.coordinates = [moianesGeom.coordinates];
}
if (llucanesGeom.type === 'Polygon') {
  llucanesGeom.type = 'MultiPolygon';
  llucanesGeom.coordinates = [llucanesGeom.coordinates];
}

const content = fs.readFileSync('src/data/comarcas.ts', 'utf8');
const prefix = "export const comarcasGeoJSON: any = ";
const startIndex = content.indexOf(prefix);
if (startIndex !== -1) {
  let geojsonStr = content.substring(startIndex + prefix.length);
  // strip trailing semicolons/whitespace
  geojsonStr = geojsonStr.replace(/;\s*$/, '');
  const geojson = JSON.parse(geojsonStr);
  geojson.features.push({
    type: "Feature",
    properties: {
      cap_comar: "Moià",
      comarca: "42",
      nom_comar: "Moianès"
    },
    geometry: moianesGeom
  });
  geojson.features.push({
    type: "Feature",
    properties: {
      cap_comar: "Prats de Lluçanès",
      comarca: "43",
      nom_comar: "Lluçanès"
    },
    geometry: llucanesGeom
  });
  const newContent = prefix + JSON.stringify(geojson) + ';';
  fs.writeFileSync('src/data/comarcas.ts', newContent);
  console.log("Updated comarcas.ts successfully.");
} else {
  console.log("Could not find prefix.");
}
