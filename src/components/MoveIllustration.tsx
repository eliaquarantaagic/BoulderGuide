import { useId } from 'react'
import type { Decor, Figure, IllArrow, IllHold, Point, Scene, Tone } from '../types/illustration'
import { BODY, GROUND_Y, VIEW_BOX, buildSkeleton, wallX } from '../utils/pose'

const COLORS = {
  bg: '#1b2638',
  wall: '#3b4a61',
  volume: '#56657d',
  platform: '#56657d',
  mat: '#0f766e',
  matTop: '#14b8a6',
  hold: '#f2cc0c',
  accent: '#f97316',
  danger: '#ef4444',
  neutral: '#cbd5e1',
  outline: '#0b1220',
}

const FIGURE_COLORS = {
  main: { near: '#e2e8f0', far: '#94a3b8', torso: '#cbd5e1', opacity: 1 },
  other: { near: '#a5b4fc', far: '#7c8cd6', torso: '#8b9cf0', opacity: 1 },
  ghost: { near: '#e2e8f0', far: '#e2e8f0', torso: '#e2e8f0', opacity: 0.28 },
} as const

const toneColor = (tone: Tone = 'accent') => COLORS[tone]
const pts = (...p: Point[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

function HoldShapeSvg({ hold, at, scale = 1 }: { hold: Omit<IllHold, 'at'>; at: Point; scale?: number }) {
  const s = (hold.scale ?? 1) * scale
  const fill = hold.color ?? COLORS.hold
  const stroke = { stroke: COLORS.outline, strokeWidth: 0.8 / s, strokeOpacity: 0.6 }
  let shape
  switch (hold.shape ?? 'round') {
    case 'bar':
      shape = <rect x={-9} y={-2.6} width={18} height={5.2} rx={2.4} fill={fill} {...stroke} />
      break
    case 'vbar':
      shape = <rect x={-2.6} y={-9} width={5.2} height={18} rx={2.4} fill={fill} {...stroke} />
      break
    case 'dome':
      shape = <path d="M -9 4 A 9 9 0 0 1 9 4 Z" fill={fill} {...stroke} />
      break
    case 'block':
      shape = <rect x={-4.5} y={-8} width={9} height={16} rx={2.5} fill={fill} {...stroke} />
      break
    case 'ledge':
      shape = <rect x={-13} y={-2.5} width={26} height={5} rx={1.5} fill={fill} {...stroke} />
      break
    case 'pocket':
      shape = (
        <>
          <circle r={7} fill={fill} {...stroke} />
          <circle r={2.8} fill={COLORS.outline} />
        </>
      )
      break
    default:
      shape = <circle r={4.6} fill={fill} {...stroke} />
  }
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${hold.rot ?? 0}) scale(${s})`}>
      {shape}
      {hold.focus && <circle r={10.5} fill="none" stroke={COLORS.accent} strokeWidth={1.6 / s} strokeDasharray={`${3 / s} ${2 / s}`} />}
    </g>
  )
}

function ArrowSvg({ arrow, markerPrefix }: { arrow: IllArrow; markerPrefix: string }) {
  const tone = arrow.tone ?? 'accent'
  const [x1, y1] = arrow.from
  const [x2, y2] = arrow.to
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const cx = (x1 + x2) / 2 + (-dy / len) * (arrow.curve ?? 0)
  const cy = (y1 + y2) / 2 + (dx / len) * (arrow.curve ?? 0)
  return (
    <path
      d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
      fill="none"
      stroke={toneColor(tone)}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeDasharray={arrow.dashed ? '5 4' : undefined}
      markerEnd={`url(#${markerPrefix}-${tone})`}
    />
  )
}

function FigureSvg({ figure, view }: { figure: Figure; view: 'front' | 'side' }) {
  const sk = buildSkeleton(figure.pose, view)
  const palette = FIGURE_COLORS[figure.tone ?? 'main']
  const accent = new Set(figure.accent)
  const colorOf = (key: 'armL' | 'armR' | 'legL' | 'legR') =>
    accent.has(key) ? COLORS.accent : view === 'side' && key.endsWith('L') ? palette.far : palette.near

  const limb = (key: 'armL' | 'armR' | 'legL' | 'legR') => {
    const l = sk.limbs[key]
    const points = pts(l.root, l.mid, l.end)
    const color = colorOf(key)
    const foot = key.startsWith('leg') ? sk.feet[key === 'legL' ? 'L' : 'R'] : null
    return (
      <g key={key}>
        <polyline points={points} fill="none" stroke={COLORS.outline} strokeOpacity={0.55} strokeWidth={7.6} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={points} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        {foot && (
          <>
            <line x1={foot.from[0]} y1={foot.from[1]} x2={foot.to[0]} y2={foot.to[1]} stroke={COLORS.outline} strokeOpacity={0.55} strokeWidth={7} strokeLinecap="round" />
            <line x1={foot.from[0]} y1={foot.from[1]} x2={foot.to[0]} y2={foot.to[1]} stroke={color} strokeWidth={4.4} strokeLinecap="round" />
          </>
        )}
        {key.startsWith('arm') && <circle cx={l.end[0]} cy={l.end[1]} r={3.4} fill={color} stroke={COLORS.outline} strokeOpacity={0.55} strokeWidth={0.8} />}
      </g>
    )
  }

  const torso = (
    <g key="torso">
      <line x1={sk.hip[0]} y1={sk.hip[1]} x2={sk.shoulder[0]} y2={sk.shoulder[1]} stroke={COLORS.outline} strokeOpacity={0.55} strokeWidth={15} strokeLinecap="round" />
      <line x1={sk.hip[0]} y1={sk.hip[1]} x2={sk.shoulder[0]} y2={sk.shoulder[1]} stroke={palette.torso} strokeWidth={11.5} strokeLinecap="round" />
    </g>
  )
  const head = (
    <circle key="head" cx={sk.head[0]} cy={sk.head[1]} r={BODY.headRadius} fill={palette.near} stroke={COLORS.outline} strokeOpacity={0.55} strokeWidth={1} />
  )
  const order = view === 'side' ? [limb('legL'), limb('armL'), torso, limb('legR'), limb('armR'), head] : [limb('legL'), limb('legR'), torso, head, limb('armL'), limb('armR')]
  return <g opacity={palette.opacity}>{order}</g>
}

const DECOR_FILL: Record<Decor['fill'], string> = { wall: COLORS.wall, volume: COLORS.volume, platform: COLORS.platform }

export function MoveIllustration({ scene }: { scene: Scene }) {
  const markerPrefix = `ill${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const { width, height } = VIEW_BOX
  const wall = scene.wall
  const wallPoints =
    scene.view === 'side' && wall
      ? (() => {
          const top = wall.top ?? 0
          return pts([0, top], [wallX(top, wall.overhang), top], [wallX(GROUND_Y, wall.overhang), GROUND_Y], [0, GROUND_Y])
        })()
      : null
  const insetCenter: Point = [196, 46]

  return (
    <figure className="illustration">
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
        <defs>
          {(['accent', 'danger', 'neutral'] as const).map((tone) => (
            <marker key={tone} id={`${markerPrefix}-${tone}`} viewBox="0 0 10 10" refX={7} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={toneColor(tone)} />
            </marker>
          ))}
          <clipPath id={`${markerPrefix}-inset`}>
            <circle cx={insetCenter[0]} cy={insetCenter[1]} r={34} />
          </clipPath>
        </defs>
        <rect width={width} height={height} fill={COLORS.bg} />
        {scene.view === 'front' && <rect width={width} height={GROUND_Y} fill={COLORS.wall} />}
        {wallPoints && <polygon points={wallPoints} fill={COLORS.wall} />}
        {scene.decor?.map((d, i) => (
          <rect key={i} x={d.x} y={d.y} width={d.w} height={d.h} rx={d.rx ?? 0} fill={DECOR_FILL[d.fill]} />
        ))}
        <rect y={GROUND_Y} width={width} height={height - GROUND_Y} fill={COLORS.mat} />
        <rect y={GROUND_Y} width={width} height={2.5} fill={COLORS.matTop} />

        {scene.holds?.map((h, i) => (
          <HoldShapeSvg key={i} hold={h} at={h.at} />
        ))}
        {scene.figures.map((f, i) => (
          <FigureSvg key={i} figure={f} view={scene.view} />
        ))}
        {scene.arrows?.map((a, i) => (
          <ArrowSvg key={i} arrow={a} markerPrefix={markerPrefix} />
        ))}

        {scene.inset && (
          <g>
            <circle cx={insetCenter[0]} cy={insetCenter[1]} r={35} fill={COLORS.outline} stroke={COLORS.neutral} strokeWidth={1.5} />
            <g clipPath={`url(#${markerPrefix}-inset)`}>
              <g transform={`translate(${insetCenter[0]} ${insetCenter[1]})`}>
                <HoldShapeSvg hold={{ ...scene.inset.hold, focus: false }} at={[0, 0]} scale={2.4} />
                {scene.inset.arrows?.map((a, i) => (
                  <ArrowSvg key={i} arrow={a} markerPrefix={markerPrefix} />
                ))}
              </g>
            </g>
          </g>
        )}
      </svg>
      <figcaption>{scene.caption}</figcaption>
    </figure>
  )
}
