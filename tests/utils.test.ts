import { describe, expect, it } from 'vitest'
import { allMoves } from '../src/data'
import { parseHash, href } from '../src/hooks/useHashRoute'
import { formatSeconds } from '../src/utils/format'
import { moveOfTheDay, normalize, searchMoves } from '../src/utils/search'
import { defaultData, exportData, loadData, parseAppData, saveData, STORAGE_KEY, toggleId } from '../src/utils/storage'

describe('search', () => {
  it('ignores accents and case', () => {
    expect(normalize('Perché ÀNCHE')).toBe('perche anche')
  })

  it('finds moves by name and alias', () => {
    expect(searchMoves(allMoves, 'heel hook').map((m) => m.move.id)).toContain('tallonaggio')
    expect(searchMoves(allMoves, 'TALLONAGGIO').map((m) => m.move.id)).toContain('tallonaggio')
  })

  it('returns nothing for empty queries', () => {
    expect(searchMoves(allMoves, '   ')).toEqual([])
  })

  it('move of the day is stable within a day', () => {
    const a = moveOfTheDay([1, 2, 3, 4, 5], new Date(2026, 9, 27, 8))
    const b = moveOfTheDay([1, 2, 3, 4, 5], new Date(2026, 9, 27, 22))
    expect(a).toBe(b)
    expect(moveOfTheDay([], new Date())).toBeUndefined()
  })
})

describe('storage', () => {
  const memory = () => {
    const map = new Map<string, string>()
    return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v), map }
  }

  it('round-trips data', () => {
    const s = memory()
    const data = { ...defaultData(), learned: ['flag'], notes: { flag: 'ok' } }
    saveData(data, s)
    expect(loadData(s)).toEqual(data)
  })

  it('falls back to defaults on corrupted storage', () => {
    const s = memory()
    s.setItem(STORAGE_KEY, '{not json')
    expect(loadData(s)).toEqual(defaultData())
  })

  it('sanitizes malformed imported data', () => {
    const parsed = parseAppData({
      learned: ['a', 'a', 3],
      favorites: ['x', 'x'],
      notes: { a: 1 },
      journal: [{ id: '1', date: '2026-10-27', title: 'L1', moveIds: ['flag', 2] }, { foo: 'bar' }],
    })
    expect(parsed.learned).toEqual([])
    expect(parsed.favorites).toEqual(['x'])
    expect(parsed.notes).toEqual({})
    expect(parsed.journal).toEqual([{ id: '1', date: '2026-10-27', title: 'L1', notes: '', moveIds: [] }])
  })

  it('never exports the API key', () => {
    const data = { ...defaultData(), settings: { openAiKey: 'sk-secret', openAiModel: 'gpt-4o-mini' } }
    expect(exportData(data)).not.toContain('sk-secret')
  })

  it('toggles ids', () => {
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b'])
  })
})

describe('routing and formatting', () => {
  it('parses hash routes', () => {
    expect(parseHash('#/mossa/flag').segments).toEqual(['mossa', 'flag'])
    expect(parseHash('').path).toBe('/')
    expect(parseHash('#/diario?x=1').query.get('x')).toBe('1')
    expect(href('mossa', 'a b')).toBe('#/mossa/a%20b')
  })

  it('formats seconds', () => {
    expect(formatSeconds(180)).toBe('3:00')
    expect(formatSeconds(65.2)).toBe('1:06')
    expect(formatSeconds(-3)).toBe('0:00')
  })
})
