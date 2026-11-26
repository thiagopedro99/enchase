import { useCallback, useState } from 'react'

import { checkDraft, emptyDraft } from '../../draft.ts'
import { draftKey } from '../../defaultData.ts'

import type { Draft } from '../../draft.ts'

const stored = (): Draft => {
  try {
    const { kind, title, need, proposal }: Partial<Draft> = JSON.parse(window.sessionStorage.getItem(draftKey) ?? '{}')
    const text = (value: unknown) => (typeof value === 'string' ? value : '')
    const checked = checkDraft({ ...emptyDraft, kind })

    return { kind: checked.ok || !checked.problems.kind ? (kind ?? emptyDraft.kind) : emptyDraft.kind, title: text(title), need: text(need), proposal: text(proposal) }
  } catch {
    return emptyDraft
  }
}

const store = (draft: Draft | null) => {
  try {
    if (draft) window.sessionStorage.setItem(draftKey, JSON.stringify(draft))
    else window.sessionStorage.removeItem(draftKey)
  } catch {
    return
  }
}

export const useDraft = () => {
  const [draft, setDraft] = useState(stored)

  const change = useCallback((changes: Partial<Draft>) => {
    setDraft((current) => {
      const next = { ...current, ...changes }

      store(next)

      return next
    })
  }, [])

  const clear = useCallback(() => {
    store(null)
    setDraft(emptyDraft)
  }, [])

  return { draft, change, clear }
}
