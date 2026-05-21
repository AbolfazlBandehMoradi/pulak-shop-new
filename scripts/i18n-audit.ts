#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const SCRIPT_VERSION = 1;
const DEFAULT_LOCALE = "en";
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = Record<string, JsonValue>;

interface CliOptions {
  help: boolean;
  locale: string;
  prefix?: string;
  write: boolean;
  dryRun: boolean;
  deleteFiles: boolean;
  verbose: boolean;
}

interface LeafEntry {
  leafPath: string;
  fullKeys: Set<string>;
  displayKey: string;
}

interface TranslationFileInfo {
  absolutePath: string;
  relativePath: string;
  isRootNamespaceFile: boolean;
  stemNamespace: string;
  namespaces: Set<string>;
  sourceJson: JsonObject;
  leaves: Map<string, LeafEntry>;
}

interface TranslationCatalog {
  files: TranslationFileInfo[];
  knownKeys: Set<string>;
  knownNamespaces: Set<string>;
}

type UsageVia = "t" | "i18n.t" | "Trans" | "wrapper";

interface RawUsage {
  key: string;
  namespaces: string[];
  via: UsageVia;
  file: string;
  line: number;
  column: number;
}

interface SerializedFileScanResult {
  usages: RawUsage[];
  namespaceRefs: string[];
  dynamicIgnored: number;
}

interface SourceScanSummary {
  usages: RawUsage[];
  namespaceRefs: Set<string>;
  dynamicIgnored: number;
  sourceFileCount: number;
  cachedFileCount: number;
}

interface CacheEntry {
  mtimeMs: number;
  size: number;
  result: SerializedFileScanResult;
}

interface CacheData {
  version: number;
  files: Record<string, CacheEntry>;
}

interface WrapperSpec {
  keyParamIndex: number;
  namespaces: string[];
}

interface FunctionContext {
  name?: string;
  paramIndexByName: Map<string, number>;
}

interface LeafUsage {
  file: TranslationFileInfo;
  leafPath: string;
  displayKey: string;
  scopedFullKeys: string[];
  allFullKeys: string[];
  used: boolean;
}

interface FileEditPlan {
  file: TranslationFileInfo;
  removedLeafPaths: string[];
  removedDisplayKeys: string[];
  nextJson: JsonObject;
}

interface UnusedFileResult {
  file: TranslationFileInfo;
  fullyScoped: boolean;
}

function parseCliOptions(args: string[]): CliOptions {
  let help = false;
  let locale = DEFAULT_LOCALE;
  let prefix: string | undefined;
  let write = false;
  let dryRun = false;
  let deleteFiles = false;
  let verbose = false;

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg === "--write") {
      write = true;
      continue;
    }
    if (arg === "--delete-files") {
      deleteFiles = true;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--verbose") {
      verbose = true;
      continue;
    }
    if (arg.startsWith("--locale=")) {
      locale = arg.slice("--locale=".length).trim();
      continue;
    }
    if (arg.startsWith("--prefix=")) {
      const value = arg.slice("--prefix=".length).trim();
      prefix = value || undefined;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!locale) {
    throw new Error("Locale cannot be empty.");
  }
  if (!write) {
    dryRun = true;
  }

  return {
    help,
    locale,
    prefix,
    write,
    dryRun,
    deleteFiles,
    verbose,
  };
}

function printUsage(): void {
  console.log(`i18n audit / cleanup utility

Usage:
  node scripts/i18n-audit.ts [flags]

Flags:
  --locale=<code>      Locale folder under src/i18n/locales (default: en)
  --prefix=<key>       Only analyze keys under this prefix (example: auth)
  --write              Apply JSON key removals
  --delete-files       Delete completely unused namespace files
  --dry-run            Preview actions without writing (default unless --write)
  --verbose            Print detailed per-file and per-key output
  --help, -h           Show this help

Examples:
  node scripts/i18n-audit.ts
  node scripts/i18n-audit.ts --locale=en --prefix=auth
  node scripts/i18n-audit.ts --locale=en --write --delete-files
`);
}

function walkFiles(dir: string, predicate?: (filePath: string) => boolean): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));
  const out: string[] = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(absolute, predicate));
      continue;
    }
    if (!predicate || predicate(absolute)) {
      out.push(absolute);
    }
  }

  return out;
}

function toPosixPath(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function loadJsonObject(filePath: string): JsonObject {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!isJsonObject(parsed)) {
    throw new Error(`Expected JSON object in ${filePath}`);
  }
  return parsed;
}

function flattenLeafPaths(value: JsonValue, prefix = "", out: string[] = []): string[] {
  if (Array.isArray(value)) {
    if (prefix) out.push(prefix);
    return out;
  }

  if (isJsonObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0 && prefix) {
      out.push(prefix);
      return out;
    }
    for (const [key, nextValue] of entries) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      flattenLeafPaths(nextValue, nextPrefix, out);
    }
    return out;
  }

  if (prefix) {
    out.push(prefix);
  }
  return out;
}

function uniqueStrings(values: Iterable<string>): string[] {
  return [...new Set([...values].filter(Boolean))];
}

function firstSegment(value: string): string {
  const index = value.indexOf(".");
  return index === -1 ? value : value.slice(0, index);
}

function addToSetMap(map: Map<string, Set<string>>, key: string, value: string): void {
  const current = map.get(key);
  if (current) {
    current.add(value);
    return;
  }
  map.set(key, new Set([value]));
}

function getPropertyNameText(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  if (ts.isComputedPropertyName(name)) {
    if (ts.isStringLiteral(name.expression) || ts.isNoSubstitutionTemplateLiteral(name.expression)) {
      return name.expression.text;
    }
  }
  return undefined;
}

function scriptKindFromPath(filePath: string): ts.ScriptKind {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".ts") return ts.ScriptKind.TS;
  if (ext === ".tsx") return ts.ScriptKind.TSX;
  if (ext === ".jsx") return ts.ScriptKind.JSX;
  return ts.ScriptKind.JS;
}

function discoverNamespaceAliases(
  localesDir: string,
  locale: string,
  localeNames: Set<string>,
): Map<string, Set<string>> {
  const aliases = new Map<string, Set<string>>();
  const localePrefix = `./${locale}/`;

  const configFiles = walkFiles(localesDir, (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    return SOURCE_EXTENSIONS.has(ext);
  });

  for (const filePath of configFiles) {
    const sourceText = fs.readFileSync(filePath, "utf8");
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      scriptKindFromPath(filePath),
    );

    const importToJsonPath = new Map<string, string>();

    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
        continue;
      }
      const modulePath = statement.moduleSpecifier.text.replace(/\\/g, "/");
      if (!modulePath.startsWith(localePrefix) || !modulePath.endsWith(".json")) {
        continue;
      }
      const relativeJsonPath = modulePath.slice(localePrefix.length);
      const clause = statement.importClause;
      if (!clause) continue;

      if (clause.name) {
        importToJsonPath.set(clause.name.text, relativeJsonPath);
      }
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const spec of clause.namedBindings.elements) {
          importToJsonPath.set(spec.name.text, relativeJsonPath);
        }
      }
    }

    if (importToJsonPath.size === 0) {
      continue;
    }

    const visit = (node: ts.Node): void => {
      if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.initializer)) {
        const relativeJsonPath = importToJsonPath.get(node.initializer.text);
        if (relativeJsonPath) {
          const namespace = getPropertyNameText(node.name);
          if (namespace && !localeNames.has(namespace)) {
            addToSetMap(aliases, toPosixPath(relativeJsonPath), namespace);
          }
        }
      }

      if (ts.isShorthandPropertyAssignment(node)) {
        const relativeJsonPath = importToJsonPath.get(node.name.text);
        if (relativeJsonPath && !localeNames.has(node.name.text)) {
          addToSetMap(aliases, toPosixPath(relativeJsonPath), node.name.text);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  return aliases;
}

function listLocaleNames(localesDir: string): Set<string> {
  if (!fs.existsSync(localesDir)) return new Set();
  const names = new Set<string>();
  const entries = fs.readdirSync(localesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      names.add(entry.name);
    }
  }
  return names;
}

function addLeafEntry(leaves: Map<string, LeafEntry>, leafPath: string, fullKeys: Set<string>): void {
  const existing = leaves.get(leafPath);
  if (!existing) {
    const sorted = [...fullKeys].sort();
    leaves.set(leafPath, {
      leafPath,
      fullKeys,
      displayKey: sorted[0] ?? leafPath,
    });
    return;
  }

  for (const key of fullKeys) {
    existing.fullKeys.add(key);
  }
  const sorted = [...existing.fullKeys].sort();
  existing.displayKey = sorted[0] ?? leafPath;
}

function buildTranslationCatalog(
  localeRootDir: string,
  aliasMap: Map<string, Set<string>>,
): TranslationCatalog {
  const files = walkFiles(localeRootDir, (filePath) => filePath.toLowerCase().endsWith(".json"));
  const catalogFiles: TranslationFileInfo[] = [];
  const knownKeys = new Set<string>();
  const knownNamespaces = new Set<string>();

  for (const filePath of files) {
    const relativePath = toPosixPath(path.relative(localeRootDir, filePath));
    const sourceJson = loadJsonObject(filePath);
    const leafPaths = flattenLeafPaths(sourceJson);
    const isRootNamespaceFile = !relativePath.includes("/");
    const stemNamespace = stripExtension(relativePath).replace(/\//g, ".");
    const leaves = new Map<string, LeafEntry>();
    const namespaces = new Set<string>();

    if (isRootNamespaceFile) {
      const aliases = aliasMap.get(relativePath);
      const namespaceCandidates = new Set<string>([stemNamespace]);
      if (aliases) {
        for (const alias of aliases) namespaceCandidates.add(alias);
      }

      for (const namespace of namespaceCandidates) {
        if (namespace) namespaces.add(namespace);
      }

      for (const leafPath of leafPaths) {
        const fullKeys = new Set<string>();
        for (const namespace of namespaces) {
          fullKeys.add(leafPath ? `${namespace}.${leafPath}` : namespace);
        }
        addLeafEntry(leaves, leafPath, fullKeys);
      }
    } else {
      for (const leafPath of leafPaths) {
        if (!leafPath) continue;
        const fullKeys = new Set<string>([leafPath]);
        addLeafEntry(leaves, leafPath, fullKeys);
        namespaces.add(firstSegment(leafPath));
      }

      if (namespaces.size === 0) {
        for (const key of Object.keys(sourceJson)) {
          namespaces.add(key);
        }
      }
    }

    for (const leaf of leaves.values()) {
      for (const fullKey of leaf.fullKeys) {
        knownKeys.add(fullKey);
      }
    }
    for (const namespace of namespaces) {
      if (namespace) knownNamespaces.add(namespace);
    }

    catalogFiles.push({
      absolutePath: filePath,
      relativePath,
      isRootNamespaceFile,
      stemNamespace,
      namespaces,
      sourceJson,
      leaves,
    });
  }

  return {
    files: catalogFiles,
    knownKeys,
    knownNamespaces,
  };
}

function isTranslationHookName(name: string): boolean {
  return /^use[A-Za-z0-9]*Translation$/.test(name);
}

function getStaticString(expression: ts.Expression | undefined): string | undefined {
  if (!expression) return undefined;
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  return undefined;
}

function getStaticStringArray(expression: ts.Expression | undefined): string[] {
  if (!expression) return [];
  const single = getStaticString(expression);
  if (single !== undefined) {
    return single ? [single] : [];
  }
  if (!ts.isArrayLiteralExpression(expression)) {
    return [];
  }

  const values: string[] = [];
  for (const element of expression.elements) {
    if (!ts.isStringLiteral(element) && !ts.isNoSubstitutionTemplateLiteral(element)) {
      continue;
    }
    if (element.text) {
      values.push(element.text);
    }
  }
  return uniqueStrings(values);
}

function getObjectPropertyExpression(
  objectLiteral: ts.ObjectLiteralExpression,
  propertyName: string,
): ts.Expression | undefined {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = getPropertyNameText(property.name);
    if (name === propertyName) {
      return property.initializer;
    }
  }
  return undefined;
}

function extractNamespacesFromTOptions(optionsExpression: ts.Expression | undefined): string[] {
  if (!optionsExpression || !ts.isObjectLiteralExpression(optionsExpression)) {
    return [];
  }
  const nsExpression = getObjectPropertyExpression(optionsExpression, "ns");
  return getStaticStringArray(nsExpression);
}

function isHookCallExpression(call: ts.CallExpression, hookNames: Set<string>): boolean {
  if (ts.isIdentifier(call.expression)) {
    const name = call.expression.text;
    return hookNames.has(name) || isTranslationHookName(name);
  }

  if (ts.isPropertyAccessExpression(call.expression)) {
    const name = call.expression.name.text;
    return hookNames.has(name) || isTranslationHookName(name);
  }

  return false;
}

function extractNamespacesFromHookCall(call: ts.CallExpression, hookNames: Set<string>): string[] {
  if (!isHookCallExpression(call, hookNames)) {
    return [];
  }

  const fromFirstArg = getStaticStringArray(call.arguments[0]);
  if (fromFirstArg.length > 0) {
    return fromFirstArg;
  }

  const fromSecondArg = extractNamespacesFromTOptions(call.arguments[1]);
  if (fromSecondArg.length > 0) {
    return fromSecondArg;
  }

  return [];
}

function mergeBinding(map: Map<string, string[]>, name: string, namespaces: string[]): void {
  const existing = map.get(name);
  if (!existing) {
    map.set(name, uniqueStrings(namespaces));
    return;
  }
  map.set(name, uniqueStrings([...existing, ...namespaces]));
}

function mergeWrapperSpec(map: Map<string, WrapperSpec[]>, name: string, spec: WrapperSpec): void {
  const current = map.get(name);
  if (!current) {
    map.set(name, [spec]);
    return;
  }

  const sameIndex = current.find((entry) => entry.keyParamIndex === spec.keyParamIndex);
  if (!sameIndex) {
    current.push(spec);
    return;
  }

  sameIndex.namespaces = uniqueStrings([...sameIndex.namespaces, ...spec.namespaces]);
}

function collectImportHints(
  sourceFile: ts.SourceFile,
  hookNames: Set<string>,
  transNames: Set<string>,
): void {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }

    const modulePath = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (!clause) continue;

    if (clause.name) {
      const local = clause.name.text;
      if (isTranslationHookName(local)) {
        hookNames.add(local);
      }
      if (local === "Trans") {
        transNames.add(local);
      }
    }

    if (!clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
      continue;
    }

    for (const spec of clause.namedBindings.elements) {
      const imported = spec.propertyName?.text ?? spec.name.text;
      const local = spec.name.text;
      if (imported === "useTranslation" || isTranslationHookName(imported) || isTranslationHookName(local)) {
        hookNames.add(local);
      }
      if (imported === "Trans" || local === "Trans") {
        transNames.add(local);
      }

      if ((/i18n/i.test(modulePath) || /react-i18next/i.test(modulePath)) && isTranslationHookName(local)) {
        hookNames.add(local);
      }
    }
  }
}

function readCache(cacheFilePath: string): CacheData {
  if (!fs.existsSync(cacheFilePath)) {
    return { version: SCRIPT_VERSION, files: {} };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(cacheFilePath, "utf8")) as CacheData;
    if (parsed.version !== SCRIPT_VERSION || !parsed.files || typeof parsed.files !== "object") {
      return { version: SCRIPT_VERSION, files: {} };
    }
    return parsed;
  } catch {
    return { version: SCRIPT_VERSION, files: {} };
  }
}

function writeCache(cacheFilePath: string, cache: CacheData): void {
  try {
    const cacheDir = path.dirname(cacheFilePath);
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), "utf8");
  } catch {
    // Cache failures should never block audits.
  }
}

function scanSourceFiles(srcDir: string, rootDir: string, cacheFilePath: string): SourceScanSummary {
  const sourceFiles = walkFiles(srcDir, (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    return SOURCE_EXTENSIONS.has(ext);
  });

  const cache = readCache(cacheFilePath);
  const nextCache: CacheData = { version: SCRIPT_VERSION, files: {} };

  const usages: RawUsage[] = [];
  const namespaceRefs = new Set<string>();
  let dynamicIgnored = 0;
  let cachedFileCount = 0;

  for (const filePath of sourceFiles) {
    const relativeCacheKey = toPosixPath(path.relative(rootDir, filePath));
    const stat = fs.statSync(filePath);
    const cached = cache.files[relativeCacheKey];

    let result: SerializedFileScanResult;
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      result = cached.result;
      cachedFileCount += 1;
    } else {
      const sourceText = fs.readFileSync(filePath, "utf8");
      result = scanSingleSourceFile(filePath, sourceText);
    }

    nextCache.files[relativeCacheKey] = {
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      result,
    };

    usages.push(...result.usages);
    for (const namespace of result.namespaceRefs) {
      if (namespace) namespaceRefs.add(namespace);
    }
    dynamicIgnored += result.dynamicIgnored;
  }

  writeCache(cacheFilePath, nextCache);

  return {
    usages,
    namespaceRefs,
    dynamicIgnored,
    sourceFileCount: sourceFiles.length,
    cachedFileCount,
  };
}

function scanSingleSourceFile(filePath: string, sourceText: string): SerializedFileScanResult {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFromPath(filePath),
  );

  const hookNames = new Set<string>(["useTranslation"]);
  const transNames = new Set<string>(["Trans"]);
  collectImportHints(sourceFile, hookNames, transNames);

  const tBindings = new Map<string, string[]>();
  const hookObjectBindings = new Map<string, string[]>();
  const i18nBindings = new Map<string, string[]>();
  const refBindings = new Map<string, string[]>();
  const wrapperBindings = new Map<string, WrapperSpec[]>();
  const namespaceRefs = new Set<string>();
  const usages: RawUsage[] = [];
  let dynamicIgnored = 0;

  const functionNameByNode = new WeakMap<ts.FunctionLikeDeclarationBase, string>();

  function registerFunctionNameFromDeclaration(declaration: ts.VariableDeclaration): void {
    if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
      return;
    }

    if (
      ts.isFunctionExpression(declaration.initializer) ||
      ts.isArrowFunction(declaration.initializer)
    ) {
      functionNameByNode.set(declaration.initializer, declaration.name.text);
      return;
    }

    if (ts.isCallExpression(declaration.initializer)) {
      const maybeFunction = declaration.initializer.arguments[0];
      if (maybeFunction && (ts.isFunctionExpression(maybeFunction) || ts.isArrowFunction(maybeFunction))) {
        functionNameByNode.set(maybeFunction, declaration.name.text);
      }
    }
  }

  function makeFunctionContext(node: ts.Node): FunctionContext | undefined {
    if (
      !ts.isFunctionDeclaration(node) &&
      !ts.isFunctionExpression(node) &&
      !ts.isArrowFunction(node) &&
      !ts.isMethodDeclaration(node)
    ) {
      return undefined;
    }

    const paramIndexByName = new Map<string, number>();
    node.parameters.forEach((parameter, index) => {
      if (ts.isIdentifier(parameter.name)) {
        paramIndexByName.set(parameter.name.text, index);
      }
    });

    const explicitName =
      "name" in node && node.name && ts.isIdentifier(node.name) ? node.name.text : undefined;
    const inferredName = functionNameByNode.get(node);
    const name = explicitName ?? inferredName;

    return { name, paramIndexByName };
  }

  function bindFromPattern(
    bindingName: ts.BindingName,
    namespaces: string[],
    targetObjectMap?: Map<string, string[]>,
  ): void {
    const normalized = uniqueStrings(namespaces);

    if (ts.isObjectBindingPattern(bindingName)) {
      for (const element of bindingName.elements) {
        if (element.dotDotDotToken) continue;
        if (!ts.isIdentifier(element.name)) continue;
        const localName = element.name.text;
        const propertyName = element.propertyName
          ? ts.isIdentifier(element.propertyName) ||
            ts.isStringLiteral(element.propertyName) ||
            ts.isNumericLiteral(element.propertyName)
            ? element.propertyName.text
            : undefined
          : localName;
        if (propertyName === "t") {
          mergeBinding(tBindings, localName, normalized);
        } else if (propertyName === "i18n") {
          mergeBinding(i18nBindings, localName, normalized);
        }
      }
      return;
    }

    if (ts.isArrayBindingPattern(bindingName)) {
      const first = bindingName.elements[0];
      const second = bindingName.elements[1];
      if (first && ts.isBindingElement(first) && ts.isIdentifier(first.name)) {
        mergeBinding(tBindings, first.name.text, normalized);
      }
      if (second && ts.isBindingElement(second) && ts.isIdentifier(second.name)) {
        mergeBinding(i18nBindings, second.name.text, normalized);
      }
      return;
    }

    if (ts.isIdentifier(bindingName)) {
      if (targetObjectMap) {
        mergeBinding(targetObjectMap, bindingName.text, normalized);
      } else {
        mergeBinding(hookObjectBindings, bindingName.text, normalized);
      }
    }
  }

  interface TranslationCallContext {
    namespaces: string[];
    via: UsageVia;
  }

  function getTranslationCallContext(call: ts.CallExpression): TranslationCallContext | undefined {
    const callee = call.expression;

    if (ts.isIdentifier(callee)) {
      if (tBindings.has(callee.text)) {
        return { namespaces: tBindings.get(callee.text) ?? [], via: "t" };
      }
      if (callee.text === "t") {
        return { namespaces: [], via: "t" };
      }
      return undefined;
    }

    if (!ts.isPropertyAccessExpression(callee)) {
      return undefined;
    }

    const property = callee.name.text;

    if (property === "current" && ts.isIdentifier(callee.expression)) {
      const refNamespaces = refBindings.get(callee.expression.text);
      if (refNamespaces) {
        return { namespaces: refNamespaces, via: "t" };
      }
    }

    if (property !== "t") {
      return undefined;
    }

    if (!ts.isIdentifier(callee.expression)) {
      return undefined;
    }

    const objectName = callee.expression.text;
    if (i18nBindings.has(objectName)) {
      return { namespaces: i18nBindings.get(objectName) ?? [], via: "i18n.t" };
    }
    if (hookObjectBindings.has(objectName)) {
      return { namespaces: hookObjectBindings.get(objectName) ?? [], via: "t" };
    }
    if (objectName === "i18n") {
      return { namespaces: [], via: "i18n.t" };
    }

    return undefined;
  }

  function addUsage(key: string, namespaces: string[], via: UsageVia, node: ts.Node): void {
    if (!key) return;
    const normalizedNamespaces = uniqueStrings(namespaces);
    for (const namespace of normalizedNamespaces) {
      if (namespace) namespaceRefs.add(namespace);
    }
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    usages.push({
      key,
      namespaces: normalizedNamespaces,
      via,
      file: filePath,
      line: position.line + 1,
      column: position.character + 1,
    });
  }

  function maybeRegisterWrapperFromCall(call: ts.CallExpression, functionContext?: FunctionContext): void {
    const callContext = getTranslationCallContext(call);
    if (!callContext || !functionContext?.name) {
      return;
    }

    const keyArg = call.arguments[0];
    if (!keyArg || !ts.isIdentifier(keyArg)) {
      return;
    }

    const paramIndex = functionContext.paramIndexByName.get(keyArg.text);
    if (paramIndex === undefined) {
      return;
    }

    const optionNamespaces = extractNamespacesFromTOptions(call.arguments[1]);
    const namespaces = optionNamespaces.length > 0 ? optionNamespaces : callContext.namespaces;
    mergeWrapperSpec(wrapperBindings, functionContext.name, {
      keyParamIndex: paramIndex,
      namespaces: uniqueStrings(namespaces),
    });
  }

  function processVariableDeclaration(declaration: ts.VariableDeclaration): void {
    registerFunctionNameFromDeclaration(declaration);
    const initializer = declaration.initializer;
    if (!initializer) return;

    if (ts.isCallExpression(initializer) && isHookCallExpression(initializer, hookNames)) {
      const namespaces = extractNamespacesFromHookCall(initializer, hookNames);
      for (const namespace of namespaces) namespaceRefs.add(namespace);
      bindFromPattern(declaration.name, namespaces);
      return;
    }

    if (ts.isIdentifier(initializer)) {
      const namespaces = hookObjectBindings.get(initializer.text);
      if (namespaces) {
        bindFromPattern(declaration.name, namespaces);
      }
      return;
    }

    if (ts.isPropertyAccessExpression(initializer)) {
      if (!ts.isIdentifier(initializer.expression)) return;
      const baseName = initializer.expression.text;
      const propertyName = initializer.name.text;

      if (propertyName === "t") {
        const namespaces =
          hookObjectBindings.get(baseName) ?? i18nBindings.get(baseName) ?? refBindings.get(baseName);
        if (namespaces && ts.isIdentifier(declaration.name)) {
          mergeBinding(tBindings, declaration.name.text, namespaces);
        }
        return;
      }

      if (propertyName === "i18n") {
        const namespaces = hookObjectBindings.get(baseName);
        if (namespaces && ts.isIdentifier(declaration.name)) {
          mergeBinding(i18nBindings, declaration.name.text, namespaces);
        }
        return;
      }

      if (propertyName === "current") {
        const namespaces = refBindings.get(baseName);
        if (namespaces && ts.isIdentifier(declaration.name)) {
          mergeBinding(tBindings, declaration.name.text, namespaces);
        }
        return;
      }
    }

    if (
      ts.isIdentifier(declaration.name) &&
      ts.isCallExpression(initializer) &&
      ts.isIdentifier(initializer.expression) &&
      initializer.expression.text === "useRef"
    ) {
      const firstArg = initializer.arguments[0];
      if (firstArg && ts.isIdentifier(firstArg)) {
        const namespaces = tBindings.get(firstArg.text);
        if (namespaces) {
          mergeBinding(refBindings, declaration.name.text, namespaces);
        }
      }
    }
  }

  const firstPassVisit = (node: ts.Node, functionContext?: FunctionContext): void => {
    if (ts.isVariableDeclaration(node)) {
      processVariableDeclaration(node);
    }

    if (ts.isCallExpression(node)) {
      const hookNamespaces = extractNamespacesFromHookCall(node, hookNames);
      for (const namespace of hookNamespaces) {
        namespaceRefs.add(namespace);
      }
      maybeRegisterWrapperFromCall(node, functionContext);
    }

    const nextFunctionContext = makeFunctionContext(node) ?? functionContext;
    ts.forEachChild(node, (child) => firstPassVisit(child, nextFunctionContext));
  };

  firstPassVisit(sourceFile);

  function getJsxAttribute(
    attributes: ts.JsxAttributes,
    attributeName: string,
  ): ts.JsxAttribute | undefined {
    for (const property of attributes.properties) {
      if (!ts.isJsxAttribute(property)) continue;
      if (property.name.text === attributeName) {
        return property;
      }
    }
    return undefined;
  }

  function getStaticStringFromJsxAttribute(attribute: ts.JsxAttribute | undefined): string | undefined {
    if (!attribute?.initializer) return undefined;
    if (ts.isStringLiteral(attribute.initializer)) {
      return attribute.initializer.text;
    }
    if (ts.isJsxExpression(attribute.initializer)) {
      return getStaticString(attribute.initializer.expression);
    }
    return undefined;
  }

  function getStringArrayFromJsxAttribute(attribute: ts.JsxAttribute | undefined): string[] {
    if (!attribute?.initializer) return [];
    if (ts.isStringLiteral(attribute.initializer)) {
      return attribute.initializer.text ? [attribute.initializer.text] : [];
    }
    if (ts.isJsxExpression(attribute.initializer)) {
      return getStaticStringArray(attribute.initializer.expression);
    }
    return [];
  }

  const secondPassVisit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression)) {
        const wrappers = wrapperBindings.get(node.expression.text);
        if (wrappers && wrappers.length > 0) {
          for (const wrapper of wrappers) {
            const candidateArg = node.arguments[wrapper.keyParamIndex];
            const staticKey = getStaticString(candidateArg);
            if (staticKey !== undefined) {
              addUsage(staticKey, wrapper.namespaces, "wrapper", node);
            } else if (candidateArg) {
              dynamicIgnored += 1;
            }
          }
        }
      }

      const callContext = getTranslationCallContext(node);
      if (callContext) {
        const keyArg = node.arguments[0];
        const staticKey = getStaticString(keyArg);
        const optionNamespaces = extractNamespacesFromTOptions(node.arguments[1]);
        const namespaces = optionNamespaces.length > 0 ? optionNamespaces : callContext.namespaces;
        if (staticKey !== undefined) {
          addUsage(staticKey, namespaces, callContext.via, node);
        } else if (keyArg) {
          dynamicIgnored += 1;
        }
      }
    }

    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      if (ts.isIdentifier(node.tagName) && transNames.has(node.tagName.text)) {
        const i18nKeyAttribute = getJsxAttribute(node.attributes, "i18nKey");
        const nsAttribute = getJsxAttribute(node.attributes, "ns");
        const staticKey = getStaticStringFromJsxAttribute(i18nKeyAttribute);
        const namespaces = getStringArrayFromJsxAttribute(nsAttribute);

        if (staticKey !== undefined) {
          addUsage(staticKey, namespaces, "Trans", node);
        } else if (i18nKeyAttribute) {
          dynamicIgnored += 1;
        }

        for (const namespace of namespaces) {
          if (namespace) namespaceRefs.add(namespace);
        }
      }
    }

    ts.forEachChild(node, secondPassVisit);
  };

  secondPassVisit(sourceFile);

  return {
    usages,
    namespaceRefs: [...namespaceRefs],
    dynamicIgnored,
  };
}

function matchesPrefix(key: string, prefix?: string): boolean {
  if (!prefix) return true;
  return key === prefix || key.startsWith(`${prefix}.`);
}

function resolveUsageKey(rawKey: string, namespaces: string[], knownNamespaces: Set<string>): string[] {
  const key = rawKey.trim();
  if (!key) return [];

  const out = new Set<string>();

  const colonIndex = key.indexOf(":");
  if (colonIndex > 0 && !key.includes("://")) {
    const nsPart = key.slice(0, colonIndex);
    const keyPart = key.slice(colonIndex + 1);
    if (nsPart && keyPart) {
      out.add(`${nsPart}.${keyPart}`);
      return [...out];
    }
    if (nsPart) {
      out.add(nsPart);
      return [...out];
    }
  }

  const hasDot = key.includes(".");
  const first = firstSegment(key);
  const firstIsKnownNamespace = knownNamespaces.has(first);
  const contextNamespaces = uniqueStrings(namespaces);

  if ((hasDot && firstIsKnownNamespace) || (!hasDot && knownNamespaces.has(key))) {
    out.add(key);
  }

  if (contextNamespaces.length > 0) {
    const shouldPrefix = !(hasDot && firstIsKnownNamespace) && !(!hasDot && knownNamespaces.has(key));
    if (shouldPrefix) {
      for (const ns of contextNamespaces) {
        out.add(key ? `${ns}.${key}` : ns);
      }
    }
    if (hasDot && !firstIsKnownNamespace) {
      out.add(key);
    }
  } else if (out.size === 0) {
    out.add(key);
  }

  return [...out];
}

function keyCoveredByUsedKey(key: string, usedKeys: string[]): boolean {
  for (const usedKey of usedKeys) {
    if (key === usedKey || key.startsWith(`${usedKey}.`)) {
      return true;
    }
  }
  return false;
}

function knownKeyOrParentExists(key: string, knownKeys: string[]): boolean {
  for (const knownKey of knownKeys) {
    if (knownKey === key || knownKey.startsWith(`${key}.`)) {
      return true;
    }
  }
  return false;
}

function analyzeLeafUsage(
  catalog: TranslationCatalog,
  usedResolvedKeys: Set<string>,
  prefix?: string,
): LeafUsage[] {
  const usedList = [...usedResolvedKeys];
  const out: LeafUsage[] = [];

  for (const file of catalog.files) {
    for (const leaf of file.leaves.values()) {
      const allFullKeys = [...leaf.fullKeys];
      const scopedFullKeys = allFullKeys.filter((key) => matchesPrefix(key, prefix));
      if (scopedFullKeys.length === 0) {
        continue;
      }
      const used = allFullKeys.some((key) => keyCoveredByUsedKey(key, usedList));
      const displayKey = [...scopedFullKeys].sort()[0] ?? leaf.displayKey;
      out.push({
        file,
        leafPath: leaf.leafPath,
        displayKey,
        scopedFullKeys,
        allFullKeys,
        used,
      });
    }
  }

  return out;
}

function deepCloneJsonObject(value: JsonObject): JsonObject {
  return JSON.parse(JSON.stringify(value)) as JsonObject;
}

function removeLeafPathAndPrune(current: JsonObject, leafPath: string): boolean {
  const segments = leafPath.split(".");

  const removeAt = (value: unknown, index: number): boolean => {
    if (!isJsonObject(value)) {
      return false;
    }

    const segment = segments[index];
    if (!(segment in value)) {
      return false;
    }

    if (index === segments.length - 1) {
      delete value[segment];
      return true;
    }

    const nextValue = value[segment];
    const removed = removeAt(nextValue, index + 1);
    if (!removed) {
      return false;
    }

    if (isJsonObject(nextValue) && Object.keys(nextValue).length === 0) {
      delete value[segment];
    }
    return true;
  };

  return removeAt(current, 0);
}

function isFileFullyScoped(file: TranslationFileInfo, prefix?: string): boolean {
  if (!prefix) return true;
  if (file.leaves.size === 0) return false;

  for (const leaf of file.leaves.values()) {
    for (const key of leaf.fullKeys) {
      if (!matchesPrefix(key, prefix)) {
        return false;
      }
    }
  }

  return true;
}

function buildEditPlans(leafUsage: LeafUsage[], filesMarkedForDeletion: Set<string>): FileEditPlan[] {
  const byFile = new Map<string, LeafUsage[]>();
  for (const item of leafUsage) {
    if (item.used) continue;
    if (filesMarkedForDeletion.has(item.file.absolutePath)) continue;
    const current = byFile.get(item.file.absolutePath) ?? [];
    current.push(item);
    byFile.set(item.file.absolutePath, current);
  }

  const plans: FileEditPlan[] = [];
  for (const [filePath, fileItems] of byFile) {
    const file = fileItems[0].file;
    const nextJson = deepCloneJsonObject(file.sourceJson);
    const removedLeafPaths: string[] = [];
    const removedDisplayKeys: string[] = [];

    for (const item of fileItems) {
      const removed = removeLeafPathAndPrune(nextJson, item.leafPath);
      if (!removed) continue;
      removedLeafPaths.push(item.leafPath);
      removedDisplayKeys.push(item.displayKey);
    }

    if (removedLeafPaths.length === 0) continue;
    plans.push({
      file,
      removedLeafPaths,
      removedDisplayKeys: uniqueStrings(removedDisplayKeys).sort(),
      nextJson,
    });
  }

  return plans.sort((a, b) => a.file.relativePath.localeCompare(b.file.relativePath));
}

function findUnusedFiles(
  catalog: TranslationCatalog,
  leafUsage: LeafUsage[],
  namespaceRefs: Set<string>,
  prefix?: string,
): UnusedFileResult[] {
  const usageByFile = new Map<string, LeafUsage[]>();
  for (const item of leafUsage) {
    const current = usageByFile.get(item.file.absolutePath) ?? [];
    current.push(item);
    usageByFile.set(item.file.absolutePath, current);
  }

  const out: UnusedFileResult[] = [];
  for (const file of catalog.files) {
    const items = usageByFile.get(file.absolutePath) ?? [];
    if (items.length === 0) continue;

    const usedLeafCount = items.filter((item) => item.used).length;
    const namespaceReferenced = [...file.namespaces].some(
      (namespace) => namespaceRefs.has(namespace) && matchesPrefix(namespace, prefix),
    );

    if (usedLeafCount === 0 && !namespaceReferenced) {
      out.push({
        file,
        fullyScoped: isFileFullyScoped(file, prefix),
      });
    }
  }

  return out.sort((a, b) => a.file.relativePath.localeCompare(b.file.relativePath));
}

function main(): void {
  const options = parseCliOptions(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, "src");
  const localesDir = path.join(srcDir, "i18n", "locales");
  const localeRootDir = path.join(localesDir, options.locale);
  const cacheFilePath = path.join(rootDir, "dist", ".cache", "i18n-audit-cache.json");

  if (!fs.existsSync(localeRootDir)) {
    throw new Error(`Locale directory does not exist: ${localeRootDir}`);
  }

  const localeNames = listLocaleNames(localesDir);
  const namespaceAliases = discoverNamespaceAliases(localesDir, options.locale, localeNames);
  const catalog = buildTranslationCatalog(localeRootDir, namespaceAliases);
  const scanResult = scanSourceFiles(srcDir, rootDir, cacheFilePath);

  const resolvedUsedKeysAll = new Set<string>();
  const resolvedUsedKeysScoped = new Set<string>();

  for (const usage of scanResult.usages) {
    const resolvedKeys = resolveUsageKey(usage.key, usage.namespaces, catalog.knownNamespaces);
    for (const key of resolvedKeys) {
      if (!key) continue;
      resolvedUsedKeysAll.add(key);
      if (matchesPrefix(key, options.prefix)) {
        resolvedUsedKeysScoped.add(key);
      }
    }
  }

  const leafUsage = analyzeLeafUsage(catalog, resolvedUsedKeysAll, options.prefix);
  const totalLeafCount = leafUsage.length;
  const usedLeafCount = leafUsage.filter((entry) => entry.used).length;
  const unusedLeafCount = totalLeafCount - usedLeafCount;

  const knownScopedKeys = [...catalog.knownKeys].filter((key) => matchesPrefix(key, options.prefix));
  const missingKeys = [...resolvedUsedKeysScoped]
    .filter((key) => !knownKeyOrParentExists(key, knownScopedKeys))
    .sort();

  const unusedKeyList = uniqueStrings(
    leafUsage.filter((entry) => !entry.used).map((entry) => entry.displayKey),
  ).sort();

  const unusedFiles = findUnusedFiles(catalog, leafUsage, scanResult.namespaceRefs, options.prefix);
  const deletableUnusedFiles = unusedFiles.filter((entry) => entry.fullyScoped);
  const undeletableUnusedFiles = unusedFiles.filter((entry) => !entry.fullyScoped);

  const shouldApplyWrites = options.write && !options.dryRun;
  const shouldDeleteFiles = shouldApplyWrites && options.deleteFiles;

  const filesMarkedForDeletion = new Set<string>();
  if (options.deleteFiles) {
    for (const entry of deletableUnusedFiles) {
      filesMarkedForDeletion.add(entry.file.absolutePath);
    }
  }

  const editPlans = buildEditPlans(leafUsage, filesMarkedForDeletion);
  const plannedRemovedKeyCount = editPlans.reduce((sum, plan) => sum + plan.removedLeafPaths.length, 0);
  const appliedRemovedKeyCount = shouldApplyWrites ? plannedRemovedKeyCount : 0;

  if (shouldApplyWrites) {
    for (const plan of editPlans) {
      const nextRaw = `${JSON.stringify(plan.nextJson, null, 2)}\n`;
      fs.writeFileSync(plan.file.absolutePath, nextRaw, "utf8");
    }
  }

  let deletedFileCount = 0;
  if (shouldDeleteFiles) {
    for (const entry of deletableUnusedFiles) {
      if (fs.existsSync(entry.file.absolutePath)) {
        fs.unlinkSync(entry.file.absolutePath);
        deletedFileCount += 1;
      }
    }
  }

  console.log(`Locale: ${options.locale}`);
  console.log(`Prefix: ${options.prefix ?? "(none)"}`);
  console.log(`Mode: ${shouldApplyWrites ? "write" : "dry-run"}`);
  console.log(`Delete files flag: ${options.deleteFiles ? "on" : "off"}`);
  console.log(`Scanned source files: ${scanResult.sourceFileCount} (cached: ${scanResult.cachedFileCount})`);
  console.log(`Dynamic keys ignored: ${scanResult.dynamicIgnored}`);
  console.log("");
  console.log("Summary:");
  console.log(`- total keys: ${totalLeafCount}`);
  console.log(`- used keys: ${usedLeafCount}`);
  console.log(`- unused keys: ${unusedLeafCount}`);
  if (shouldApplyWrites) {
    console.log(`- removed keys: ${appliedRemovedKeyCount}`);
  } else {
    console.log(`- removed keys: 0 (would remove: ${plannedRemovedKeyCount})`);
  }
  console.log(`- missing keys: ${missingKeys.length}`);
  console.log(`- unused files: ${unusedFiles.length}`);
  if (options.deleteFiles) {
    if (shouldDeleteFiles) {
      console.log(`- deleted files: ${deletedFileCount}`);
    } else {
      console.log(`- deleted files: 0 (would delete: ${deletableUnusedFiles.length})`);
    }
  }

  if (editPlans.length > 0) {
    console.log("");
    console.log(shouldApplyWrites ? "Applied key removals:" : "Planned key removals:");
    for (const plan of editPlans) {
      console.log(`- ${plan.file.relativePath}: ${plan.removedLeafPaths.length} key(s)`);
      if (options.verbose) {
        for (const key of plan.removedDisplayKeys) {
          console.log(`  - ${key}`);
        }
      }
    }
  }

  if (unusedFiles.length > 0) {
    console.log("");
    console.log("Unused namespace files:");
    for (const entry of unusedFiles) {
      console.log(`- ${entry.file.relativePath}`);
    }
  }

  if (options.deleteFiles && undeletableUnusedFiles.length > 0) {
    console.log("");
    console.log("Skipped file deletion (outside current prefix scope):");
    for (const entry of undeletableUnusedFiles) {
      console.log(`- ${entry.file.relativePath}`);
    }
  }

  if (missingKeys.length > 0) {
    console.log("");
    console.log("Missing keys:");
    for (const key of missingKeys) {
      console.log(`- ${key}`);
    }
  }

  if (unusedKeyList.length > 0) {
    console.log("");
    console.log("Unused keys:");
    for (const key of unusedKeyList) {
      console.log(`- ${key}`);
    }
  }

  if (options.verbose) {
    console.log("");
    console.log("Namespace references:");
    for (const namespace of [...scanResult.namespaceRefs].sort()) {
      console.log(`- ${namespace}`);
    }
    console.log("");
    console.log("Catalog details:");
    console.log(`- locale files: ${catalog.files.length}`);
    console.log(`- known full keys: ${catalog.knownKeys.size}`);
    console.log(`- known namespaces: ${catalog.knownNamespaces.size}`);
    if (namespaceAliases.size > 0) {
      console.log("- namespace aliases:");
      const aliasEntries = [...namespaceAliases.entries()].sort(([a], [b]) => a.localeCompare(b));
      for (const [jsonPath, aliases] of aliasEntries) {
        if (aliases.size < 2) continue;
        console.log(`  - ${jsonPath}: ${[...aliases].sort().join(", ")}`);
      }
    }
  }

  if (!options.write && options.deleteFiles) {
    console.log("");
    console.log("Note: files are never deleted without --write.");
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`i18n audit failed: ${message}`);
  process.exitCode = 1;
}
