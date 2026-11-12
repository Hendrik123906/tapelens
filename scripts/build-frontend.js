// Build the demo frontend into a single self-contained file:
//   frontend/index.html  (open directly in a browser, or serve statically)
// Inlines simulator/netlist.js + the latest X Layer snapshot (+ testnet
// deployment record when present). No build tools, no server needed.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const tpl = fs.readFileSync(path.join(root, "frontend", "index.template.html"), "utf8");
const netlist = fs.readFileSync(path.join(root, "simulator", "netlist.js"), "utf8");

function readJson(rel) {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) return "null";
  return fs.readFileSync(f, "utf8");
}

const out = tpl
  .replace("/*__NETLIST_JS__*/", () => netlist)
  .replace("/*__SNAPSHOT_JSON__*/", () => readJson("data/xlayer-snapshot.json"))
  .replace("/*__DEPLOY_JSON__*/", () => readJson("data/deployment-testnet.json"));

fs.writeFileSync(path.join(root, "frontend", "index.html"), out);
console.log("Built frontend/index.html (" + out.length + " bytes)");
console.log("Open it in a browser (double-click) or serve: npx serve frontend");
