import type { CardProps } from '../Card/types.ts'
import type { ButtonHTMLAttributes, Ref } from 'react'

export interface CardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Pick<CardProps, 'variant' | 'padding' | 'animation'> {
  ref?: Ref<HTMLButtonElement> | undefined
}
