import { Hono } from 'hono'
import { uploadFile, deleteFile } from '@/controllers/FileUpload'
import { authenticateToken } from '@/middleware/authMiddleware'
import { rateLimiter } from '@/middleware/rateLimiter'

const router = new Hono()

const fileUploadLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'File upload limit reached, please try again after 1 minute.',
})

router.use('*', authenticateToken)

router.post('/getUploadUrl', fileUploadLimiter, uploadFile)
router.delete('/deleteFile', deleteFile)

export default router
