import { persist } from 'zustand/middleware'
import { create } from 'zustand'

import type { AppState } from './types.ts'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'pt-BR',
      sidebarOpen: false,
      sidebarCollapsed: false,
      modalOpen: false,
      modalContent: null,
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      openModal: (content) => set({ modalOpen: true, modalContent: content }),
      closeModal: () => set({ modalOpen: false, modalContent: null })
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
)
