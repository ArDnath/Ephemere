import { Hono } from 'hono'
import { getStats, updateProfile, deleteAccount } from '@/controllers/userController'
import { authenticateToken } from '@/middleware/authMiddleware'
import { rateLimiter } from '@/middleware/rateLimiter'

const router = new Hono()

const profileUploadLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Profile image upload limit reached, please try again in 1 hour.',
})

router.use('*', authenticateToken)

router.get('/stats', getStats)
router.patch('/profile', profileUploadLimiter, updateProfile)
router.delete('/account', deleteAccount)

export default router
