import type { ReactNode } from 'react'

export type Language = 'pt-BR' | 'en-US' | 'es-ES'

export type AppState = {
  language: Language
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  modalOpen: boolean
  modalContent: ReactNode | null
  setLanguage: (language: Language) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  openModal: (content: ReactNode) => void
  closeModal: () => void
}
