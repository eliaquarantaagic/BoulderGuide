import { useRef, useState } from 'react'
import { useStore } from '../hooks/useStore'
import { DEFAULT_GEMINI_MODEL } from '../utils/aiAnalysis'
import { exportData } from '../utils/storage'

const MAX_BACKUP_BYTES = 2_000_000

export function SettingsPage() {
  const { data, updateSettings, importBackup, resetAll } = useStore()
  const [showKey, setShowKey] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const onExport = () => {
    const blob = new Blob([exportData(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `boulder-notes-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = async (file: File | undefined) => {
    if (!file) return
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('too big')
      importBackup(JSON.parse(await file.text()))
      setMessage('Backup importato ✅')
    } catch {
      setMessage('File di backup non valido.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="stack">
      <h1>⚙️ Impostazioni</h1>

      <section className="card stack">
        <h2>🤖 Analisi AI dello scanner</h2>
        <p className="muted small">
          Facoltativa, con Google Gemini. Crea la chiave su{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
            Google AI Studio
          </a>
          . Resta salvata solo su questo dispositivo (localStorage), viene inviata solo a Google quando avvii un’analisi e
          non è inclusa nei backup.
        </p>
        <label className="field">
          API key Google AI Studio
          <div className="row gap-sm">
            <input
              type={showKey ? 'text' : 'password'}
              value={data.settings.geminiKey}
              onChange={(e) => updateSettings({ geminiKey: e.target.value })}
              placeholder="AIza…"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="button" className="btn" onClick={() => setShowKey((s) => !s)}>
              {showKey ? 'Nascondi' : 'Mostra'}
            </button>
          </div>
        </label>
        <label className="field">
          Modello
          <input
            value={data.settings.geminiModel}
            onChange={(e) => updateSettings({ geminiModel: e.target.value })}
            placeholder={DEFAULT_GEMINI_MODEL}
          />
        </label>
        {data.settings.geminiKey && (
          <button type="button" className="btn danger" onClick={() => updateSettings({ geminiKey: '' })}>
            Rimuovi chiave
          </button>
        )}
      </section>

      <section className="card stack">
        <h2>💾 I tuoi dati</h2>
        <p className="muted small">
          {data.learned.length} imparate · {data.favorites.length} preferite · {Object.keys(data.notes).length} appunti ·{' '}
          {data.journal.length} lezioni
        </p>
        <div className="row gap-sm">
          <button type="button" className="btn" onClick={onExport}>
            Esporta backup
          </button>
          <label className="btn file-btn">
            Importa backup
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
          </label>
          <button
            type="button"
            className="btn danger"
            onClick={() => window.confirm('Cancellare tutti i dati salvati?') && resetAll()}
          >
            Cancella tutto
          </button>
        </div>
        {message && <p className="small">{message}</p>}
      </section>

      <section className="card stack">
        <h2>ℹ️ Nota</h2>
        <p className="small muted">
          Questa guida è un supporto personale e non sostituisce istruttori qualificati. In caso di dolore o infortunio
          rivolgiti a un professionista sanitario.
        </p>
      </section>
    </div>
  )
}
