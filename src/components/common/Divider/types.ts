import type { HTMLAttributes, Ref } from 'react'

export type DividerOrientation = 'horizontal' | 'vertical'
export type DividerTextAlign = 'start' | 'center' | 'end'

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation | undefined
  decorative?: boolean | undefined
  textAlign?: DividerTextAlign | undefined
  ref?: Ref<HTMLHRElement> | undefined
}
