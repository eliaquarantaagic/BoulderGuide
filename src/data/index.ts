import type { Category, Move } from '../types/guide'
import { attrezzatura, sicurezza } from './sicurezzaAttrezzatura'
import { piedi, prese } from './piediPrese'
import { movimento, riposo } from './movimentoRiposo'
import { lettura, mente, prevenzione, regole } from './letturaPrevenzioneMente'

export const categories: Category[] = [
  sicurezza,
  attrezzatura,
  piedi,
  prese,
  movimento,
  riposo,
  lettura,
  prevenzione,
  mente,
  regole,
]

export interface MoveRef {
  move: Move
  category: Category
}

const moveIndex = new Map<string, MoveRef>()
for (const category of categories) {
  for (const move of category.moves) moveIndex.set(move.id, { move, category })
}

export const allMoves: MoveRef[] = [...moveIndex.values()]

export function getMove(id: string): MoveRef | undefined {
  return moveIndex.get(id)
}

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}
