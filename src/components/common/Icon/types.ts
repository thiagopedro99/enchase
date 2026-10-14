import type { ReactNode, SVGProps } from 'react'

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  size?: number
  title?: string
}

export type BaseIconProps = IconProps & {
  name: string
  directional?: boolean
  children: ReactNode
}
