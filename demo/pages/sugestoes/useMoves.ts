import { useCallback, useState } from 'react'
import { useToast } from 'enchase'

import { moveMessages } from './defaultData.ts'
import { sendMove } from './account.ts'

import type { MoveRequest, Status, Suggestion } from './types.ts'
import type { Move } from './move.ts'

interface Options {
  onMoved: (suggestion: Suggestion) => void
  onSignedOut: () => void
}

const needsDetails: Status[] = ['lancado', 'recusado']

export const useMoves = ({ onMoved, onSignedOut }: Options) => {
  const [placed, setPlaced] = useState<Record<number, Status>>({})
  const [asking, setAsking] = useState<MoveRequest | null>(null)
  const toast = useToast()

  const settle = useCallback((id: number) => setPlaced((current) => Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== id))), [])

  const apply = useCallback(
    async ({ id }: Suggestion, move: Partial<Move> & { status: Status }) => {
      setPlaced((current) => ({ ...current, [id]: move.status }))

      const result = await sendMove(id, move)

      if (result.status === 'ok') onMoved(result.suggestion)
      else toast.error(result.status === 'invalid' ? moveMessages.failed : moveMessages[result.status])

      if (result.status === 'signedOut') onSignedOut()

      settle(id)
    },
    [onMoved, onSignedOut, settle, toast]
  )

  const request = useCallback(
    (suggestion: Suggestion, status: Status) => {
      if (status === suggestion.status) return
      if (needsDetails.includes(status)) setAsking({ suggestion, status })
      else void apply(suggestion, { status })
    },
    [apply]
  )

  const confirm = useCallback(
    (details: Partial<Move>) => {
      if (asking) void apply(asking.suggestion, { ...details, status: asking.status })

      setAsking(null)
    },
    [apply, asking]
  )

  const cancel = useCallback(() => setAsking(null), [])

  return { placed, asking, request, confirm, cancel }
}
