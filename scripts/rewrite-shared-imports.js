#!/usr/bin/env node
// Rewrites `@/...` imports in a file to relative paths, resolved against shared/.
// Used by scripts/add-shared-ui.sh right after a file is moved into shared/.

const fs = require("fs");
const path = require("path");

const file = process.argv[2];
if (!file) {
  console.error("Usage: rewrite-shared-imports.js <file>");
  process.exit(1);
}

const sharedRoot = path.resolve(__dirname, "..", "shared");
const fileDir = path.dirname(path.resolve(file));

let content = fs.readFileSync(file, "utf8");

const importRegex = /(from\s*|import\s*\()\s*(['"])@\/([^'"]+)\2/g;

content = content.replace(importRegex, (match, prefix, quote, subpath) => {
  const targetAbs = path.join(sharedRoot, subpath);
  let rel = path.relative(fileDir, targetAbs);
  if (!rel.startsWith(".")) rel = "./" + rel;
  rel = rel.split(path.sep).join("/");
  return `${prefix}${quote}${rel}${quote}`;
});

fs.writeFileSync(file, content);
