#!/usr/bin/env node
/**
 * Generates `Frontend/tsconfig.paths.json` from the single source-of-truth
 * alias map in `packages/aliases/alias.config.ts`.
 *
 * TypeScript's `compilerOptions.paths` needs a glob-suffixed shape:
 *   { "@app/*": ["./src/app/*"] }
 * while Vite's `resolve.alias` wants exact-prefix entries. Both are derived
 * from the same `aliasMap` — this script produces the TS side; `Frontend/vite.config.ts`
 * derives the Vite side at build/dev time by importing `alias.config.ts` directly
 * (Vite's config loader supports TS deps via esbuild transpilation).
 *
 * This script itself parses `alias.config.ts` with a lightweight regex instead of
 * importing it, so it runs under plain Node with zero extra loader setup during
 * `npm install` (see docs/alias-system.md for the representation-gap rationale).
 *
 * Run via the root `postinstall` hook or manually:
 *   node packages/aliases/scripts/generate-ts-paths.mjs
 */

import { writeFileSync, mkdirSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "..", "..", "..")

function parseAliasMap(source) {
  const entries = []
  const entryRegex = /alias:\s*["']([^"']+)["']\s*,\s*target:\s*["']([^"']+)["']/g
  let match
  while ((match = entryRegex.exec(source)) !== null) {
    entries.push({ alias: match[1], target: match[2] })
  }
  return entries
}

function main() {
  const configPath = resolve(__dirname, "..", "alias.config.ts")
  const source = readFileSync(configPath, "utf-8")
  const aliasMap = parseAliasMap(source)

  if (aliasMap.length === 0) {
    console.warn("[aliases] no entries parsed from alias.config.ts — skipping generation.")
    return
  }

  const paths = {}
  for (const { alias, target } of aliasMap) {
    const normalizedTarget = target.startsWith("./") ? target : `./${target}`
    paths[`${alias}/*`] = [`${normalizedTarget}/*`]
  }

  const output = {
    compilerOptions: {
      baseUrl: ".",
      paths,
    },
  }

  const outPath = resolve(repoRoot, "Frontend", "tsconfig.paths.json")
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf-8")
  console.log(`[aliases] wrote ${outPath} (${aliasMap.length} aliases)`)
}

try {
  main()
} catch (err) {
  console.error("[aliases] generation failed:", err.message)
  // Non-fatal — Frontend ships a committed tsconfig.paths.json fallback.
  process.exit(0)
}
