import type { HTMLAttributes } from 'react'

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  $columns?: number
  $gap?: string
  $minColumnWidth?: string
}
