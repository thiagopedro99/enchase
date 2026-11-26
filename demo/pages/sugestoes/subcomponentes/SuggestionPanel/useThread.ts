import { useCallback, useEffect, useState } from 'react'

import { loadThread } from '../../account.ts'

import type { Comment } from '../../comment.ts'
import type { ThreadState } from '../../types.ts'

export const useThread = (id: number | null) => {
  const [state, setState] = useState<ThreadState>({ status: 'loading' })

  useEffect(() => {
    if (id === null) return undefined

    const controller = new AbortController()

    setState({ status: 'loading' })
    loadThread(id, controller.signal).then((loaded) => {
      if (!controller.signal.aborted) setState(loaded)
    })

    return () => controller.abort()
  }, [id])

  const append = useCallback((comment: Comment) => setState((current) => (current.status === 'ready' ? { status: 'ready', thread: { ...current.thread, total: current.thread.total + 1, comments: [...current.thread.comments, comment] } } : current)), [])

  return { state, append }
}
