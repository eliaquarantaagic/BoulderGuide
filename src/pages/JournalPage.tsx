import { useMemo, useState } from 'react'
import { allMoves, categories, getMove } from '../data'
import { href } from '../hooks/useHashRoute'
import { useStore } from '../hooks/useStore'
import type { JournalEntry } from '../utils/storage'
import { normalize } from '../utils/search'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function JournalPage({ entryId }: { entryId?: string }) {
  const { data } = useStore()
  if (entryId) {
    const existing = data.journal.find((e) => e.id === entryId)
    return <JournalEditor key={entryId} entry={existing} />
  }
  const entries = [...data.journal].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="stack">
      <div className="row space-between">
        <h1>📝 Diario lezioni</h1>
        <a className="btn primary" href={href('diario', 'nuova')}>
          + Nuova
        </a>
      </div>
      <p className="muted">Dopo ogni lezione annota cosa hai imparato e collega le mosse della guida.</p>
      {entries.length === 0 && <div className="card muted">Nessuna lezione salvata. Inizia dalla prossima!</div>}
      {entries.map((e) => (
        <a key={e.id} className="card" href={href('diario', e.id)}>
          <div className="row space-between">
            <strong>{e.title || 'Lezione'}</strong>
            <span className="muted small">{e.date}</span>
          </div>
          {e.notes && <p className="small clamp">{e.notes}</p>}
          {e.moveIds.length > 0 && (
            <div className="chips">
              {e.moveIds.map((id) => {
                const m = getMove(id)
                return m ? (
                  <span key={id} className="badge">
                    {m.move.name}
                  </span>
                ) : null
              })}
            </div>
          )}
        </a>
      ))}
    </div>
  )
}

function JournalEditor({ entry }: { entry?: JournalEntry }) {
  const { saveEntry, deleteEntry, toggleLearned, data } = useStore()
  const [date, setDate] = useState(entry?.date ?? today())
  const [title, setTitle] = useState(entry?.title ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [moveIds, setMoveIds] = useState<string[]>(entry?.moveIds ?? [])
  const [filter, setFilter] = useState('')
  const [markLearned, setMarkLearned] = useState(false)

  const filtered = useMemo(() => {
    const q = normalize(filter.trim())
    return q ? allMoves.filter((m) => normalize(m.move.name + ' ' + (m.move.aka ?? '')).includes(q)) : null
  }, [filter])

  const toggle = (id: string) => setMoveIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const onSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveEntry({ id: entry?.id, date, title: title.trim() || 'Lezione', notes, moveIds })
    if (markLearned) moveIds.filter((id) => !data.learned.includes(id)).forEach(toggleLearned)
    window.location.hash = '#/diario'
  }

  const onDelete = () => {
    if (entry && window.confirm('Eliminare questa lezione?')) {
      deleteEntry(entry.id)
      window.location.hash = '#/diario'
    }
  }

  const checkbox = (id: string, name: string) => (
    <label key={id} className="check">
      <input type="checkbox" checked={moveIds.includes(id)} onChange={() => toggle(id)} />
      {name}
    </label>
  )

  return (
    <form className="stack" onSubmit={onSave}>
      <a href={href('diario')} className="back">
        ← Diario
      </a>
      <h1>{entry ? 'Modifica lezione' : 'Nuova lezione'}</h1>
      <label className="field">
        Data
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <label className="field">
        Titolo
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Lezione 3 – piedi e strapiombo" maxLength={120} />
      </label>
      <label className="field">
        Cosa ho imparato
        <textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Nozioni chiave, sensazioni, blocchi provati…" />
      </label>

      <fieldset className="card">
        <legend>Mosse trattate ({moveIds.length})</legend>
        <input className="search" type="search" placeholder="Filtra mosse…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        {filtered
          ? filtered.map((m) => checkbox(m.move.id, m.move.name))
          : categories.map((c) => (
              <details key={c.id}>
                <summary>
                  {c.icon} {c.name} ({c.moves.filter((m) => moveIds.includes(m.id)).length})
                </summary>
                {c.moves.map((m) => checkbox(m.id, m.name))}
              </details>
            ))}
        <label className="check">
          <input type="checkbox" checked={markLearned} onChange={(e) => setMarkLearned(e.target.checked)} />
          Segna queste mosse come imparate
        </label>
      </fieldset>

      <div className="row gap-sm">
        <button type="submit" className="btn primary">
          Salva
        </button>
        {entry && (
          <button type="button" className="btn danger" onClick={onDelete}>
            Elimina
          </button>
        )}
      </div>
    </form>
  )
}
