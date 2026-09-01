import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { aliasMap } from '@b-auth/aliases/alias.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@a': path.resolve(dirname, './src/alias/index.ts'),
      '@styles': path.resolve(dirname, './src/styles'),
      '@screens': path.resolve(dirname, './src/screens'),
      ...aliasMap.reduce<Record<string, string>>((accumulator, entry) => {
        accumulator[entry.alias] = path.resolve(dirname, entry.target)
        return accumulator
      }, {}),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
