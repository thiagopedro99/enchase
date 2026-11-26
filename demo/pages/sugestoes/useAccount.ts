import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from 'enchase'

import { loadAccount, sendLogout, sendVote } from './account.ts'
import { patchVotes } from './loadSuggestions.ts'
import { voteMessages } from './defaultData.ts'

import type { AccountState, LoginReason, LoginRequest, Voting } from './types.ts'

const without = (list: number[], id: number) => list.filter((item) => item !== id)

export const useAccount = () => {
  const [account, setAccount] = useState<AccountState>({ status: 'unavailable' })
  const [deltas, setDeltas] = useState<Record<number, number>>({})
  const [pending, setPending] = useState<number[]>([])
  const [asking, setAsking] = useState<LoginRequest | null>(null)
  const busy = useRef(new Set<number>())
  const toast = useToast()

  useEffect(() => {
    const controller = new AbortController()

    loadAccount(controller.signal).then((loaded) => {
      if (!controller.signal.aborted) setAccount(loaded)
    })

    return () => controller.abort()
  }, [])

  const mark = useCallback((id: number, voted: boolean) => {
    setAccount((current) => (current.status === 'signed' ? { ...current, voted: voted ? [...without(current.voted, id), id] : without(current.voted, id) } : current))
    setDeltas((current) => ({ ...current, [id]: (current[id] ?? 0) + (voted ? 1 : -1) }))
  }, [])

  const toggle = useCallback(
    async (id: number, voted: boolean) => {
      if (busy.current.has(id)) return

      busy.current.add(id)
      setPending((current) => [...current, id])
      mark(id, voted)

      const result = await sendVote(id, voted)

      busy.current.delete(id)
      setPending((current) => without(current, id))

      if (result === 'ok') {
        patchVotes(id, voted ? 1 : -1)

        return
      }

      mark(id, !voted)
      toast.error(voteMessages[result])

      if (result === 'signedOut') setAccount({ status: 'anonymous' })
    },
    [mark, toast]
  )

  const voted = account.status === 'signed' ? account.voted : undefined

  const voting = useMemo<Voting>(
    () => ({
      mode: account.status === 'unavailable' ? 'off' : account.status,
      voted: voted ?? [],
      deltas,
      pending,
      onVote: (suggestion) => (voted ? void toggle(suggestion.id, !voted.includes(suggestion.id)) : setAsking({ reason: 'vote', suggestion }))
    }),
    [account.status, voted, deltas, pending, toggle]
  )

  const leave = useCallback(async () => {
    if (await sendLogout()) setAccount({ status: 'anonymous' })
    else toast.error(voteMessages.logout)
  }, [toast])

  const dismiss = useCallback(() => setAsking(null), [])

  const ask = useCallback((reason: LoginReason) => setAsking({ reason }), [])

  const expire = useCallback(() => setAccount({ status: 'anonymous' }), [])

  return { account, voting, asking, ask, dismiss, expire, leave }
}
