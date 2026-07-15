import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const index = path.join(dist, "index.html");
const sitemap = path.join(dist, "sitemap.xml");

if (!fs.existsSync(index)) {
  console.error("dist/index.html not found. Run npm run build first.");
  process.exit(1);
}

if (!fs.existsSync(sitemap)) {
  console.error("dist/sitemap.xml not found.");
  process.exit(1);
}

const sitemapText = fs.readFileSync(sitemap, "utf8");
const requiredPaths = [
  "/",
  "/how-it-works",
  "/partner-programme",
  "/platforms",
  "/learn",
  "/blog",
  "/blog/building-a-trading-affiliate-website",
  "/risk-disclosure",
  "/contact"
];

const missing = requiredPaths.filter((route) => {
  const url = `https://iederees-create.github.io/deriv-affiliate-launchpad-template${route === "/" ? "/" : route}`;
  return !sitemapText.includes(url);
});

if (missing.length > 0) {
  console.error(`Missing sitemap routes: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`Internal route manifest OK: ${requiredPaths.length} routes listed in sitemap.`);
