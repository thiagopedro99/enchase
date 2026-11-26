import { useCallback, useEffect, useState } from 'react'

import { addToCache, loadSuggestions, put } from './loadSuggestions.ts'

import type { Suggestion, SuggestionsState } from './types.ts'

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

  const add = useCallback((suggestion: Suggestion) => {
    addToCache(suggestion)
    setState((current) => (current.status === 'ready' ? { status: 'ready', items: put(current.items, suggestion) } : current))
  }, [])

  return { state, reload, add }
}
