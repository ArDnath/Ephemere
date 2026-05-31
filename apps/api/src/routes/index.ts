import { Hono } from 'hono'
import authRoutes from './authRoutes.js'
import roomRoutes from './roomRoutes.js'
import planRoutes from './planRoutes.js'
import userRoutes from './userRoutes.js'
import filesRoutes from './filesRoute.js'

const router = new Hono()

router.route('/auth', authRoutes)
router.route('/user', userRoutes)
router.route('/rooms', roomRoutes)
router.route('/plans', planRoutes)
router.route('/files', filesRoutes)

export default router
