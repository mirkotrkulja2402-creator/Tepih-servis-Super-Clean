import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePublic = path.join(root, "public");
const clientDist = path.join(root, "client", "dist");

for (const file of ["manifest.webmanifest", "sw.js"]) {
  const source = path.join(sourcePublic, file);
  const target = path.join(clientDist, file);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing root public file: ${source}`);
  }
  if (!fs.existsSync(clientDist)) {
    throw new Error(`Missing client/dist. Run the Vite build first.`);
  }

  fs.copyFileSync(source, target);
  console.log(`Copied ${source} -> ${target}`);
}
