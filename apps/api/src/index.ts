import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { rateLimiter } from '@/middleware/rateLimiter'
import routes from '@/routes/index'
import { createDb } from '@ephemere/db'
import { plans } from '@ephemere/db/schema'
import { eq } from 'drizzle-orm'
import { installRuntimeEnv, type ApiBindings } from './env.js'

const app = new Hono<{ Bindings: ApiBindings }>()

// Middleware
app.use('*', async (c, next) => {
  installRuntimeEnv(c.env)
  await next()
})
app.use('*', cors())
app.use('*', logger())
app.use('*', rateLimiter({ windowMs: 10 * 60 * 1000, max: 500 }))

// Health check
app.get('/', (c) => c.json({ status: 'ok', environment: 'cloudflare-workers' }))

// Routes
app.route('/api/v1', routes)

// Seed plans on startup (runs once per deployment)
const seedPlans = async (databaseUrl: string) => {
  try {
    const db = createDb(databaseUrl)
    const defaultPlans = [
      {
        id: 'free282003',
        name: 'Free',
        maxUsers: 100,
        maxTimeLimit: 60,
        maxRooms: 30,
        maxSavedRooms: 10,
        price: 0,
      },
      {
        id: 'pro282003',
        name: 'Pro',
        maxUsers: 200,
        maxTimeLimit: 200,
        maxRooms: 100,
        maxSavedRooms: 50,
        price: 10,
      },
    ]

    for (const plan of defaultPlans) {
      const [existing] = await db.select().from(plans).where(eq(plans.id, plan.id)).limit(1)
      if (!existing) {
        await db.insert(plans).values(plan)
        console.log(`🌱 Seeded plan: ${plan.name}`)
      }
    }
  } catch (error) {
    console.error('Failed to seed plans:', error)
  }
}

// Initialize on first request
let initialized = false
app.use('*', async (c, next) => {
  if (!initialized) {
    await seedPlans(c.env.DATABASE_URL)
    initialized = true
  }
  await next()
})

// Export for Cloudflare Workers
export default app
