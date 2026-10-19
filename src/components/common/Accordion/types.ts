import type { HTMLAttributes, ReactNode } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface AccordionItem {
  value: string
  title: string
  content: ReactNode
  disabled?: boolean
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  items: AccordionItem[]
  multiple?: boolean
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  headingLevel?: 2 | 3 | 4 | 5 | 6
  animation?: MotionOverride
}
