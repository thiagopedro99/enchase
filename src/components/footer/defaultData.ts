import type { FooterLink } from './types.ts'

export const defaultCompanyName = ''

export const defaultNotice = ''

export const defaultLinks: FooterLink[] = []

export const getCurrentYear = () => new Date().getFullYear()
