import type { Scene } from '../../types/illustration'
import { movimentoScenes } from './movimento'
import { piediScenes } from './piedi'
import { preseScenes } from './prese'
import { sicurezzaScenes } from './sicurezza'

/** Illustrations by move id. Only technique moves have one. */
export const illustrations: Record<string, Scene> = {
  ...sicurezzaScenes,
  ...piediScenes,
  ...preseScenes,
  ...movimentoScenes,
}
