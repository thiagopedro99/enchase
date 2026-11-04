import type { HTMLAttributes, KeyboardEvent, PointerEvent, RefCallback } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children' | 'aria-label'> {
  value?: number | undefined
  defaultValue?: number | undefined
  onValueChange?: ((value: number) => void) | undefined
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  label?: string | undefined
  ariaLabel?: string | undefined
  formatValue?: ((value: number) => string) | undefined
  showValue?: boolean | undefined
  name?: string | undefined
  disabled?: boolean | undefined
  animation?: MotionOverride | undefined
}

export interface UseSliderOptions {
  value?: number | undefined
  defaultValue?: number | undefined
  onValueChange?: ((value: number) => void) | undefined
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  formatValue?: ((value: number) => string) | undefined
  disabled?: boolean | undefined
}

export interface UseSliderReturn {
  value: number
  percent: number
  valueText: string
  dragging: boolean
  pointerFocus: boolean
  setValue: (value: number) => void
  getTrackProps: <User extends object = object>(props?: User) => { ref: RefCallback<HTMLElement> } & Omit<User, 'ref'>
  getControlProps: <User extends object = object>(
    props?: User
  ) => {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void
    onPointerMove: (event: PointerEvent<HTMLElement>) => void
    onPointerUp: (event: PointerEvent<HTMLElement>) => void
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void
    onLostPointerCapture: (event: PointerEvent<HTMLElement>) => void
  } & User
  getThumbProps: <User extends object = object>(
    props?: User
  ) => {
    ref: RefCallback<HTMLElement>
    role: 'slider'
    tabIndex: 0 | undefined
    'aria-valuemin': number
    'aria-valuemax': number
    'aria-valuenow': number
    'aria-valuetext': string | undefined
    'aria-disabled': true | undefined
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
    onBlur: () => void
  } & Omit<User, 'ref'>
}
