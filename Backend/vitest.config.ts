import { defineConfig } from "vitest/config"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  resolve: {
    alias: {
      "@config": fileURLToPath(new URL("./src/config", import.meta.url)),
      "@modules": fileURLToPath(new URL("./src/modules", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      thresholds: { branches: 70, functions: 80, lines: 80 },
    },
  },
})

/**
 * @file        : Backend/vitest.config.ts
 * @description : إعداد Vitest لاختبارات خدمات الـ Backend مع aliases المشروع.
 * @updated     : [
 *   { "date": "27/08/2026", "version": "1.0.0", "by": ["BomBa"], "comment": "إضافة إعداد اختبارات الخدمات" }
 * ]
 */
