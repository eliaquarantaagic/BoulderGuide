import { describe, expect, it, vi } from 'vitest'
import { analyzeWithAi, buildAiBody, splitDataUrl } from '../src/utils/aiAnalysis'
import { fitSize, nearestColorName } from '../src/utils/colors'
import { colorMatcher, detectHolds, hexToRgb, type Hold, type PixelImage, rgbToHex, rgbToHsv, sampleColor } from '../src/utils/holdDetection'
import { planSequence } from '../src/utils/sequencePlanner'

function makeImage(width: number, height: number, bg = [200, 200, 200]): PixelImage {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) data.set([bg[0], bg[1], bg[2], 255], i * 4)
  return { data, width, height }
}

function paintRect(img: PixelImage, x0: number, y0: number, w: number, h: number, rgb: number[]) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) img.data.set([rgb[0], rgb[1], rgb[2], 255], (y * img.width + x) * 4)
}

const hold = (id: number, x: number, y: number, area = 100): Hold => ({
  id, x, y, area, minX: x - 5, minY: y - 5, maxX: x + 5, maxY: y + 5,
})

describe('colour utils', () => {
  it('converts hex and hsv', () => {
    expect(hexToRgb('#ff8000')).toEqual({ r: 255, g: 128, b: 0 })
    expect(rgbToHex({ r: 255, g: 128, b: 0 })).toBe('#ff8000')
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, v: 1 })
    expect(Math.round(rgbToHsv({ r: 0, g: 0, b: 255 }).h)).toBe(240)
  })

  it('matches hues robustly to lighting but rejects other colours', () => {
    const yellow = colorMatcher({ r: 242, g: 204, b: 12 }, 40)
    expect(yellow({ r: 180, g: 150, b: 20 })).toBe(true) // darker yellow (shadow)
    expect(yellow({ r: 30, g: 90, b: 220 })).toBe(false) // blue
    expect(yellow({ r: 200, g: 200, b: 200 })).toBe(false) // grey wall
  })

  it('matches black holds on brightness', () => {
    const black = colorMatcher({ r: 20, g: 20, b: 20 }, 40)
    expect(black({ r: 35, g: 30, b: 32 })).toBe(true)
    expect(black({ r: 220, g: 220, b: 220 })).toBe(false)
  })

  it('names the nearest colour and fits sizes', () => {
    expect(nearestColorName('#ffd000')).toBe('giallo')
    expect(nearestColorName('nope')).toBe('sconosciuto')
    expect(fitSize(4000, 3000, 600)).toEqual({ width: 600, height: 450 })
    expect(fitSize(300, 200, 600)).toEqual({ width: 300, height: 200 })
  })

  it('samples an averaged colour', () => {
    const img = makeImage(10, 10)
    paintRect(img, 0, 0, 10, 10, [10, 20, 30])
    expect(sampleColor(img, 5, 5)).toEqual({ r: 10, g: 20, b: 30 })
  })
})

describe('detectHolds', () => {
  it('finds separate blobs of the target colour, bottom first, and ignores noise', () => {
    const img = makeImage(100, 100)
    const red = [220, 30, 30]
    paintRect(img, 10, 80, 8, 8, red) // bottom
    paintRect(img, 60, 50, 10, 10, red) // middle
    paintRect(img, 40, 10, 6, 6, red) // top
    paintRect(img, 90, 90, 1, 1, red) // noise
    paintRect(img, 70, 80, 8, 8, [30, 30, 220]) // other colour
    const holds = detectHolds(img, { r: 220, g: 30, b: 30 }, { tolerance: 40 })
    expect(holds).toHaveLength(3)
    expect(holds.map((h) => h.id)).toEqual([1, 2, 3])
    expect(holds[0].y).toBeGreaterThan(holds[1].y)
    expect(holds[1].y).toBeGreaterThan(holds[2].y)
    expect(holds[1].area).toBe(100)
  })

  it('discards blobs that are too large (walls/volumes)', () => {
    const img = makeImage(50, 50)
    paintRect(img, 0, 0, 50, 30, [220, 30, 30])
    expect(detectHolds(img, { r: 220, g: 30, b: 30 }, { tolerance: 40 })).toHaveLength(0)
  })
})

describe('planSequence', () => {
  it('needs at least two holds', () => {
    expect(planSequence([hold(1, 10, 90)], {}, 100).warnings[0]).toMatch(/almeno 2/)
  })

  it('starts on the lowest hold and ends on the highest', () => {
    const holds = [hold(1, 50, 90), hold(2, 40, 60), hold(3, 60, 35), hold(4, 50, 10)]
    const plan = planSequence(holds, {}, 100)
    expect(plan.steps[0].kind).toBe('start')
    expect(plan.steps[0].holdIds).toEqual([1])
    const last = plan.steps[plan.steps.length - 1]
    expect(last.kind).toBe('top')
    expect(last.holdIds).toEqual([4])
    expect(plan.steps.some((s) => s.kind === 'feet')).toBe(true)
  })

  it('uses two start holds when they are side by side', () => {
    const holds = [hold(1, 30, 90), hold(2, 70, 89), hold(3, 50, 40)]
    const plan = planSequence(holds, {}, 200)
    expect(plan.steps[0].holdIds).toEqual([1, 2])
  })

  it('does not crash when two side-by-side holds are the only ones', () => {
    const plan = planSequence([hold(1, 30, 90), hold(2, 70, 89)], {}, 200)
    expect(plan.steps[0].holdIds).toEqual([1])
    expect(plan.steps[plan.steps.length - 1].holdIds).toEqual([2])
  })

  it('warns instead of crashing when every hold is marked as start', () => {
    const plan = planSequence([hold(1, 30, 90), hold(2, 70, 40)], { 1: 'start', 2: 'start' }, 100)
    expect(plan.steps).toEqual([])
    expect(plan.warnings[0]).toMatch(/top/)
  })

  it('lets the lowest hold be marked as top', () => {
    const plan = planSequence([hold(1, 50, 90), hold(2, 50, 50), hold(3, 50, 10)], { 1: 'top' }, 100)
    expect(plan.steps[0].holdIds).toEqual([2])
    expect(plan.steps[plan.steps.length - 1].holdIds).toEqual([1])
  })

  it('respects manual roles and ignored holds', () => {
    const holds = [hold(1, 50, 95), hold(2, 50, 70), hold(3, 30, 40), hold(4, 70, 10)]
    const plan = planSequence(holds, { 2: 'start', 3: 'top', 4: 'ignore' }, 100)
    expect(plan.steps[0].holdIds).toEqual([2])
    expect(plan.steps[plan.steps.length - 1].holdIds).toEqual([3])
    expect(plan.footOnly).toEqual([1])
    expect(plan.steps.flatMap((s) => s.holdIds)).not.toContain(4)
  })

  it('suggests techniques for long and lateral moves', () => {
    const holds = [hold(1, 50, 95), hold(2, 55, 85), hold(3, 60, 75), hold(4, 10, 70), hold(5, 50, 5)]
    const plan = planSequence(holds, {}, 100)
    const moveIds = plan.steps.flatMap((s) => s.tips.flatMap((t) => t.moveIds))
    expect(moveIds).toContain('flag')
    expect(moveIds).toContain('dinamico')
  })
})

describe('AI analysis (Gemini)', () => {
  const req = { apiKey: 'AIza-test', model: 'gemini-3.8-flash', imageDataUrl: 'data:image/jpeg;base64,AAA', holdColor: 'giallo' }
  const ok = (body: unknown) => vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body })
  const fail = (status: number, body: unknown = {}) => vi.fn().mockResolvedValue({ ok: false, status, json: async () => body })

  it('builds an Interactions request with inline image and no server-side storage', () => {
    const body = buildAiBody(req)
    expect(body.model).toBe('gemini-3.8-flash')
    expect(body.system_instruction).toMatch(/bouldering/)
    expect(body.input[0]).toEqual({ type: 'text', text: 'Colore delle prese del blocco: giallo.' })
    expect(body.input[1]).toEqual({ type: 'image', data: 'AAA', mime_type: 'image/jpeg' })
    expect(body.store).toBe(false)
  })

  it('falls back to the default model when empty', () => {
    expect(buildAiBody({ ...req, model: '  ' }).model).toBe('gemini-3.8-flash')
  })

  it('rejects non data-URL images', () => {
    expect(() => splitDataUrl('https://example.com/a.jpg')).toThrow()
  })

  it('requires an API key', async () => {
    await expect(analyzeWithAi({ ...req, apiKey: ' ' })).rejects.toThrow(/API key/)
  })

  it('joins model output text and sends the key only in the header', async () => {
    const fetchFn = ok({
      steps: [
        { type: 'thought', content: [{ type: 'text', text: 'ragiono' }] },
        { type: 'model_output', content: [{ type: 'text', text: 'Parti con' }, { type: 'text', text: 'le mani su 1.' }] },
      ],
    })
    await expect(analyzeWithAi(req, fetchFn)).resolves.toBe('Parti con\nle mani su 1.')
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/interactions')
    expect(init.headers['x-goog-api-key']).toBe('AIza-test')
    expect(init.body).not.toContain('AIza-test')
  })

  it('reports an empty answer', async () => {
    await expect(analyzeWithAi(req, ok({ steps: [] }))).rejects.toThrow('Risposta vuota')
  })

  it('maps HTTP errors to readable messages', async () => {
    await expect(analyzeWithAi(req, fail(400, { error: { message: 'API key not valid. Please pass a valid API key.' } }))).rejects.toThrow('API key non valida')
    // Real Gemini error payload shape (array-wrapped).
    await expect(
      analyzeWithAi(req, fail(400, [{ error: { code: 400, message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT' } }])),
    ).rejects.toThrow('API key non valida')
    await expect(analyzeWithAi(req, fail(400, [{ error: { message: 'Invalid input' } }]))).rejects.toThrow('Invalid input')
    await expect(analyzeWithAi(req, fail(403))).rejects.toThrow('API key non valida')
    await expect(analyzeWithAi(req, fail(429))).rejects.toThrow('Limite di richieste')
    await expect(analyzeWithAi(req, fail(404))).rejects.toThrow('Modello non trovato')
    const broken = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('x') } })
    await expect(analyzeWithAi(req, broken)).rejects.toThrow('Errore HTTP 500')
  })
})