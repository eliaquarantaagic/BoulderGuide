export type Level = 'base' | 'intermedio' | 'avanzato'

export interface Move {
  id: string
  name: string
  aka?: string
  level: Level
  summary: string
  why: string
  when: string
  importance: string
  how: string[]
  mistakes: string[]
  tips?: string[]
  related?: string[]
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  moves: Move[]
}
