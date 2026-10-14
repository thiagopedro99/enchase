import type { ReactNode, SVGProps } from 'react'

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  size?: number
}

export type BaseIconProps = IconProps & {
  name: string
  children: ReactNode
}
