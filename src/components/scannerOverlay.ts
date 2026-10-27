import type { Hold } from '../utils/holdDetection'
import type { HoldRole } from '../utils/sequencePlanner'

export interface OverlayOptions {
  holds: Hold[]
  roles: Record<number, HoldRole>
  footOnly: number[]
  highlight: number[]
  order: number[]
}

const roleColor: Record<HoldRole | 'hand' | 'foot', string> = {
  start: '#22c55e',
  top: '#ef4444',
  ignore: 'rgba(120,120,120,0.8)',
  hand: '#3b82f6',
  foot: '#f59e0b',
}

/** Draws the analysed image and the detected holds with their role colours. */
export function drawOverlay(ctx: CanvasRenderingContext2D, image: ImageData, opts: OverlayOptions) {
  ctx.putImageData(image, 0, 0)
  const scale = Math.max(image.width, image.height) / 600
  ctx.lineWidth = Math.max(2, 2.5 * scale)
  ctx.font = `bold ${Math.round(13 * scale)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (opts.order.length > 1) {
    const byId = new Map(opts.holds.map((h) => [h.id, h]))
    ctx.save()
    ctx.setLineDash([6 * scale, 6 * scale])
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.beginPath()
    opts.order.forEach((id, i) => {
      const h = byId.get(id)
      if (!h) return
      if (i === 0) ctx.moveTo(h.x, h.y)
      else ctx.lineTo(h.x, h.y)
    })
    ctx.stroke()
    ctx.restore()
  }

  for (const h of opts.holds) {
    const role = opts.roles[h.id]
    const color = role ? roleColor[role] : opts.footOnly.includes(h.id) ? roleColor.foot : roleColor.hand
    const r = Math.max(10 * scale, Math.max(h.maxX - h.minX, h.maxY - h.minY) / 2 + 4)
    const hi = opts.highlight.includes(h.id)
    ctx.strokeStyle = hi ? '#ffffff' : color
    ctx.lineWidth = hi ? 5 * scale : Math.max(2, 2.5 * scale)
    ctx.beginPath()
    ctx.arc(h.x, h.y, r, 0, Math.PI * 2)
    ctx.stroke()
    const lx = h.x + r * 0.75
    const ly = h.y - r * 0.75
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(lx, ly, 10 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.fillText(String(h.id), lx, ly + 0.5)
  }
}

export function hitTest(holds: Hold[], x: number, y: number, tolerance: number): Hold | undefined {
  let best: Hold | undefined
  let bestD = Infinity
  for (const h of holds) {
    const inside = x >= h.minX - tolerance && x <= h.maxX + tolerance && y >= h.minY - tolerance && y <= h.maxY + tolerance
    const d = Math.hypot(h.x - x, h.y - y)
    if (inside && d < bestD) {
      best = h
      bestD = d
    }
  }
  return best
}
