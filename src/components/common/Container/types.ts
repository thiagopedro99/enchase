import type { HTMLAttributes } from 'react'

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: ContainerMaxWidth
  padding?: boolean | string
  center?: boolean
}