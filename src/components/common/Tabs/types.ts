import type { HTMLAttributes, ReactNode } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface TabsItem {
  value: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean | undefined
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  items: TabsItem[]
  value?: string | undefined
  defaultValue?: string | undefined
  onValueChange?: ((value: string) => void) | undefined
  activation?: 'automatic' | 'manual' | undefined
  ariaLabel?: string | undefined
  animation?: MotionOverride | undefined
}
