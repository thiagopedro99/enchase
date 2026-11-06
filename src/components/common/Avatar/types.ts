import type { HTMLAttributes, ReactNode, Ref } from 'react'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string | undefined
  src?: string | undefined
  size?: AvatarSize | undefined
  children?: ReactNode | undefined
  ref?: Ref<HTMLSpanElement> | undefined
}
