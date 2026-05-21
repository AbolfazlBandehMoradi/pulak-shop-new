import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const localesDir = path.join(srcDir, "i18n", "locales");
const locale = "en";
const prefixArg = process.argv.find((arg) => arg.startsWith("--prefix="));
const prefix = prefixArg ? prefixArg.split("=")[1] : "";

const PAGE_NAMESPACES = [
  "about",
  "auth",
  "blog",
  "cart",
  "categories",
  "checkout",
  "comment",
  "contact",
  "faq",
  "footer",
  "payment",
  "privete",
  "product",
  "review",
  "static",
];

const ROOT_FILES = [
  "shop.json",
  path.join("shared", "common.json"),
  path.join("layout", "navbar.json"),
];

function walk(dir, predicate) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(absolute, predicate));
      continue;
    }
    if (!predicate || predicate(absolute)) {
      out.push(absolute);
    }
  }
  return out;
}

function flatten(obj, keyPrefix = "", result = []) {
  if (Array.isArray(obj)) {
    if (keyPrefix) result.push(keyPrefix);
    return result;
  }
  if (obj && typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0 && keyPrefix) result.push(keyPrefix);
    for (const [key, value] of entries) {
      const nextKey = keyPrefix ? `${keyPrefix}.${key}` : key;
      flatten(value, nextKey, result);
    }
    return result;
  }
  if (keyPrefix) result.push(keyPrefix);
  return result;
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function collectTranslationLeafKeys() {
  const keys = new Set();
  const localeRoot = path.join(localesDir, locale);

  for (const rootFile of ROOT_FILES) {
    const fullPath = path.join(localeRoot, rootFile);
    if (!fs.existsSync(fullPath)) continue;
    const data = loadJson(fullPath);
    for (const key of flatten(data)) keys.add(key);
  }

  for (const namespace of PAGE_NAMESPACES) {
    const fullPath = path.join(localeRoot, `${namespace}.json`);
    if (!fs.existsSync(fullPath)) continue;
    const data = loadJson(fullPath);
    for (const leaf of flatten(data)) keys.add(`${namespace}.${leaf}`);
  }

  return [...keys];
}

function collectUsedLiteralKeys() {
  const sourceFiles = walk(srcDir, (file) => /\.(ts|tsx|js|jsx)$/.test(file));
  const keyRegex = /\bt\(\s*(['"`])([^'"`]+)\1/g;
  const keys = new Set();

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, "utf8");
    let match;
    while ((match = keyRegex.exec(content))) {
      const key = match[2];
      if (!key.includes("${")) {
        keys.add(key);
      }
    }
  }

  return [...keys];
}

function isLeafCoveredByUsedKey(leafKey, usedKeys) {
  return usedKeys.some((usedKey) => usedKey === leafKey || leafKey.startsWith(`${usedKey}.`));
}

function isUsedKeyKnown(usedKey, leafKeys) {
  return leafKeys.some((leafKey) => leafKey === usedKey || leafKey.startsWith(`${usedKey}.`));
}

function shouldKeepKey(key) {
  if (!prefix) return true;
  return key === prefix || key.startsWith(`${prefix}.`);
}

const leafKeys = collectTranslationLeafKeys();
const usedKeys = collectUsedLiteralKeys();

const filteredLeafKeys = leafKeys.filter(shouldKeepKey);
const filteredUsedKeys = usedKeys.filter(shouldKeepKey);

const unusedKeys = filteredLeafKeys.filter(
  (leafKey) => !isLeafCoveredByUsedKey(leafKey, filteredUsedKeys),
);
const missingKeys = filteredUsedKeys.filter((usedKey) => !isUsedKeyKnown(usedKey, filteredLeafKeys));

console.log(`Locale: ${locale}`);
console.log(`Filter prefix: ${prefix || "(none)"}`);
console.log(`Used literal keys (filtered): ${filteredUsedKeys.length}`);
console.log(`Translation leaf keys (filtered): ${filteredLeafKeys.length}`);
console.log(`Potentially missing keys: ${missingKeys.length}`);
console.log(`Potentially unused keys: ${unusedKeys.length}`);

if (missingKeys.length > 0) {
  console.log("\nMissing keys:");
  for (const key of missingKeys.sort()) console.log(`- ${key}`);
}

if (unusedKeys.length > 0) {
  console.log("\nUnused keys:");
  for (const key of unusedKeys.sort()) console.log(`- ${key}`);
}
