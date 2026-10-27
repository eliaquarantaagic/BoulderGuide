import { useState } from 'react'
import { href } from '../hooks/useHashRoute'
import { useStore } from '../hooks/useStore'
import { analyzeWithAi } from '../utils/aiAnalysis'

interface Props {
  getImageDataUrl: () => string | null
  colorName?: string
}

export function AiPanel({ getImageDataUrl, colorName }: Props) {
  const { data } = useStore()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const hasKey = data.settings.openAiKey.trim().length > 0

  const run = async () => {
    const url = getImageDataUrl()
    if (!url) return
    setLoading(true)
    setError('')
    setResult('')
    try {
      const text = await analyzeWithAi({
        apiKey: data.settings.openAiKey,
        model: data.settings.openAiModel,
        imageDataUrl: url,
        holdColor: colorName,
        extraNotes: notes.trim() || undefined,
      })
      setResult(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card stack">
      <h2>🤖 Analisi AI (opzionale)</h2>
      {!hasKey ? (
        <p className="muted small">
          Per un’analisi più completa inserisci la tua API key OpenAI in <a href={href('impostazioni')}>Impostazioni</a>.
        </p>
      ) : (
        <>
          <p className="muted small">La foto (ridimensionata) viene inviata a OpenAI con la tua chiave. Non inviare foto con persone riconoscibili.</p>
          <label className="field">
            Note per l’AI (facoltativo)
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Es. sono alto 1,70, partenza seduta" maxLength={300} />
          </label>
          <button type="button" className="btn primary" onClick={run} disabled={loading}>
            {loading ? 'Analisi in corso…' : 'Analizza con AI'}
          </button>
        </>
      )}
      {error && <p className="error">{error}</p>}
      {result && <div className="ai-result pre">{result}</div>}
    </section>
  )
}
