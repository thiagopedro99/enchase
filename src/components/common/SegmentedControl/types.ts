import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, RefCallback } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export type SegmentedControlSize = 'sm' | 'md' | 'lg'

export interface SegmentedControlItem {
  value: string
  label: ReactNode
  ariaLabel?: string | undefined
  disabled?: boolean | undefined
}

export interface SegmentedControlBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children' | 'role'> {
  items: SegmentedControlItem[]
  label?: string | undefined
  ariaLabel?: string | undefined
  size?: SegmentedControlSize | undefined
  fullWidth?: boolean | undefined
  disabled?: boolean | undefined
  animation?: MotionOverride | undefined
}

export interface SegmentedControlSingleProps extends SegmentedControlBaseProps {
  multiple?: false | undefined
  value?: string | undefined
  defaultValue?: string | undefined
  onValueChange?: ((value: string) => void) | undefined
}

export interface SegmentedControlMultipleProps extends SegmentedControlBaseProps {
  multiple: true
  value?: string[] | undefined
  defaultValue?: string[] | undefined
  onValueChange?: ((value: string[]) => void) | undefined
}

export type SegmentedControlProps = SegmentedControlSingleProps | SegmentedControlMultipleProps

export interface UseSegmentedControlBaseOptions {
  items: { value: string; disabled?: boolean | undefined }[]
  disabled?: boolean | undefined
}

export interface UseSegmentedControlSingleOptions extends UseSegmentedControlBaseOptions {
  multiple?: false | undefined
  value?: string | undefined
  defaultValue?: string | undefined
  onValueChange?: ((value: string) => void) | undefined
}

export interface UseSegmentedControlMultipleOptions extends UseSegmentedControlBaseOptions {
  multiple: true
  value?: string[] | undefined
  defaultValue?: string[] | undefined
  onValueChange?: ((value: string[]) => void) | undefined
}

export type UseSegmentedControlOptions = UseSegmentedControlSingleOptions | UseSegmentedControlMultipleOptions

export interface UseSegmentedControlReturn {
  selected: string[]
  choose: (value: string) => void
  getGroupProps: <User extends object = object>(props?: User & HTMLAttributes<HTMLElement>) => { role: 'group' | 'radiogroup'; onKeyDown: (event: KeyboardEvent<HTMLElement>) => void } & User
  getItemProps: <User extends object = object>(
    value: string,
    props?: User & HTMLAttributes<HTMLElement>
  ) => {
    ref: RefCallback<HTMLButtonElement>
    type: 'button'
    role: 'radio' | undefined
    'aria-checked': boolean | undefined
    'aria-pressed': boolean | undefined
    tabIndex: 0 | -1 | undefined
    disabled: boolean
    onClick: (event: MouseEvent<HTMLButtonElement>) => void
  } & Omit<User, 'ref'>
}
