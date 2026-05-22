const https = require('https');

function download() {
  const url = "https://analisi.transparenciacatalunya.cat/api/geospatial/gsjn-sema?method=export&format=GeoJSON";
  https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log("Found comarques:");
        console.log(json.features.map(f => f.properties.nom_comar).join(", "));
        
        const fs = require('fs');
        fs.writeFileSync('comarcas_socrata.json', data);
        console.log("Written to comarcas_socrata.json");
      } catch (e) {
        console.log("Error parsing:", e.message);
        console.log("Snippet:", data.slice(0, 150));
      }
    });
  });
}
download();
