import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, RefCallback } from 'react'
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

export interface UseAccordionOptions {
  items: { value: string; disabled?: boolean | undefined }[]
  multiple?: boolean | undefined
  value?: string[] | undefined
  defaultValue?: string[] | undefined
  onValueChange?: ((value: string[]) => void) | undefined
}

export interface UseAccordionReturn {
  expanded: string[]
  toggle: (value: string) => void
  getTriggerProps: <User extends object = object>(
    value: string,
    props?: User
  ) => {
    ref: RefCallback<HTMLButtonElement>
    type: 'button'
    id: string
    'aria-expanded': boolean
    'aria-controls': string
    disabled: boolean | undefined
    onClick: (event: MouseEvent<HTMLButtonElement>) => void
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  } & Omit<User, 'ref'>
  getPanelProps: <User extends object = object>(value: string, props?: User) => { role: 'region'; id: string; 'aria-labelledby': string; hidden: boolean } & User
}
