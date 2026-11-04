import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, RefCallback } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export type TabsVariant = 'line' | 'card'

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
  variant?: TabsVariant | undefined
  ariaLabel?: string | undefined
  animation?: MotionOverride | undefined
}

export interface UseTabsOptions {
  items: { value: string; disabled?: boolean | undefined }[]
  value?: string | undefined
  defaultValue?: string | undefined
  onValueChange?: ((value: string) => void) | undefined
  activation?: 'automatic' | 'manual' | undefined
}

export interface UseTabsReturn {
  selected: string
  activeIndex: number
  tabbableIndex: number
  select: (value: string) => void
  getListProps: <User extends object = object>(props?: User) => { role: 'tablist'; tabIndex: -1; onKeyDown: (event: KeyboardEvent<HTMLElement>) => void } & User
  getTabProps: <User extends object = object>(
    index: number,
    props?: User
  ) => {
    ref: RefCallback<HTMLButtonElement>
    type: 'button'
    role: 'tab'
    id: string
    'aria-selected': boolean
    'aria-controls': string
    tabIndex: 0 | -1
    disabled: boolean | undefined
    onClick: (event: MouseEvent<HTMLButtonElement>) => void
  } & Omit<User, 'ref'>
  getPanelProps: <User extends object = object>(index: number, props?: User) => { role: 'tabpanel'; id: string; 'aria-labelledby': string; tabIndex: 0; hidden: boolean } & User
}
