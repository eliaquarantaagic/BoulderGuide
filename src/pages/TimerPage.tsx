import { useEffect, useRef, useState } from 'react'
import { href } from '../hooks/useHashRoute'
import { formatSeconds } from '../utils/format'

const presets = [
  { label: 'Riscaldamento', seconds: 60 },
  { label: 'Blocco medio', seconds: 120 },
  { label: 'Al limite', seconds: 180 },
  { label: 'Progetto duro', seconds: 300 },
]

function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    osc.frequency.value = 880
    osc.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
    osc.onended = () => void ctx.close()
  } catch {
    // Audio not available: vibration/visual feedback still works.
  }
  navigator.vibrate?.([200, 100, 200])
}

export function TimerPage() {
  const [duration, setDuration] = useState(180)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(180)
  const [attempts, setAttempts] = useState(0)
  const firedRef = useRef(false)

  useEffect(() => {
    if (endsAt === null) return
    firedRef.current = false
    const tick = () => {
      const left = (endsAt - Date.now()) / 1000
      setRemaining(Math.max(0, left))
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        beep()
        setEndsAt(null)
      }
    }
    tick()
    const t = window.setInterval(tick, 250)
    return () => window.clearInterval(t)
  }, [endsAt])

  const start = (seconds = duration) => {
    setDuration(seconds)
    setRemaining(seconds)
    setEndsAt(Date.now() + seconds * 1000)
  }
  const resume = () => setEndsAt(Date.now() + remaining * 1000)
  const running = endsAt !== null
  const done = !running && remaining <= 0
  const paused = !running && remaining > 0 && remaining < duration

  return (
    <div className="stack">
      <h1>⏱️ Timer di riposo</h1>
      <p className="muted">
        Tra un tentativo e l’altro su un blocco duro riposa 2–5 minuti.{' '}
        <a href={href('mossa', 'riposo-tentativi')}>Perché?</a>
      </p>
      <div className={`card timer ${done ? 'timer-done' : ''}`} role="timer" aria-live="polite">
        <div className="timer-value">{done ? 'Vai! 💪' : formatSeconds(remaining)}</div>
        <div className="muted small">Tentativi in questa sessione: {attempts}</div>
      </div>
      <div className="chips">
        {presets.map((p) => (
          <button key={p.seconds} type="button" className={duration === p.seconds ? 'chip active' : 'chip'} onClick={() => start(p.seconds)}>
            {p.label} · {formatSeconds(p.seconds)}
          </button>
        ))}
      </div>
      <div className="row gap-sm">
        {running ? (
          <button type="button" className="btn" onClick={() => setEndsAt(null)}>
            Pausa
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={() => (paused ? resume() : start())}>
            {paused ? 'Riprendi' : 'Avvia'}
          </button>
        )}
        <button
          type="button"
          className="btn"
          onClick={() => {
            setAttempts((a) => a + 1)
            start(duration)
          }}
        >
          Ho provato · riposo
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEndsAt(null)
            setRemaining(duration)
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
