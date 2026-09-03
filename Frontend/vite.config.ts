import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { aliasMap } from "@b-auth/aliases/alias.config"

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@a": path.resolve(dirname, "./src/alias/index.ts"),
      "@styles": path.resolve(dirname, "./src/styles"),
      "@screens": path.resolve(dirname, "./src/screens"),
      ...aliasMap.reduce<Record<string, string>>((acc, entry) => {
        acc[entry.alias] = path.resolve(dirname, entry.target)
        return acc
      }, {}),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": {
        // محلياً بيوصل على 4000 مباشرة، وجوه Docker بيتحدد من docker-compose.dev.yml
        target: process.env.VITE_API_PROXY_TARGET ?? "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["@tanstack/react-router"],
          "vendor-ui": ["lucide-react", "framer-motion"],
        },
      },
    },
  },
})
