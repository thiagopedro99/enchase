import type { HTMLAttributes, ReactNode } from 'react'

export type TagSize = 'sm' | 'md'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  size?: TagSize | undefined
  onRemove?: (() => void) | undefined
}
