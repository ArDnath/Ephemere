import { Hono } from 'hono'
import { activateFreePlan } from '@/controllers/planController'
import { authenticateToken } from '@/middleware/authMiddleware'

const router = new Hono()

router.post('/activate-free', authenticateToken, activateFreePlan)

export default router
