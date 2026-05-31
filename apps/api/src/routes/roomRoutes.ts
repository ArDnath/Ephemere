import { Hono } from 'hono'
import {
  getUserRooms,
  createRoom,
  getRoomsHistory,
  getRoomHistory,
  removeRoom,
} from '@/controllers/roomController'
import { authenticateToken } from '@/middleware/authMiddleware'

const router = new Hono()

router.use('*', authenticateToken)

router.post('/create', createRoom)
router.get('/getRooms', getUserRooms)
router.get('/history', getRoomsHistory)
router.get('/history/:roomId', getRoomHistory)
router.delete('/remove/:roomId', removeRoom)

export default router
