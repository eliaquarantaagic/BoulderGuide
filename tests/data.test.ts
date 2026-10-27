import { describe, expect, it } from 'vitest'
import { allMoves, categories, getCategory, getMove } from '../src/data'

describe('guide content', () => {
  it('has unique move ids across all categories', () => {
    const ids = categories.flatMap((c) => c.moves.map((m) => m.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(allMoves.length).toBe(ids.length)
  })

  it('has unique category ids', () => {
    const ids = categories.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every move explains why, when and why it matters', () => {
    for (const { move } of allMoves) {
      expect(move.summary.trim(), move.id).not.toBe('')
      expect(move.why.trim(), move.id).not.toBe('')
      expect(move.when.trim(), move.id).not.toBe('')
      expect(move.importance.trim(), move.id).not.toBe('')
      expect(move.how.length, move.id).toBeGreaterThan(0)
      expect(move.mistakes.length, move.id).toBeGreaterThan(0)
    }
  })

  it('only references existing related moves', () => {
    for (const { move } of allMoves) {
      for (const rel of move.related ?? []) {
        expect(getMove(rel), `${move.id} -> ${rel}`).toBeDefined()
        expect(rel).not.toBe(move.id)
      }
    }
  })

  it('covers the key bouldering topics', () => {
    for (const id of ['sicurezza', 'attrezzatura', 'piedi', 'prese', 'movimento', 'riposo', 'lettura', 'prevenzione', 'mente', 'regole']) {
      expect(getCategory(id), id).toBeDefined()
    }
  })
})
