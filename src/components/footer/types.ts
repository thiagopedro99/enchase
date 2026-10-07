export interface FooterLink {
  label: string
  href: string
}

export interface FooterProps {
  companyName?: string
  notice?: string
  year?: number
  links?: FooterLink[]
}
