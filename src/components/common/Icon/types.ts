import type { HTMLAttributes, ReactNode, SVGProps } from 'react'

export interface IconSwapProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  first: ReactNode
  second: ReactNode
  showSecond: boolean
}

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  size?: number
  title?: string
}

export type BaseIconProps = IconProps & {
  name: string
  directional?: boolean
  children: ReactNode
}
