// frontend/scripts/replace-axios-with-api.js
// ESM-compatible replacement script.
// Usage: from frontend/ run: node scripts/replace-axios-with-api.js

import fs from "fs";
import path from "path";

const SRC_DIR = path.join(process.cwd(), "src");
const UTILS_API = path.join(SRC_DIR, "utils", "api.js"); // target module
if (!fs.existsSync(UTILS_API)) {
  console.error("ERROR: src/utils/api.js not found. Create it first (shared axios instance).");
  process.exit(1);
}

const exts = [".js", ".jsx", ".ts", ".tsx"];

function walk(dir) {
  const results = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const res = path.resolve(dir, name.name);
    if (name.isDirectory()) {
      results.push(...walk(res));
    } else if (exts.includes(path.extname(res))) {
      results.push(res);
    }
  }
  return results;
}

function computeRelImport(fromFile) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, UTILS_API);
  rel = rel.replace(/\\/g, "/"); // windows -> posix
  rel = rel.replace(/\.js$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

const files = walk(SRC_DIR);
const axiosImportRegex = /import\s+axios\s+from\s+['"]axios['"];?/;
const axiosDotRegex = /\baxios\./g;

const changed = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (!axiosImportRegex.test(text)) continue;

  const relImport = computeRelImport(file);
  let newText = text;

  // replace import line
  newText = newText.replace(axiosImportRegex, `import api from "${relImport}";`);

  // replace axios. -> api.
  newText = newText.replace(axiosDotRegex, "api.");

  // create backup and write
  const bakFile = file + ".bak";
  fs.copyFileSync(file, bakFile);
  fs.writeFileSync(file, newText, "utf8");

  changed.push({ file, bakFile, relImport });
}

if (changed.length === 0) {
  console.log("No files importing axios found under src/. Nothing changed.");
} else {
  console.log("Updated files:");
  for (const c of changed) {
    console.log(" -", c.file, "(bak:", path.basename(c.bakFile) + ")", "import ->", c.relImport);
  }
  console.log("\nDone. Please inspect the modified files and run tests / local dev.");
  console.log("If you need to revert a file: mv <file>.bak <file>");
}
