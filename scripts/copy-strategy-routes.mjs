// GitHub Pages serves unknown paths with a 404 status (even with a 404.html fallback).
// Give every strategy URL a real index.html so shared links and crawlers get a 200.
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const index = path.join(dist, "index.html");
const strategies = JSON.parse(fs.readFileSync(path.resolve("src/data/strategies.json"), "utf8"));

if (!fs.existsSync(index)) {
  console.error("dist/index.html not found. Run vite build first.");
  process.exit(1);
}

const targets = ["strategies", ...strategies.map((item) => path.join("strategies", item.slug))];
for (const target of targets) {
  const dir = path.join(dist, target);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(index, path.join(dir, "index.html"));
}
console.log(`Strategy routes written: ${targets.length}`);
