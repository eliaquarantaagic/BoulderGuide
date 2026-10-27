import { useMemo, useState } from 'react'
import { MoveCard } from '../components/MoveCard'
import { allMoves, categories } from '../data'
import { href } from '../hooks/useHashRoute'
import { useStore } from '../hooks/useStore'
import { moveOfTheDay, searchMoves } from '../utils/search'

export function HomePage() {
  const { data } = useStore()
  const [query, setQuery] = useState('')
  const [today] = useState(() => new Date())
  const results = useMemo(() => searchMoves(allMoves, query), [query])
  const toReview = useMemo(() => allMoves.filter((m) => !data.learned.includes(m.move.id)), [data.learned])
  const daily = moveOfTheDay(toReview.length ? toReview : allMoves, today)
  const learnedCount = allMoves.filter((m) => data.learned.includes(m.move.id)).length
  const pct = Math.round((learnedCount / allMoves.length) * 100)

  return (
    <div className="stack">
      <section className="hero card">
        <h1>La tua guida al boulder</h1>
        <p className="muted">Salva le nozioni delle lezioni, segna cosa hai imparato e ripassa.</p>
        <div className="progress" aria-label={`Progresso ${pct}%`}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <p className="small">
          {learnedCount} / {allMoves.length} nozioni imparate
        </p>
      </section>

      <input
        className="search"
        type="search"
        placeholder="Cerca una mossa: tallonaggio, svaso, riposo…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Cerca nella guida"
      />

      {query.trim() ? (
        <section className="stack">
          <h2>Risultati ({results.length})</h2>
          {results.length === 0 && <p className="muted">Nessuna mossa trovata.</p>}
          {results.map((r) => (
            <MoveCard key={r.move.id} item={r} showCategory />
          ))}
        </section>
      ) : (
        <>
          {daily && (
            <section className="stack">
              <h2>💡 Ripasso del giorno</h2>
              <MoveCard item={daily} showCategory />
            </section>
          )}

          <section className="stack">
            <h2>Categorie</h2>
            <div className="grid">
              {categories.map((c) => {
                const done = c.moves.filter((m) => data.learned.includes(m.id)).length
                return (
                  <a key={c.id} className="card category-card" href={href('categoria', c.id)}>
                    <span className="category-icon" aria-hidden="true">
                      {c.icon}
                    </span>
                    <strong>{c.name}</strong>
                    <span className="muted small">
                      {done}/{c.moves.length} imparate
                    </span>
                  </a>
                )
              })}
              <a className="card category-card" href={href('preferiti')}>
                <span className="category-icon" aria-hidden="true">
                  ⭐
                </span>
                <strong>Preferite e note</strong>
                <span className="muted small">{data.favorites.length} preferite</span>
              </a>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
