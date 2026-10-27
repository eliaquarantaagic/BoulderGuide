import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { type AppData, type JournalEntry, type Settings, loadData, newId, parseAppData, saveData, toggleId } from '../utils/storage'
import { StoreContext } from './useStore'
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())

  useEffect(() => {
    try {
      saveData(data)
    } catch {
      // Storage full or disabled (private mode): the app keeps working in memory.
    }
  }, [data])

  const toggleLearned = useCallback((id: string) => setData((d) => ({ ...d, learned: toggleId(d.learned, id) })), [])
  const toggleFavorite = useCallback((id: string) => setData((d) => ({ ...d, favorites: toggleId(d.favorites, id) })), [])
  const setNote = useCallback(
    (id: string, note: string) =>
      setData((d) => {
        const notes = { ...d.notes }
        if (note.trim()) notes[id] = note
        else delete notes[id]
        return { ...d, notes }
      }),
    [],
  )
  const saveEntry = useCallback((entry: Omit<JournalEntry, 'id'> & { id?: string }) => {
    const id = entry.id ?? newId()
    setData((d) => {
      const full: JournalEntry = { ...entry, id }
      const exists = d.journal.some((e) => e.id === id)
      const journal = exists ? d.journal.map((e) => (e.id === id ? full : e)) : [full, ...d.journal]
      return { ...d, journal }
    })
    return id
  }, [])
  const deleteEntry = useCallback((id: string) => setData((d) => ({ ...d, journal: d.journal.filter((e) => e.id !== id) })), [])
  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [],
  )
  const importBackup = useCallback(
    (raw: unknown) =>
      setData((d) => {
        const parsed = parseAppData(raw)
        return { ...parsed, settings: { ...parsed.settings, openAiKey: d.settings.openAiKey } }
      }),
    [],
  )
  const resetAll = useCallback(() => setData(parseAppData(null)), [])

  const value = useMemo(
    () => ({ data, toggleLearned, toggleFavorite, setNote, saveEntry, deleteEntry, updateSettings, importBackup, resetAll }),
    [data, toggleLearned, toggleFavorite, setNote, saveEntry, deleteEntry, updateSettings, importBackup, resetAll],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

