export const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash'

export const AI_PROMPT = `Sei un istruttore di bouldering esperto e parli italiano a un principiante.
Analizza la foto del blocco. Se indicato, considera solo le prese del colore specificato.
Rispondi in modo conciso con:
1. Partenza (dove vanno mani e piedi).
2. Sequenza passo-passo di mani e piedi fino al top.
3. Tecniche consigliate (es. bandiera, tallonaggio, lolotte, dinamico) e perché.
4. Punti di riposo e passaggio chiave.
5. Avvertenze di sicurezza (zona di caduta, uscita alta).
Se la foto non è chiara, dillo e indica cosa serve per una foto migliore.`

export interface AiRequest {
  apiKey: string
  model: string
  imageDataUrl: string
  holdColor?: string
  extraNotes?: string
}

type FetchLike = (input: string, init: RequestInit) => Promise<Pick<Response, 'ok' | 'status' | 'json'>>

interface InteractionResponse {
  steps?: { type?: string; content?: { type?: string; text?: string }[] }[]
  error?: { message?: string; status?: string }
}

export function splitDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const m = /^data:([^;,]+);base64,(.*)$/s.exec(dataUrl)
  if (!m) throw new Error('Immagine non valida.')
  return { mimeType: m[1], data: m[2] }
}

export function buildAiBody(req: AiRequest) {
  const details = [
    req.holdColor ? `Colore delle prese del blocco: ${req.holdColor}.` : '',
    req.extraNotes ? `Note dell'arrampicatore: ${req.extraNotes}` : '',
  ]
    .filter(Boolean)
    .join('\n')
  const image = splitDataUrl(req.imageDataUrl)
  return {
    model: req.model.trim() || DEFAULT_GEMINI_MODEL,
    system_instruction: AI_PROMPT,
    input: [
      { type: 'text', text: details || 'Analizza questo blocco.' },
      { type: 'image', data: image.data, mime_type: image.mimeType },
    ],
    generation_config: { thinking_level: 'low', max_output_tokens: 2048 },
    // The photo is personal data: ask Google not to retain the interaction.
    store: false,
  }
}

/** Joins the text blocks of the model output steps (REST equivalent of the SDK `output_text`). */
export function extractText(res: InteractionResponse | null): string {
  return (res?.steps ?? [])
    .filter((s) => s.type === 'model_output')
    .flatMap((s) => s.content ?? [])
    .filter((c) => c.type === 'text' && c.text)
    .map((c) => c.text)
    .join('\n')
    .trim()
}

export async function analyzeWithAi(req: AiRequest, fetchFn: FetchLike = fetch): Promise<string> {
  if (!req.apiKey.trim()) throw new Error('Inserisci la tua API key di Google AI Studio nelle Impostazioni.')
  const res = await fetchFn(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': req.apiKey.trim() },
    body: JSON.stringify(buildAiBody(req)),
  })
  const raw = (await res.json().catch(() => null)) as InteractionResponse | InteractionResponse[] | null
  // Google error payloads may be wrapped in an array: [{ "error": { ... } }].
  const json = Array.isArray(raw) ? (raw[0] ?? null) : raw
  if (!res.ok) {
    const msg = json?.error?.message ?? ''
    if (res.status === 401 || res.status === 403 || /api key/i.test(msg)) throw new Error('API key non valida o senza permessi.')
    if (res.status === 429) throw new Error('Limite di richieste raggiunto: riprova tra poco.')
    if (res.status === 404) throw new Error('Modello non trovato: controlla il nome del modello nelle Impostazioni.')
    throw new Error(msg || `Errore HTTP ${res.status}`)
  }
  const text = extractText(json)
  if (!text) throw new Error('Risposta vuota dal servizio AI.')
  return text
}
