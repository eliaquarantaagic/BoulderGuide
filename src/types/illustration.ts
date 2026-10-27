export type Point = readonly [number, number]

export type LimbKey = 'armL' | 'armR' | 'legL' | 'legR'
export type Bend = 1 | -1
export type ViewKind = 'front' | 'side'
export type HoldShape = 'round' | 'bar' | 'vbar' | 'dome' | 'block' | 'pocket' | 'ledge'
export type Tone = 'accent' | 'danger' | 'neutral'

/**
 * A body pose. Only end points are given: elbows and knees are solved
 * with two-bone IK. In side views the climber faces left (towards the wall).
 */
export interface Pose {
  hip: Point
  /** Degrees from upright; positive leans towards +x. */
  torso: number
  /** 0 = body facing the viewer, 1 = side-on (narrow shoulders and hips). Front view only. */
  turn?: number
  /** Extra head tilt (degrees) relative to the torso. */
  head?: number
  handL: Point
  handR: Point
  footL: Point
  footR: Point
  /** Which side each elbow/knee bows to (see solveLimb). */
  bend?: Partial<Record<LimbKey, Bend>>
  /** Screen angle (degrees, 0 = +x, 90 = down) the foot points to. */
  footDir?: Partial<Record<'L' | 'R', number>>
}

export interface Figure {
  pose: Pose
  /** Limbs highlighted as the point of the lesson. */
  accent?: LimbKey[]
  tone?: 'main' | 'other' | 'ghost'
}

export interface IllHold {
  at: Point
  shape?: HoldShape
  rot?: number
  scale?: number
  color?: string
  /** Draws a ring around the hold. */
  focus?: boolean
}

export interface IllArrow {
  from: Point
  to: Point
  /** Sideways offset of the control point, to bend the arrow. */
  curve?: number
  dashed?: boolean
  tone?: Tone
}

export interface Decor {
  x: number
  y: number
  w: number
  h: number
  fill: 'wall' | 'volume' | 'platform'
  rx?: number
}

/** Magnified hold in a circle, drawn around (0,0) with arrows in local units. */
export interface Inset {
  hold: Omit<IllHold, 'at'>
  arrows?: IllArrow[]
}

export interface Scene {
  view: ViewKind
  /** Side-view wall. `overhang` is degrees (negative = slab); `top` ends the wall at that y. */
  wall?: { overhang: number; top?: number }
  decor?: Decor[]
  figures: Figure[]
  holds?: IllHold[]
  arrows?: IllArrow[]
  inset?: Inset
  caption: string
}
