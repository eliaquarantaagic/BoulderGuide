import { createContext, useContext } from 'react'
import type { AppData, JournalEntry, Settings } from '../utils/storage'

export interface Store {
  data: AppData
  toggleLearned: (id: string) => void
  toggleFavorite: (id: string) => void
  setNote: (id: string, note: string) => void
  saveEntry: (entry: Omit<JournalEntry, 'id'> & { id?: string }) => string
  deleteEntry: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  importBackup: (raw: unknown) => void
  resetAll: () => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
