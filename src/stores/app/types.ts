import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark'

export type Language = 'pt-BR' | 'en-US' | 'es-ES'

export type AppState = {
  theme: Theme
  language: Language
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  modalOpen: boolean
  modalContent: ReactNode | null
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  openModal: (content: ReactNode) => void
  closeModal: () => void
}
