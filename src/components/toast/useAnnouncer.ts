import { useCallback, useEffect, useRef, useState } from 'react'

import { announceDelay } from './defaultData.ts'

export const useAnnouncer = () => {
  const [text, setText] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pending = useRef<string[]>([])

  useEffect(() => () => clearTimeout(timer.current), [])

  const announce = useCallback((next: string) => {
    pending.current.push(next)
    clearTimeout(timer.current)
    setText('')
    timer.current = setTimeout(() => {
      setText(pending.current.join('. '))
      pending.current = []
    }, announceDelay)
  }, [])

  return [text, announce] as const
}
