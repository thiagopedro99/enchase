import type { HTMLAttributes } from 'react'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  companyName?: string | undefined
  notice?: string | undefined
  year?: number | undefined
  links?: FooterLink[] | undefined
}
