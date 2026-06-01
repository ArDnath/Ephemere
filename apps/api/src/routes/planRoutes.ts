import { Hono } from 'hono'
import { activateFreePlan, activateProPlan } from '@/controllers/planController'
import { authenticateToken } from '@/middleware/authMiddleware'

const router = new Hono()

router.post('/activate-free', authenticateToken, activateFreePlan)
router.post('/activate-pro', authenticateToken, activateProPlan)

export default router
