import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve from this script, so invoking it from another directory is safe.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "offline");
// Only replace generated output; stale assets must not leak into a new delivery.
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ["src/main.jsx"],
  bundle: true,
  format: "iife",
  minify: true,
  outfile: path.join(out, "app.js"),
  define: { "process.env.NODE_ENV": '"production"' },
});
fs.cpSync(path.join(root, "public/assets"), path.join(out, "assets"), {
  recursive: true,
});
fs.writeFileSync(
  path.join(out, "index.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Play Through Time — Single Player</title><link rel="stylesheet" href="app.css"></head><body><div id="root"></div><script src="app.js"></script></body></html>',
);
fs.copyFileSync(path.join(root, "README.md"), path.join(out, "README.md"));
// Ship editable source without caches, dependencies, previous ZIPs or QA screenshots.
const source = path.join(out, "source");
fs.mkdirSync(source);
for (const item of [
  "src",
  "public",
  "scripts",
  "tests",
  "worker",
  ".openai",
  "index.html",
  "vite.config.mjs",
  "package.json",
  "package-lock.json",
  "README.md",
  "asset-generation.md",
  "design-qa.md",
]) {
  fs.cpSync(path.join(root, item), path.join(source, item), {
    recursive: true,
  });
}
console.log(`Offline delivery ready: ${out}`);
