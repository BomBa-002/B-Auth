/**
 * @b-auth/aliases — single source of truth for Frontend path aliases.
 *
 * This map is consumed in two different representations because TypeScript's
 * `paths` and Vite's `resolve.alias` expect different shapes:
 *  - `Frontend/tsconfig.paths.json` is generated from this map by
 *    `scripts/generate-ts-paths.mjs` (glob-suffixed `"@app/*": ["./src/app/*"]`).
 *  - `Frontend/vite.config.ts` imports this file directly (Vite/esbuild can
 *    load a `.ts` config dependency at config-eval time) and turns each entry
 *    into an exact-prefix `resolve.alias` entry.
 *
 * See docs/alias-system.md for the full rationale and the representation gap
 * this dual-consumption creates.
 */

export const aliasMap = [
  { alias: "@app", target: "./src/app" },
  { alias: "@components", target: "./src/components" },
  { alias: "@screens", target: "./src/screens" },
  { alias: "@features", target: "./src/features" },
  { alias: "@services", target: "./src/services" },
  { alias: "@hooks", target: "./src/hooks" },
  { alias: "@lib", target: "./src/lib" },
  { alias: "@types", target: "./src/types" },
  { alias: "@shared", target: "./src/shared" },
  { alias: "@i18n", target: "./src/i18n" },
  { alias: "@assets", target: "./src/assets" },
]

export default aliasMap
