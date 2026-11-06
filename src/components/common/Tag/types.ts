import type { HTMLAttributes, ReactNode, Ref } from 'react'

export type TagSize = 'sm' | 'md'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  size?: TagSize | undefined
  onRemove?: (() => void) | undefined
  ref?: Ref<HTMLSpanElement> | undefined
}
