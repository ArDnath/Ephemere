import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { rateLimiter } from '@/middleware/rateLimiter'
import routes from '@/routes/index'

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

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`🔥 Hono API running on http://localhost:${PORT}`)
})

export default app
