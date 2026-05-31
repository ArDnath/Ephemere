import 'dotenv/config'
import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import { User } from './models/User.js'

const PORT = Number(process.env.PORT) ?? 8080

const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' })

console.log(`🔌 WebSocket server running on ws://0.0.0.0:${PORT}`)

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const ip = req.socket.remoteAddress ?? 'unknown'
  console.log(`[WSS] New connection from ${ip}  (total: ${wss.clients.size})`)

  new User(ws)
})

wss.on('error', (err: Error) => {
  console.error('[WSS] Server error:', err)
})

// Graceful shutdown
const shutdown = () => {
  console.log('\n[WSS] Shutting down…')
  wss.close(() => {
    console.log('[WSS] All connections closed.')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
