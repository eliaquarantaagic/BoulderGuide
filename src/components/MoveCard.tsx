import type { MoveRef } from '../data'
import { href } from '../hooks/useHashRoute'
import { useStore } from '../hooks/useStore'
import type { Level } from '../types/guide'

const levelLabel: Record<Level, string> = { base: 'Base', intermedio: 'Intermedio', avanzato: 'Avanzato' }

export function LevelBadge({ level }: { level: Level }) {
  return <span className={`badge level-${level}`}>{levelLabel[level]}</span>
}

export function MoveCard({ item, showCategory = false }: { item: MoveRef; showCategory?: boolean }) {
  const { data } = useStore()
  const { move, category } = item
  const learned = data.learned.includes(move.id)
  const favorite = data.favorites.includes(move.id)
  return (
    <a className={`card move-card${learned ? ' learned' : ''}`} href={href('mossa', move.id)}>
      <div className="move-card-head">
        <strong>{move.name}</strong>
        <span className="move-flags">
          {favorite && <span title="Preferita">⭐</span>}
          {learned && <span title="Imparata">✅</span>}
          {data.notes[move.id] && <span title="Hai una nota">🗒️</span>}
        </span>
      </div>
      {move.aka && <div className="muted small">{move.aka}</div>}
      <p className="small">{move.summary}</p>
      <div className="row gap-sm">
        <LevelBadge level={move.level} />
        {showCategory && (
          <span className="badge">
            {category.icon} {category.name}
          </span>
        )}
      </div>
    </a>
  )
}
