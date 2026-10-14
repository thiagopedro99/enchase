import { useEffect, useRef } from 'react'

import { readStoredCollapsed, writeStoredCollapsed } from '@components/layout/storage.ts'

export const useStoredCollapsed = (storageKey: string | undefined, collapsed: boolean, setCollapsed: (collapsed: boolean) => void) => {
  const restored = useRef(false)
  const latest = useRef({ collapsed, setCollapsed })
  latest.current = { collapsed, setCollapsed }

  useEffect(() => {
    if (!storageKey) return

    const stored = readStoredCollapsed(storageKey)
    restored.current = true
    if (stored !== null && stored !== latest.current.collapsed) latest.current.setCollapsed(stored)
  }, [storageKey])

  useEffect(() => {
    if (storageKey && restored.current) writeStoredCollapsed(storageKey, collapsed)
  }, [storageKey, collapsed])
}
