'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { ReadyState } from 'react-use-websocket'

type Node3D = {
  id: string
  label: string
  x: number
  y: number
  z: number
}

type Connection = {
  from: string
  to: string
  strength: number
}

const nodes: Node3D[] = [
  { id: 'north', label: 'North Relay', x: -110, y: 78, z: -120 },
  { id: 'core', label: 'Core Socket', x: 0, y: -8, z: 72 },
  { id: 'edge', label: 'Edge Cache', x: 142, y: 62, z: -48 },
  { id: 'south', label: 'South Node', x: -68, y: -98, z: -26 },
  { id: 'west', label: 'West Gateway', x: -164, y: -38, z: 16 },
]

const connections: Connection[] = [
  { from: 'core', to: 'north', strength: 0.88 },
  { from: 'core', to: 'edge', strength: 0.94 },
  { from: 'core', to: 'south', strength: 0.74 },
  { from: 'core', to: 'west', strength: 0.66 },
  { from: 'north', to: 'edge', strength: 0.48 },
  { from: 'edge', to: 'south', strength: 0.42 },
  { from: 'west', to: 'south', strength: 0.3 },
]

type NetworkVisualization3DProps = {
  readyState: ReadyState
  activeCluster: string
  onClusterSelect: (clusterId: string) => void
  participants: number
}

const project = (x: number, y: number, z: number, fov = 480) => {
  const scale = fov / (fov + z)
  return { x: x * scale, y: y * scale, z, scale }
}

const rotatePoint = (
  x: number,
  y: number,
  z: number,
  angleX: number,
  angleY: number
): [number, number, number] => {
  const y1 = y * Math.cos(angleX) - z * Math.sin(angleX)
  const z1 = y * Math.sin(angleX) + z * Math.cos(angleX)
  const x2 = x * Math.cos(angleY) + z1 * Math.sin(angleY)
  const z2 = -x * Math.sin(angleY) + z1 * Math.cos(angleY)
  return [x2, y1, z2]
}

const distanceToSegment = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
) => {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const abLengthSquared = abx * abx + aby * aby
  const t = abLengthSquared === 0 ? 0 : Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLengthSquared))
  const cx = ax + abx * t
  const cy = ay + aby * t
  return Math.hypot(px - cx, py - cy)
}

export const NetworkVisualization3D = ({
  readyState,
  activeCluster,
  onClusterSelect,
  participants,
}: NetworkVisualization3DProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const rotationRef = useRef({ x: 0.42, y: 0.58 })
  const pointerRef = useRef<{ x: number; y: number; hoverId: string | null }>({
    x: 0,
    y: 0,
    hoverId: null,
  })
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 })

  const unstable = readyState !== ReadyState.OPEN

  const metrics = useMemo(
    () => ({
      connected: readyState === ReadyState.OPEN,
      latency: readyState === ReadyState.OPEN ? 22 + participants * 3 : 0,
    }),
    [participants, readyState]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(240, Math.floor(rect.width))
      const height = Math.max(260, Math.floor(rect.height))
      setCanvasSize({ width, height })
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(22, 14, 8, 0.92)'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = 'rgba(255, 194, 71, 0.04)'
      for (let i = 0; i < 260; i += 1) {
        const x = (i * 37) % width
        const y = (i * 61) % height
        ctx.fillRect(x, y, 1, 1)
      }

      rotationRef.current.x += unstable ? 0.0015 : 0.0007
      rotationRef.current.y += unstable ? 0.0019 : 0.0011

      const projected = nodes
        .map((node, index) => {
          const wobble = unstable ? Math.sin(performance.now() / 300 + index) * 4 : 0
          const [rx, ry, rz] = rotatePoint(
            node.x,
            node.y + wobble,
            node.z,
            rotationRef.current.x,
            rotationRef.current.y
          )
          const proj = project(rx, ry, rz)
          return {
            ...node,
            screenX: centerX + proj.x,
            screenY: centerY + proj.y,
            scale: proj.scale,
            radius: 10 * proj.scale + (node.id === activeCluster ? 7 : 0),
          }
        })
        .sort((a, b) => a.screenY - b.screenY)

      const lineColor = metrics.connected ? [142, 68, 58] : [12, 70, 45]
      connections.forEach((connection) => {
        const from = projected.find((node) => node.id === connection.from)
        const to = projected.find((node) => node.id === connection.to)
        if (!from || !to) return

        const highlight =
          pointerRef.current.hoverId === `${connection.from}:${connection.to}` ||
          pointerRef.current.hoverId === `${connection.to}:${connection.from}` ||
          activeCluster === connection.from ||
          activeCluster === connection.to

        ctx.beginPath()
        ctx.moveTo(from.screenX, from.screenY)
        ctx.lineTo(to.screenX, to.screenY)
        ctx.strokeStyle = `hsla(${lineColor[0]}, ${lineColor[1]}%, ${lineColor[2]}%, ${
          highlight ? 0.68 * connection.strength : 0.24 * connection.strength
        })`
        ctx.lineWidth = highlight ? 2.2 : 1.2
        ctx.setLineDash([6, 8])
        ctx.stroke()
        ctx.setLineDash([])

        if (highlight) {
          ctx.beginPath()
          ctx.moveTo(from.screenX, from.screenY)
          ctx.lineTo(to.screenX, to.screenY)
          ctx.strokeStyle = `hsla(${lineColor[0]}, ${lineColor[1]}%, ${lineColor[2]}%, 0.18)`
          ctx.lineWidth = 5
          ctx.stroke()
        }
      })

      projected.forEach((node) => {
        const isActive = node.id === activeCluster
        const isHover = pointerRef.current.hoverId === node.id
        const hue = metrics.connected ? 142 : 12

        ctx.save()
        ctx.shadowColor = `hsla(${hue}, 68%, 58%, ${isActive ? 0.6 : 0.28})`
        ctx.shadowBlur = isActive ? 22 : 10
        ctx.fillStyle = isActive ? `hsla(${hue}, 82%, 58%, 0.96)` : `hsla(${hue}, 60%, 46%, 0.84)`
        ctx.beginPath()
        ctx.arc(node.screenX, node.screenY, node.radius + (isHover ? 4 : 0), 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.strokeStyle = isActive
          ? 'rgba(255, 208, 117, 0.9)'
          : 'rgba(255, 208, 117, 0.35)'
        ctx.lineWidth = isHover ? 2.4 : 1.6
        ctx.stroke()

        const dotRadius = node.radius * 0.52
        for (let i = 0; i < 10; i += 1) {
          const angle = (i / 10) * Math.PI * 2
          const dist = dotRadius * (i / 10)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
          ctx.beginPath()
          ctx.arc(
            node.screenX + Math.cos(angle) * dist,
            node.screenY + Math.sin(angle) * dist,
            1.4,
            0,
            Math.PI * 2
          )
          ctx.fill()
        }

        ctx.fillStyle = 'rgba(247, 236, 210, 0.82)'
        ctx.font = '11px var(--font-mono), monospace'
        ctx.textAlign = 'center'
        ctx.fillText(node.label, node.screenX, node.screenY + node.radius + 18)
        ctx.restore()
      })
    }

    const loop = () => {
      render()
      frameRef.current = window.requestAnimationFrame(loop)
    }

    frameRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
    }
  }, [activeCluster, metrics.connected, unstable, canvasSize.height, canvasSize.width, participants])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = Math.floor(canvasSize.width)
    canvas.height = Math.floor(canvasSize.height)
    canvas.style.width = `${canvasSize.width}px`
    canvas.style.height = `${canvasSize.height}px`
  }, [canvasSize])

  const handlePointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const projected = nodes.map((node, index) => {
      const wobble = unstable ? Math.sin(performance.now() / 300 + index) * 4 : 0
      const [rx, ry, rz] = rotatePoint(
        node.x,
        node.y + wobble,
        node.z,
        rotationRef.current.x,
        rotationRef.current.y
      )
      const proj = project(rx, ry, rz)
      return {
        ...node,
        screenX: centerX + proj.x,
        screenY: centerY + proj.y,
        radius: 10 * proj.scale + (node.id === activeCluster ? 7 : 0),
      }
    })

    let hoverId: string | null = null

    for (const node of projected) {
      if (Math.hypot(x - node.screenX, y - node.screenY) <= node.radius + 5) {
        hoverId = node.id
        break
      }
    }

    if (!hoverId) {
      for (const connection of connections) {
        const from = projected.find((node) => node.id === connection.from)
        const to = projected.find((node) => node.id === connection.to)
        if (!from || !to) continue
        const distance = distanceToSegment(x, y, from.screenX, from.screenY, to.screenX, to.screenY)
        if (distance <= 8) {
          hoverId = `${connection.from}:${connection.to}`
          break
        }
      }
    }

    pointerRef.current = { x, y, hoverId }
    canvas.style.cursor = hoverId ? 'pointer' : 'default'
  }

  const handleClick = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const projected = nodes.map((node, index) => {
      const wobble = unstable ? Math.sin(performance.now() / 300 + index) * 4 : 0
      const [rx, ry, rz] = rotatePoint(
        node.x,
        node.y + wobble,
        node.z,
        rotationRef.current.x,
        rotationRef.current.y
      )
      const proj = project(rx, ry, rz)
      return {
        ...node,
        screenX: centerX + proj.x,
        screenY: centerY + proj.y,
        radius: 10 * proj.scale + (node.id === activeCluster ? 7 : 0),
      }
    })

    const clickedNode = projected.find(
      (node) => Math.hypot(x - node.screenX, y - node.screenY) <= node.radius + 5
    )
    if (clickedNode) {
      onClusterSelect(clickedNode.id)
      return
    }

    const hitConnection = connections.find((connection) => {
      const from = projected.find((node) => node.id === connection.from)
      const to = projected.find((node) => node.id === connection.to)
      if (!from || !to) return false
      return distanceToSegment(x, y, from.screenX, from.screenY, to.screenX, to.screenY) <= 8
    })

    if (hitConnection) {
      const nextCluster =
        activeCluster === hitConnection.from ? hitConnection.to : hitConnection.from
      onClusterSelect(nextCluster)
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        ref={containerRef}
        className={`irregular-sheet paper-shell noise-overlay relative min-h-[18rem] flex-1 overflow-hidden border border-amber-900/25 ${
          unstable ? 'socket-warp' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointer}
          onPointerDown={handleClick}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px] text-amber-100/70">
        <div className="rounded-[14px_12px_14px_12px] border border-amber-900/20 bg-black/20 px-3 py-2">
          <p className="text-amber-200/45">state</p>
          <p className="mt-1 text-amber-50">
            {readyState === ReadyState.OPEN ? 'connected' : 'degraded'}
          </p>
        </div>
        <div className="rounded-[14px_12px_14px_12px] border border-amber-900/20 bg-black/20 px-3 py-2">
          <p className="text-amber-200/45">latency</p>
          <p className="mt-1 text-amber-50">
            {metrics.connected ? `${metrics.latency}ms` : '---'}
          </p>
        </div>
      </div>

      <p className="mt-3 font-script text-2xl leading-none text-amber-300/90">
        {unstable ? 'signal bending' : 'handshake warm'}
      </p>
    </div>
  )
}
