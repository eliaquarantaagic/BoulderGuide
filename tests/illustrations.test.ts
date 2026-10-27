import { describe, expect, it } from 'vitest'
import { getCategory } from '../src/data'
import { illustrations } from '../src/data/illustrations'
import { GROUND_Y, VIEW_BOX, buildSkeleton } from '../src/utils/pose'

const ILLUSTRATED_CATEGORIES = ['sicurezza', 'piedi', 'prese', 'movimento']
const technique = ILLUSTRATED_CATEGORIES.flatMap((id) => getCategory(id)?.moves ?? [])

describe('move illustrations', () => {
  it('covers every technique move and nothing else', () => {
    expect(technique.length).toBe(37)
    expect(Object.keys(illustrations).sort()).toEqual(technique.map((m) => m.id).sort())
  })

  it('has a distinct, non-empty caption per scene', () => {
    const captions = Object.values(illustrations).map((s) => s.caption.trim())
    expect(captions.every((c) => c.length > 10)).toBe(true)
    expect(new Set(captions).size).toBe(captions.length)
  })

  it('keeps every limb within its reach (hands and feet touch their target)', () => {
    const tooFar: string[] = []
    for (const [id, scene] of Object.entries(illustrations)) {
      scene.figures.forEach((figure, i) => {
        const sk = buildSkeleton(figure.pose, scene.view)
        for (const [key, limb] of Object.entries(sk.limbs)) {
          if (limb.slack < -0.5) tooFar.push(`${id}[${i}].${key} short by ${(-limb.slack).toFixed(1)}`)
        }
      })
    }
    expect(tooFar).toEqual([])
  })

  it('keeps bodies inside the picture and above the mat', () => {
    const outside: string[] = []
    for (const [id, scene] of Object.entries(illustrations)) {
      for (const figure of scene.figures) {
        const sk = buildSkeleton(figure.pose, scene.view)
        const points = [sk.head, sk.hip, sk.shoulder, ...Object.values(sk.limbs).flatMap((l) => [l.mid, l.end])]
        for (const [x, y] of points) {
          if (x <= 0 || x >= VIEW_BOX.width || y <= 0 || y > GROUND_Y + 1) outside.push(`${id} (${x.toFixed(0)},${y.toFixed(0)})`)
        }
      }
    }
    expect(outside).toEqual([])
  })
})
