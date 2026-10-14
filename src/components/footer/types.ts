import type { HTMLAttributes } from 'react'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  companyName?: string
  notice?: string
  year?: number
  links?: FooterLink[]
}
