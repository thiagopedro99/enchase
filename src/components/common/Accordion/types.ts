import type { HTMLAttributes, ReactNode } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface AccordionItem {
  value: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean | undefined
}

export type AccordionVariant = 'outlined' | 'borderless' | 'ghost'
export type AccordionIconPosition = 'start' | 'end'

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  items: AccordionItem[]
  multiple?: boolean | undefined
  value?: string[] | undefined
  defaultValue?: string[] | undefined
  onValueChange?: ((value: string[]) => void) | undefined
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined
  variant?: AccordionVariant | undefined
  iconPosition?: AccordionIconPosition | undefined
  animation?: MotionOverride | undefined
}
