import type { Hold } from './holdDetection'

export type HoldRole = 'start' | 'top' | 'ignore'

export interface StepTip {
  text: string
  moveIds: string[]
}

export interface Step {
  kind: 'start' | 'hand' | 'feet' | 'top'
  holdIds: number[]
  text: string
  tips: StepTip[]
}

export interface PlanResult {
  steps: Step[]
  footOnly: number[]
  warnings: string[]
}

type Hand = 'L' | 'R'
const handName = (h: Hand) => (h === 'L' ? 'Mano sinistra' : 'Mano destra')

const dist = (a: Hold, b: Hold) => Math.hypot(a.x - b.x, a.y - b.y)

function median(values: number[]): number {
  if (values.length === 0) return 0
  const s = [...values].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function pickStarts(active: Hold[], roles: Record<number, HoldRole>, height: number): Hold[] {
  const marked = active.filter((h) => roles[h.id] === 'start')
  if (marked.length > 0) return marked.slice(0, 2)
  const candidates = active.filter((h) => roles[h.id] !== 'top')
  const [first, second] = candidates
  if (!first) return []
  // Never auto-pick two starts if that leaves no hold for the top.
  if (
    second &&
    candidates.length > 2 &&
    Math.abs(first.y - second.y) < height * 0.08 &&
    Math.abs(first.x - second.x) > height * 0.05
  ) {
    return [first, second]
  }
  return [first]
}

/**
 * Heuristic beta planner. Holds must be in image coordinates (y grows downwards).
 * It is only a starting point for reasoning, not a definitive solution.
 */
export function planSequence(
  holds: Hold[],
  roles: Record<number, HoldRole>,
  height: number,
): PlanResult {
  const warnings: string[] = []
  const active = holds.filter((h) => roles[h.id] !== 'ignore').sort((a, b) => b.y - a.y || a.x - b.x)
  if (active.length < 2) {
    return { steps: [], footOnly: [], warnings: ['Servono almeno 2 prese per proporre una sequenza.'] }
  }

  const starts = pickStarts(active, roles, height)
  const startIds = new Set(starts.map((h) => h.id))
  const markedTop = active.find((h) => roles[h.id] === 'top' && !startIds.has(h.id))
  const top = markedTop ?? [...active].filter((h) => !startIds.has(h.id)).sort((a, b) => a.y - b.y)[0]
  if (starts.length === 0 || !top) {
    return { steps: [], footOnly: [], warnings: ['Serve almeno una presa di partenza e una per il top: correggi i ruoli.'] }
  }
  const startY = Math.min(...starts.map((h) => h.y))
  const lowestStartY = Math.max(...starts.map((h) => h.y))

  const footOnly = active.filter((h) => !startIds.has(h.id) && h.id !== top.id && h.y > lowestStartY)
  const handHolds = active
    .filter((h) => !startIds.has(h.id) && h.id !== top.id && h.y <= lowestStartY)
    .sort((a, b) => b.y - a.y || a.x - b.x)
  handHolds.push(top)

  if (top.y > startY) warnings.push('Il top risulta più in basso della partenza: è un traverso? Segna manualmente partenza e top.')

  const path = [...starts, ...handHolds]
  const gaps: number[] = []
  for (let i = 1; i < path.length; i++) gaps.push(dist(path[i - 1], path[i]))
  const medianGap = median(gaps)
  const medianArea = median(active.map((h) => h.area))

  const steps: Step[] = []
  let left: Hold
  let right: Hold
  if (starts.length === 2) {
    ;[left, right] = starts[0].x <= starts[1].x ? [starts[0], starts[1]] : [starts[1], starts[0]]
    steps.push({
      kind: 'start',
      holdIds: [left.id, right.id],
      text: `Partenza: mano sinistra su ${left.id}, mano destra su ${right.id}.`,
      tips: [{ text: 'Prima di staccare i piedi da terra, carica bene gli appoggi.', moveIds: ['partenza-top', 'precisione-piedi'] }],
    })
  } else {
    left = right = starts[0]
    steps.push({
      kind: 'start',
      holdIds: [starts[0].id],
      text: `Partenza: entrambe le mani abbinate su ${starts[0].id}.`,
      tips: [{ text: 'Partenza abbinata: lascia spazio sulla presa per entrambe le mani.', moveIds: ['abbinare', 'partenza-top'] }],
    })
  }

  let lastMoved: Hand | null = null
  let lastFeet = ''

  for (const hold of handHolds) {
    const isTop = hold.id === top.id
    let hand: Hand
    if (left.id === right.id) hand = hold.x < left.x ? 'L' : 'R'
    else if (hold.x < Math.min(left.x, right.x)) hand = 'L'
    else if (hold.x > Math.max(left.x, right.x)) hand = 'R'
    else hand = lastMoved === 'L' ? 'R' : 'L'

    const from = hand === 'L' ? left : right
    const tips: StepTip[] = []
    const d = dist(from, hold)
    const dx = Math.abs(hold.x - from.x)
    const dy = Math.abs(hold.y - from.y)
    if (medianGap > 0 && d > medianGap * 1.6 && d > height * 0.18) {
      tips.push({ text: 'Movimento lungo: alza i piedi, ruota l’anca o valuta un dinamico.', moveIds: ['dinamico', 'piede-alto', 'twist'] })
    }
    if (dx > dy * 1.5 && dx > height * 0.08) {
      tips.push({ text: 'Spostamento laterale: sposta il peso sul lato e usa una bandiera o la punta esterna.', moveIds: ['flag', 'punta-esterna'] })
    }
    if (medianArea > 0 && hold.area > medianArea * 2.5 && !isTop) {
      tips.push({ text: 'Presa grande: buon punto per riposare a braccia tese e scuotere.', moveIds: ['shake-out', 'braccia-tese'] })
    } else if (medianArea > 0 && hold.area < medianArea * 0.4) {
      tips.push({ text: 'Presa piccola: piedi precisi e carichi prima di prenderla.', moveIds: ['tacca', 'precisione-piedi'] })
    }
    if (lastMoved === hand && !isTop) {
      tips.push({ text: 'La stessa mano si muove di nuovo: valuta se abbinare o incrociare.', moveIds: ['abbinare', 'incrocio'] })
    }

    if (isTop) {
      steps.push({
        kind: 'top',
        holdIds: [hold.id],
        text: `${handName(hand)} sul top ${hold.id}, poi abbina e tieni 2–3 secondi.`,
        tips: [...tips, { text: 'Dopo il top scendi arrampicando dove possibile.', moveIds: ['discesa', 'partenza-top'] }],
      })
    } else {
      steps.push({ kind: 'hand', holdIds: [hold.id], text: `${handName(hand)} su ${hold.id}.`, tips })
    }
    if (hand === 'L') left = hold
    else right = hold
    lastMoved = hand
    if (isTop) break

    const lowHandY = Math.max(left.y, right.y)
    const feet = active
      .filter((h) => h.id !== left.id && h.id !== right.id && h.y > lowHandY + height * 0.18 && h.y < lowHandY + height * 0.6)
      .sort((a, b) => a.y - b.y)
      .slice(0, 2)
    const key = feet.map((f) => f.id).sort().join(',')
    if (feet.length > 0 && key !== lastFeet) {
      steps.push({
        kind: 'feet',
        holdIds: feet.map((f) => f.id),
        text: `Alza i piedi su ${feet.map((f) => f.id).join(' e ')}.`,
        tips: [{ text: 'Spesso i piedi vanno dove prima avevi le mani.', moveIds: ['precisione-piedi', 'spinta-gambe'] }],
      })
      lastFeet = key
    }
  }

  return { steps, footOnly: footOnly.map((h) => h.id), warnings }
}
