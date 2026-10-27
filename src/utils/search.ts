import type { MoveRef } from '../data'

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function searchMoves(moves: MoveRef[], query: string): MoveRef[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []
  return moves.filter(({ move, category }) => {
    const haystack = normalize(
      [move.name, move.aka ?? '', move.summary, move.why, move.when, category.name].join(' '),
    )
    return terms.every((t) => haystack.includes(t))
  })
}

/** Deterministic "move of the day" so it stays stable through the day. */
export function moveOfTheDay<T>(items: T[], date: Date): T | undefined {
  if (items.length === 0) return undefined
  const key = date.getFullYear() * 1000 + Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000)
  return items[key % items.length]
}
