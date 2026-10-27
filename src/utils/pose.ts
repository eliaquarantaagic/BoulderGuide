import type { Bend, LimbKey, Point, Pose, ViewKind } from '../types/illustration'

export const BODY = { upperArm: 18, foreArm: 18, thigh: 24, shin: 24, torso: 36, neck: 14, headRadius: 7, foot: 9 } as const
export const VIEW_BOX = { width: 240, height: 200 } as const
export const GROUND_Y = 178
export const WALL_PIVOT: Point = [70, 100]

const rad = (deg: number) => (deg * Math.PI) / 180

/** x of the wall surface at height y. Positive overhang leans the top towards the climber (+x). */
export const wallX = (y: number, overhang = 0) => WALL_PIVOT[0] + (WALL_PIVOT[1] - y) * Math.tan(rad(overhang))

export interface Limb {
  root: Point
  mid: Point
  end: Point
  /** Remaining reach: negative means the target is too far for the limb. */
  slack: number
}

/**
 * Two-bone IK. `bend` +1 bows the joint to the right of the root->target direction
 * as seen on screen (y down): for a limb pointing down, +1 bows towards -x.
 */
export function solveLimb(root: Point, target: Point, l1: number, l2: number, bend: Bend): Limb {
  const dx = target[0] - root[0]
  const dy = target[1] - root[1]
  const dist = Math.hypot(dx, dy)
  const ux = dist === 0 ? 0 : dx / dist
  const uy = dist === 0 ? 1 : dy / dist
  const d = Math.min(Math.max(dist, Math.abs(l1 - l2) + 0.01), l1 + l2)
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a))
  return {
    root,
    mid: [root[0] + ux * a - uy * h * bend, root[1] + uy * a + ux * h * bend],
    end: [root[0] + ux * d, root[1] + uy * d],
    slack: l1 + l2 - dist,
  }
}

export interface Skeleton {
  hip: Point
  shoulder: Point
  head: Point
  limbs: Record<LimbKey, Limb>
  feet: Record<'L' | 'R', { from: Point; to: Point }>
}

const DEFAULT_BEND: Record<ViewKind, Record<LimbKey, Bend>> = {
  side: { armL: 1, armR: 1, legL: 1, legR: 1 },
  front: { armL: -1, armR: 1, legL: 1, legR: -1 },
}

export function buildSkeleton(pose: Pose, view: ViewKind): Skeleton {
  const t = rad(pose.torso)
  const up: Point = [Math.sin(t), -Math.cos(t)]
  const right: Point = [Math.cos(t), Math.sin(t)]
  const shoulder: Point = [pose.hip[0] + up[0] * BODY.torso, pose.hip[1] + up[1] * BODY.torso]
  const turn = view === 'front' ? Math.min(Math.max(pose.turn ?? 0, 0), 1) : 1
  const halfShoulder = 11 - 8 * turn
  const halfHip = 6 - 4 * turn
  const at = (c: Point, k: number): Point => [c[0] + right[0] * k, c[1] + right[1] * k]
  const bend = { ...DEFAULT_BEND[view], ...pose.bend }

  const ht = t + rad(pose.head ?? 0)
  const head: Point = [shoulder[0] + Math.sin(ht) * BODY.neck, shoulder[1] - Math.cos(ht) * BODY.neck]

  const limbs: Record<LimbKey, Limb> = {
    armL: solveLimb(at(shoulder, -halfShoulder), pose.handL, BODY.upperArm, BODY.foreArm, bend.armL),
    armR: solveLimb(at(shoulder, halfShoulder), pose.handR, BODY.upperArm, BODY.foreArm, bend.armR),
    legL: solveLimb(at(pose.hip, -halfHip), pose.footL, BODY.thigh, BODY.shin, bend.legL),
    legR: solveLimb(at(pose.hip, halfHip), pose.footR, BODY.thigh, BODY.shin, bend.legR),
  }

  const defaultDir = { L: view === 'side' ? 180 : 160, R: view === 'side' ? 180 : 20 }
  const foot = (side: 'L' | 'R', end: Point) => {
    const a = rad(pose.footDir?.[side] ?? defaultDir[side])
    return { from: end, to: [end[0] + Math.cos(a) * BODY.foot, end[1] + Math.sin(a) * BODY.foot] as Point }
  }
  return { hip: pose.hip, shoulder, head, limbs, feet: { L: foot('L', limbs.legL.end), R: foot('R', limbs.legR.end) } }
}
