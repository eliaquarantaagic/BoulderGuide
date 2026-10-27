import { MoveCard } from '../components/MoveCard'
import { allMoves } from '../data'
import { useStore } from '../hooks/useStore'

export function FavoritesPage() {
  const { data } = useStore()
  const favorites = allMoves.filter((m) => data.favorites.includes(m.move.id))
  const withNotes = allMoves.filter((m) => data.notes[m.move.id])

  return (
    <div className="stack">
      <a href="#/" className="back">
        ← Guida
      </a>
      <h1>⭐ Preferite e note</h1>
      <section className="stack">
        <h2>Preferite</h2>
        {favorites.length === 0 && <p className="muted">Nessuna preferita: tocca ☆ in una mossa.</p>}
        {favorites.map((m) => (
          <MoveCard key={m.move.id} item={m} showCategory />
        ))}
      </section>
      <section className="stack">
        <h2>Con i tuoi appunti</h2>
        {withNotes.length === 0 && <p className="muted">Ancora nessun appunto.</p>}
        {withNotes.map((m) => (
          <a key={m.move.id} className="card" href={`#/mossa/${m.move.id}`}>
            <strong>{m.move.name}</strong>
            <p className="small pre">{data.notes[m.move.id]}</p>
          </a>
        ))}
      </section>
    </div>
  )
}
