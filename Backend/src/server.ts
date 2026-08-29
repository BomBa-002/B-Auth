import { createApp } from "./app.js"
import { env } from "@config/env.js"
import { seedIfEmpty } from "./seed.js"

async function main() {
  await seedIfEmpty()

  const app = createApp()
  app.listen(env.PORT, () => {
    console.log(`[b-auth-backend] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`)
  })
}

main().catch((error) => {
  console.error("[b-auth-backend] fatal startup error:", error)
  process.exit(1)
})
