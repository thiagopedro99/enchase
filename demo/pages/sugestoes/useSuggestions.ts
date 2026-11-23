import { useCallback, useEffect, useState } from 'react'

import { loadSuggestions } from './github.ts'

import type { SuggestionsState } from './types.ts'

export const useSuggestions = () => {
  const [state, setState] = useState<SuggestionsState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    loadSuggestions(controller.signal, attempt > 0).then((result) => {
      if (controller.signal.aborted) return

      setState(result.ok ? { status: 'ready', items: result.items } : { status: 'error', limited: result.limited })
    })

    return () => controller.abort()
  }, [attempt])

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((count) => count + 1)
  }, [])

  return { state, reload }
}
