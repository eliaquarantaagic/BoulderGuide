export interface JournalEntry {
  id: string
  date: string
  title: string
  notes: string
  moveIds: string[]
}

export interface Settings {
  openAiKey: string
  openAiModel: string
}

export interface AppData {
  version: 1
  learned: string[]
  favorites: string[]
  notes: Record<string, string>
  journal: JournalEntry[]
  settings: Settings
}

export const STORAGE_KEY = 'climbing-guide:v1'

export const defaultData = (): AppData => ({
  version: 1,
  learned: [],
  favorites: [],
  notes: {},
  journal: [],
  settings: { openAiKey: '', openAiModel: 'gpt-4o-mini' },
})

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string')

const isRecordOfStrings = (v: unknown): v is Record<string, string> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && Object.values(v).every((x) => typeof x === 'string')

function parseEntry(v: unknown): JournalEntry | null {
  if (typeof v !== 'object' || v === null) return null
  const e = v as Record<string, unknown>
  if (typeof e.id !== 'string' || typeof e.date !== 'string' || typeof e.title !== 'string') return null
  return {
    id: e.id,
    date: e.date,
    title: e.title,
    notes: typeof e.notes === 'string' ? e.notes : '',
    moveIds: isStringArray(e.moveIds) ? e.moveIds : [],
  }
}

/**
 * Validates untrusted data (localStorage or an imported backup) and falls back
 * to defaults for any malformed field.
 */
export function parseAppData(raw: unknown, keepSettings = true): AppData {
  const base = defaultData()
  if (typeof raw !== 'object' || raw === null) return base
  const r = raw as Record<string, unknown>
  const settings = r.settings as Record<string, unknown> | undefined
  return {
    version: 1,
    learned: isStringArray(r.learned) ? [...new Set(r.learned)] : base.learned,
    favorites: isStringArray(r.favorites) ? [...new Set(r.favorites)] : base.favorites,
    notes: isRecordOfStrings(r.notes) ? { ...r.notes } : base.notes,
    journal: Array.isArray(r.journal)
      ? r.journal.map(parseEntry).filter((e): e is JournalEntry => e !== null)
      : base.journal,
    settings:
      keepSettings && settings
        ? {
            openAiKey: typeof settings.openAiKey === 'string' ? settings.openAiKey : '',
            openAiModel:
              typeof settings.openAiModel === 'string' && settings.openAiModel
                ? settings.openAiModel
                : base.settings.openAiModel,
          }
        : base.settings,
  }
}

export function loadData(storage: Pick<Storage, 'getItem'> = localStorage): AppData {
  try {
    const text = storage.getItem(STORAGE_KEY)
    return text ? parseAppData(JSON.parse(text)) : defaultData()
  } catch {
    return defaultData()
  }
}

export function saveData(data: AppData, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/** Backup never contains the API key. */
export function exportData(data: AppData): string {
  const { settings, ...rest } = data
  return JSON.stringify({ ...rest, settings: { openAiModel: settings.openAiModel } }, null, 2)
}

export function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
