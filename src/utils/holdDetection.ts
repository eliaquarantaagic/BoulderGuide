export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSV {
  h: number
  s: number
  v: number
}

export interface PixelImage {
  data: Uint8ClampedArray
  width: number
  height: number
}

export interface Hold {
  id: number
  x: number
  y: number
  area: number
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : d / max, v: max }
}

export function hexToRgb(hex: string): RGB {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return { r: 0, g: 0, b: 0 }
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
}

const hueDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/**
 * Returns a predicate that tells whether a pixel belongs to the target hold colour.
 * tolerance: 0..100. Chromatic colours are matched mainly on hue (robust to gym lighting);
 * greys/black/white are matched on brightness.
 */
export function colorMatcher(target: RGB, tolerance: number): (p: RGB) => boolean {
  const t = rgbToHsv(target)
  const tol = Math.min(Math.max(tolerance, 0), 100) / 100
  const chromatic = t.s >= 0.25 && t.v >= 0.2
  if (chromatic) {
    const maxHue = 8 + tol * 40
    const minS = Math.max(0.15, t.s - 0.3 - tol * 0.3)
    const minV = Math.max(0.12, t.v - 0.35 - tol * 0.3)
    return (p) => {
      const c = rgbToHsv(p)
      return c.s >= minS && c.v >= minV && hueDistance(c.h, t.h) <= maxHue
    }
  }
  const maxDv = 0.08 + tol * 0.3
  const maxS = 0.2 + tol * 0.2
  return (p) => {
    const c = rgbToHsv(p)
    return c.s <= maxS && Math.abs(c.v - t.v) <= maxDv
  }
}

export function sampleColor(img: PixelImage, x: number, y: number, radius = 2): RGB {
  let r = 0
  let g = 0
  let b = 0
  let n = 0
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const px = Math.round(x) + dx
      const py = Math.round(y) + dy
      if (px < 0 || py < 0 || px >= img.width || py >= img.height) continue
      const i = (py * img.width + px) * 4
      r += img.data[i]
      g += img.data[i + 1]
      b += img.data[i + 2]
      n++
    }
  }
  return n === 0 ? { r: 0, g: 0, b: 0 } : { r: r / n, g: g / n, b: b / n }
}

export interface DetectOptions {
  tolerance: number
  /** Blobs smaller than this fraction of the image are noise. */
  minAreaRatio?: number
  /** Blobs larger than this fraction are probably walls/volumes, not holds. */
  maxAreaRatio?: number
}

/** Finds connected regions of the target colour (4-connectivity flood fill). */
export function detectHolds(img: PixelImage, target: RGB, opts: DetectOptions): Hold[] {
  const { width, height, data } = img
  const total = width * height
  const matches = colorMatcher(target, opts.tolerance)
  const mask = new Uint8Array(total)
  for (let i = 0; i < total; i++) {
    const o = i * 4
    if (data[o + 3] > 0 && matches({ r: data[o], g: data[o + 1], b: data[o + 2] })) mask[i] = 1
  }

  const minArea = Math.max(4, Math.round(total * (opts.minAreaRatio ?? 0.0006)))
  const maxArea = Math.round(total * (opts.maxAreaRatio ?? 0.15))
  const holds: Hold[] = []
  const stack = new Int32Array(total)

  for (let start = 0; start < total; start++) {
    if (mask[start] !== 1) continue
    let top = 0
    stack[top++] = start
    mask[start] = 2
    let area = 0
    let sx = 0
    let sy = 0
    let minX = width
    let minY = height
    let maxX = 0
    let maxY = 0
    while (top > 0) {
      const idx = stack[--top]
      const x = idx % width
      const y = (idx - x) / width
      area++
      sx += x
      sy += y
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      if (x > 0 && mask[idx - 1] === 1) { mask[idx - 1] = 2; stack[top++] = idx - 1 }
      if (x < width - 1 && mask[idx + 1] === 1) { mask[idx + 1] = 2; stack[top++] = idx + 1 }
      if (y > 0 && mask[idx - width] === 1) { mask[idx - width] = 2; stack[top++] = idx - width }
      if (y < height - 1 && mask[idx + width] === 1) { mask[idx + width] = 2; stack[top++] = idx + width }
    }
    if (area >= minArea && area <= maxArea) {
      holds.push({ id: 0, x: sx / area, y: sy / area, area, minX, minY, maxX, maxY })
    }
  }

  return holds
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .map((h, i) => ({ ...h, id: i + 1 }))
}
