import fs from "node:fs/promises";
import { validateManifest } from "./manifest.mjs";
const file = new URL("../build/manifests/atom.manifest.json", import.meta.url);
try {
  const manifest = JSON.parse(await fs.readFile(file, "utf8"));
  const errors = validateManifest(manifest);
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("IRONFRAME manifest valid.");
} catch (err) {
  console.error("Manifest not validated:", err.message);
  process.exitCode = 1;
}
