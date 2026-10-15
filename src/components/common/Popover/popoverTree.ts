import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'

import type { PopoverTree, PopoverTreeNode } from './types.ts'
import type { RefObject } from 'react'

export const PopoverTreeContext = createContext<PopoverTree | null>(null)

export const usePopoverTree = (contentRef: RefObject<HTMLElement | null>, mounted: boolean) => {
  const parent = useContext(PopoverTreeContext)
  const children = useRef(new Set<PopoverTreeNode>())

  const contains = useCallback<PopoverTreeNode>((node) => Boolean(contentRef.current?.contains(node)) || Array.from(children.current).some((child) => child(node)), [contentRef])

  useEffect(() => {
    if (!parent || !mounted) return undefined

    return parent.add(contains)
  }, [parent, mounted, contains])

  const tree = useMemo<PopoverTree>(
    () => ({
      add: (child) => {
        children.current.add(child)

        return () => {
          children.current.delete(child)
        }
      }
    }),
    []
  )

  return { contains, tree }
}
