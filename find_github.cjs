async function run() {
  try {
    const res = await fetch("https://api.github.com/search/code?q=Moian%C3%A8s+Llu%C3%A7an%C3%A8s+extension:geojson", {
      headers: { "User-Agent": "Node.js" }
    });
    const json = await res.json();
    if (json.items && json.items.length > 0) {
      console.log(json.items[0].html_url);
      console.log(json.items[0].repository.full_name);
      console.log(json.items[0].path);
    } else {
      console.log("Not found in github code search.");
      console.log(json);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
