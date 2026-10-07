import type { FooterLink } from './types.ts'

export const defaultCompanyName = 'Enchase'

export const defaultNotice = 'Licença MIT.'

export const defaultLinks: FooterLink[] = []

export const getCurrentYear = () => new Date().getFullYear()
