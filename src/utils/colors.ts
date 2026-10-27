export const holdColors = [
  { name: 'giallo', hex: '#f2cc0c' },
  { name: 'arancione', hex: '#f97316' },
  { name: 'rosso', hex: '#dc2626' },
  { name: 'rosa', hex: '#ec4899' },
  { name: 'viola', hex: '#7c3aed' },
  { name: 'blu', hex: '#2563eb' },
  { name: 'azzurro', hex: '#06b6d4' },
  { name: 'verde', hex: '#16a34a' },
  { name: 'nero', hex: '#171717' },
  { name: 'bianco', hex: '#f5f5f5' },
] as const

const toRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Nearest named colour, used to describe a sampled colour to the AI and the user. */
export function nearestColorName(hex: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return 'sconosciuto'
  const [r, g, b] = toRgb(hex)
  let best: string = holdColors[0].name
  let bestD = Infinity
  for (const c of holdColors) {
    const [cr, cg, cb] = toRgb(c.hex)
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
    if (d < bestD) {
      bestD = d
      best = c.name
    }
  }
  return best
}

/** Scales an image so its longest side is at most maxSide pixels. */
export function fitSize(width: number, height: number, maxSide: number) {
  const ratio = Math.min(1, maxSide / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) }
}
