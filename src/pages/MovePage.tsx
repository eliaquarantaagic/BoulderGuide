import { MoveIllustration } from '../components/MoveIllustration'
import { LevelBadge, MoveCard } from '../components/MoveCard'
import { getMove } from '../data'
import { illustrations } from '../data/illustrations'
import { href } from '../hooks/useHashRoute'
import { useStore } from '../hooks/useStore'
import { NotFound } from './NotFound'

export function MovePage({ id }: { id: string }) {
  const { data, toggleLearned, toggleFavorite, setNote } = useStore()
  const ref = getMove(id)
  if (!ref) return <NotFound />
  const { move, category } = ref
  const illustration = illustrations[move.id]
  const learned = data.learned.includes(move.id)
  const favorite = data.favorites.includes(move.id)
  const lessons = data.journal.filter((e) => e.moveIds.includes(move.id))
  const related = (move.related ?? []).map(getMove).filter((r) => r !== undefined)

  return (
    <article className="stack">
      <a href={href('categoria', category.id)} className="back">
        ← {category.icon} {category.name}
      </a>
      <header>
        <h1>{move.name}</h1>
        {move.aka && <p className="muted">{move.aka}</p>}
        <LevelBadge level={move.level} />
      </header>

      <p className="lead">{move.summary}</p>

      {illustration && <MoveIllustration scene={illustration} />}

      <div className="row gap-sm">
        <button type="button" className={learned ? 'btn success' : 'btn'} aria-pressed={learned} onClick={() => toggleLearned(move.id)}>
          {learned ? '✅ Imparata' : '☐ Segna come imparata'}
        </button>
        <button type="button" className={favorite ? 'btn warn' : 'btn'} aria-pressed={favorite} onClick={() => toggleFavorite(move.id)}>
          {favorite ? '⭐ Preferita' : '☆ Preferita'}
        </button>
      </div>

      <section className="card info why">
        <h2>🤔 Perché si usa</h2>
        <p>{move.why}</p>
      </section>
      <section className="card info when">
        <h2>📍 Quando</h2>
        <p>{move.when}</p>
      </section>
      <section className="card info important">
        <h2>❗ Perché è importante</h2>
        <p>{move.importance}</p>
      </section>
      <section className="card info">
        <h2>🛠️ Come si fa</h2>
        <ol>
          {move.how.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
      <section className="card info mistakes">
        <h2>⚠️ Errori comuni</h2>
        <ul>
          {move.mistakes.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      {move.tips && (
        <section className="card info">
          <h2>💡 Consigli</h2>
          <ul>
            {move.tips.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card info">
        <h2>🗒️ I miei appunti</h2>
        <textarea
          className="notes"
          rows={4}
          placeholder="Cosa ti ha detto l’istruttore? Cosa hai sentito provandola?"
          value={data.notes[move.id] ?? ''}
          onChange={(e) => setNote(move.id, e.target.value)}
          aria-label="Appunti personali"
        />
        <p className="muted small">Salvati automaticamente sul dispositivo.</p>
        {lessons.length > 0 && (
          <>
            <h3>Nelle tue lezioni</h3>
            <ul>
              {lessons.map((l) => (
                <li key={l.id}>
                  <a href={href('diario', l.id)}>
                    {l.date} — {l.title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {related.length > 0 && (
        <section className="stack">
          <h2>Collegate</h2>
          {related.map((r) => (
            <MoveCard key={r.move.id} item={r} showCategory />
          ))}
        </section>
      )}
    </article>
  )
}
