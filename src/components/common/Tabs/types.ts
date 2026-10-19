import type { HTMLAttributes, ReactNode } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface TabsItem {
  value: string
  label: string
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  items: TabsItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  activation?: 'automatic' | 'manual'
  ariaLabel?: string
  animation?: MotionOverride
}
