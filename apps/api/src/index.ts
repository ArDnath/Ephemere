import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { rateLimiter } from '@/middleware/rateLimiter'
import routes from '@/routes/index'
import { db } from '@ephemere/db'
import { plans } from '@ephemere/db/schema'
import { eq } from 'drizzle-orm'

const app = new Hono()

const PORT = Number(process.env.PORT) || 4001

// Middleware
app.use('*', cors())
app.use('*', logger())
app.use('*', rateLimiter({ windowMs: 10 * 60 * 1000, max: 500 }))

// Health check
app.get('/', (c) => c.json({ status: 'ok' }))

// Routes
app.route('/api/v1', routes)

const seedPlans = async () => {
  try {
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

serve({ fetch: app.fetch, port: PORT }, async () => {
  console.log(`🔥 Hono API running on http://localhost:${PORT}`)
  await seedPlans()
})

export default app
