import { useState } from 'react'
import { MoveCard } from '../components/MoveCard'
import { getCategory } from '../data'
import { useStore } from '../hooks/useStore'
import type { Level } from '../types/guide'
import { NotFound } from './NotFound'

type Filter = 'tutte' | Level | 'da-imparare'

export function CategoryPage({ id }: { id: string }) {
  const { data } = useStore()
  const [filter, setFilter] = useState<Filter>('tutte')
  const category = getCategory(id)
  if (!category) return <NotFound />

  const moves = category.moves.filter((m) =>
    filter === 'tutte' ? true : filter === 'da-imparare' ? !data.learned.includes(m.id) : m.level === filter,
  )
  const filters: { value: Filter; label: string }[] = [
    { value: 'tutte', label: 'Tutte' },
    { value: 'da-imparare', label: 'Da imparare' },
    { value: 'base', label: 'Base' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzato', label: 'Avanzato' },
  ]

  return (
    <div className="stack">
      <a href="#/" className="back">
        ← Guida
      </a>
      <header>
        <h1>
          {category.icon} {category.name}
        </h1>
        <p className="muted">{category.description}</p>
      </header>
      <div className="chips" role="group" aria-label="Filtra mosse">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            className={filter === f.value ? 'chip active' : 'chip'}
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {moves.length === 0 && <p className="muted">Nessuna mossa per questo filtro. 🎉</p>}
      {moves.map((m) => (
        <MoveCard key={m.id} item={{ move: m, category }} />
      ))}
    </div>
  )
}
