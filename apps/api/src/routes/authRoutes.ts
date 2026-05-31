import { Hono } from 'hono'
import {
  login,
  callback,
  logout,
  createAccount,
  sendVerificationOtp,
  getSession,
  forgotPassword,
  resetPassword,
} from '@/controllers/authController'
import { googleAuth } from '@/controllers/googleAuthController'
import { githubAuth } from '@/controllers/githubAuthController'
import { authenticateToken } from '@/middleware/authMiddleware'
import { rateLimiter } from '@/middleware/rateLimiter'

const router = new Hono()

const passwordResetLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts, please try again after 10 minutes.',
})

router.post('/login', login)
router.get('/callback', callback)
router.post('/logout', authenticateToken, logout)
router.post('/signup', createAccount)
router.post('/verify-email', sendVerificationOtp)
router.get('/me', authenticateToken, getSession)
router.post('/google', googleAuth)
router.post('/github', githubAuth)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', passwordResetLimiter, resetPassword)

export default router
