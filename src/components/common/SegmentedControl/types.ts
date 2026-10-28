import type { HTMLAttributes, ReactNode } from 'react'
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
