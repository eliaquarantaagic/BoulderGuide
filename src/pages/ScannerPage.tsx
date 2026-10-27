import { useEffect, useMemo, useRef, useState } from 'react'
import { AiPanel } from '../components/AiPanel'
import { drawOverlay, hitTest } from '../components/scannerOverlay'
import { getMove } from '../data'
import { href } from '../hooks/useHashRoute'
import { fitSize, holdColors, nearestColorName } from '../utils/colors'
import { type Hold, detectHolds, hexToRgb, rgbToHex, sampleColor } from '../utils/holdDetection'
import { type HoldRole, planSequence } from '../utils/sequencePlanner'

type Mode = 'colore' | 'ruoli'
const ANALYSIS_SIDE = 600
const AI_SIDE = 1024
const nextRole: Record<string, HoldRole | undefined> = { none: 'start', start: 'top', top: 'ignore', ignore: undefined }

export function ScannerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [pixels, setPixels] = useState<ImageData | null>(null)
  const [color, setColorState] = useState<string | null>(null)
  const [tolerance, setToleranceState] = useState(40)
  const [roles, setRoles] = useState<Record<number, HoldRole>>({})
  const [mode, setMode] = useState<Mode>('colore')
  const [highlight, setHighlight] = useState<number[]>([])
  const [loadError, setLoadError] = useState('')

  const holds = useMemo<Hold[]>(
    () => (pixels && color ? detectHolds(pixels, hexToRgb(color), { tolerance }) : []),
    [pixels, color, tolerance],
  )
  const resetDetection = () => {
    setRoles({})
    setHighlight([])
  }
  const setColor = (c: string | null) => {
    setColorState(c)
    resetDetection()
  }
  const setTolerance = (t: number) => {
    setToleranceState(t)
    resetDetection()
  }

  const plan = useMemo(
    () => (pixels && holds.length ? planSequence(holds, roles, pixels.height) : null),
    [holds, roles, pixels],
  )
  const order = useMemo(
    () => (plan ? plan.steps.filter((s) => s.kind !== 'feet').flatMap((s) => s.holdIds) : []),
    [plan],
  )
  const displayRoles = useMemo(() => {
    const auto: Record<number, HoldRole> = {}
    for (const s of plan?.steps ?? []) {
      if (s.kind === 'start' || s.kind === 'top') s.holdIds.forEach((id) => (auto[id] = s.kind as HoldRole))
    }
    return { ...auto, ...roles }
  }, [plan, roles])

  useEffect(() => {
    if (!pixels) return
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    drawOverlay(ctx, pixels, { holds, roles: displayRoles, footOnly: plan?.footOnly ?? [], highlight, order })
  }, [pixels, holds, displayRoles, plan, highlight, order])

  const onFile = (file: File | undefined) => {
    if (!file) return
    setLoadError('')
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      const { width, height } = fitSize(img.naturalWidth, img.naturalHeight, ANALYSIS_SIDE)
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0, width, height)
      setPixels(ctx.getImageData(0, 0, width, height))
      setColor(null)
      setMode('colore')
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      setLoadError('Impossibile leggere l’immagine.')
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !pixels) return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height
    if (mode === 'colore') {
      setColor(rgbToHex(sampleColor(pixels, x, y, 3)))
      return
    }
    const hold = hitTest(holds, x, y, (12 * canvas.width) / rect.width)
    if (!hold) return
    setRoles((r) => {
      const role = nextRole[r[hold.id] ?? displayRoles[hold.id] ?? 'none']
      const copy = { ...r }
      if (role) copy[hold.id] = role
      else delete copy[hold.id]
      return copy
    })
  }

  const getAiImage = () => {
    const img = imageRef.current
    if (!img) return null
    const { width, height } = fitSize(img.naturalWidth, img.naturalHeight, AI_SIDE)
    const c = document.createElement('canvas')
    c.width = width
    c.height = height
    c.getContext('2d')?.drawImage(img, 0, 0, width, height)
    return c.toDataURL('image/jpeg', 0.8)
  }

  return (
    <div className="stack">
      <h1>📷 Scanner del blocco</h1>
      <p className="muted">
        Fotografa il blocco intero, frontale e ben illuminato. Lo scanner riconosce le prese del colore scelto e propone una
        sequenza da cui partire: verificala sempre con la <a href={href('mossa', 'lettura')}>lettura da terra</a>.
      </p>

      <label className="btn primary file-btn">
        {pixels ? 'Cambia foto' : 'Scatta o scegli una foto'}
        <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} hidden />
      </label>
      {loadError && <p className="error">{loadError}</p>}

      <div className={pixels ? 'canvas-wrap' : 'canvas-wrap empty'}>
        <canvas ref={canvasRef} onClick={onCanvasClick} className={mode === 'colore' ? 'pick' : 'roles'} aria-label="Foto del blocco" />
      </div>

      {pixels && (
        <section className="card stack">
          <div className="chips" role="group" aria-label="Modalità tocco">
            <button type="button" className={mode === 'colore' ? 'chip active' : 'chip'} onClick={() => setMode('colore')}>
              1 · Tocca una presa per il colore
            </button>
            <button type="button" className={mode === 'ruoli' ? 'chip active' : 'chip'} onClick={() => setMode('ruoli')} disabled={!holds.length}>
              2 · Correggi partenza/top
            </button>
          </div>
          <div className="swatches" role="group" aria-label="Colori delle prese">
            {holdColors.map((c) => (
              <button
                key={c.name}
                type="button"
                className={color === c.hex ? 'swatch active' : 'swatch'}
                style={{ background: c.hex }}
                title={c.name}
                aria-label={c.name}
                onClick={() => setColor(c.hex)}
              />
            ))}
          </div>
          {color && (
            <p className="small">
              Colore: <span className="dot" style={{ background: color }} /> {nearestColorName(color)} · {holds.length} prese trovate
            </p>
          )}
          <label className="field">
            Tolleranza colore: {tolerance}
            <input type="range" min={5} max={90} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} />
          </label>
          {mode === 'ruoli' && (
            <p className="muted small">
              Tocca una presa per cambiarne il ruolo: <b className="c-start">partenza</b> → <b className="c-top">top</b> → <b>ignora</b> → automatico.
            </p>
          )}
          <p className="muted small legend">
            <span className="c-start">● partenza</span> <span className="c-top">● top</span> <span className="c-hand">● mani</span>{' '}
            <span className="c-foot">● solo piedi</span>
          </p>
        </section>
      )}

      {plan && (
        <section className="card stack">
          <h2>🧭 Sequenza suggerita</h2>
          {plan.warnings.map((w) => (
            <p key={w} className="error">
              {w}
            </p>
          ))}
          <ol className="steps">
            {plan.steps.map((s, i) => (
              <li
                key={i}
                className={`step step-${s.kind}`}
                onMouseEnter={() => setHighlight(s.holdIds)}
                onClick={() => setHighlight(s.holdIds)}
              >
                <div>{s.text}</div>
                {s.tips.map((t) => (
                  <div key={t.text} className="tip small">
                    💡 {t.text}{' '}
                    {t.moveIds.map((id) => {
                      const m = getMove(id)
                      return m ? (
                        <a key={id} className="badge link" href={href('mossa', id)}>
                          {m.move.name}
                        </a>
                      ) : null
                    })}
                  </div>
                ))}
              </li>
            ))}
          </ol>
          <p className="muted small">
            Suggerimento euristico basato su posizione e dimensione delle prese: non conosce la forma delle prese né la tua altezza.
          </p>
        </section>
      )}

      {pixels && <AiPanel getImageDataUrl={getAiImage} colorName={color ? nearestColorName(color) : undefined} />}

      <section className="card stack">
        <h2>🛡️ Prima di provare</h2>
        <ul className="small">
          <li>Controlla la zona di caduta e che nessuno sia sotto.</li>
          <li>Individua dove scendere dopo il top.</li>
          <li>Riposa 2–5 minuti tra i tentativi duri.</li>
        </ul>
      </section>
    </div>
  )
}
