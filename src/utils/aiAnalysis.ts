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

export function buildAiBody(req: AiRequest) {
  const details = [
    req.holdColor ? `Colore delle prese del blocco: ${req.holdColor}.` : '',
    req.extraNotes ? `Note dell'arrampicatore: ${req.extraNotes}` : '',
  ]
    .filter(Boolean)
    .join('\n')
  return {
    model: req.model,
    max_tokens: 900,
    messages: [
      { role: 'system', content: AI_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: details || 'Analizza questo blocco.' },
          { type: 'image_url', image_url: { url: req.imageDataUrl, detail: 'high' } },
        ],
      },
    ],
  }
}

export async function analyzeWithAi(req: AiRequest, fetchFn: FetchLike = fetch): Promise<string> {
  if (!req.apiKey.trim()) throw new Error('Inserisci la tua API key OpenAI nelle Impostazioni.')
  const res = await fetchFn('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${req.apiKey.trim()}` },
    body: JSON.stringify(buildAiBody(req)),
  })
  const json = (await res.json().catch(() => null)) as
    | { choices?: { message?: { content?: string } }[]; error?: { message?: string } }
    | null
  if (!res.ok) {
    const msg = json?.error?.message ?? `Errore HTTP ${res.status}`
    throw new Error(res.status === 401 ? 'API key non valida.' : msg)
  }
  const content = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('Risposta vuota dal servizio AI.')
  return content
}
