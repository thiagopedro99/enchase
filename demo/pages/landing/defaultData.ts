import { workbench } from 'enchase/styles/workbench'
import { material2 } from 'enchase/styles/material2'
import { material3 } from 'enchase/styles/material3'
import { shadcn } from 'enchase/styles/shadcn'

import { pageLinks, repositoryUrl } from '../../defaultData.ts'

import type { ThemeInput, ThemeStyle } from 'enchase/theme'
import type { Look, LookStyle } from './types.ts'
import type { SidebarSection } from 'enchase'

export const version = '0.25'

export const installCommand = 'npm install enchase'

export const stylingGuideUrl = `${repositoryUrl}/blob/main/STYLING.md`

export const sectionIds = ['recursos', 'playground', 'codigo', 'faq']

export const defaultBrand = 'default'

export const brands = [
  { value: defaultBrand, label: 'A do estilo' },
  { value: '#0F766E', label: 'Verde' },
  { value: '#BE123C', label: 'Carmim' },
  { value: '#B45309', label: 'Âmbar' },
  { value: '#7C3AED', label: 'Violeta' }
]

export const defaultLook: Look = {
  style: 'shadcn',
  brand: defaultBrand,
  shape: 'auto',
  compact: false
}

const styles: Record<LookStyle, ThemeStyle | undefined> = {
  enchase: undefined,
  material2,
  material3,
  shadcn,
  workbench
}

export const themeOf = ({ style, brand: color, shape }: Look): ThemeInput => ({
  ...(styles[style] ? { style: styles[style] } : {}),
  ...(color === defaultBrand ? {} : { brand: color }),
  ...(shape === 'auto' ? {} : { shape })
})

export const navigationSections: SidebarSection[] = [
  {
    id: 'landing',
    items: [
      { id: 'recursos', label: 'Recursos', href: '#recursos' },
      { id: 'playground', label: 'Ao vivo', href: '#playground' },
      ...pageLinks
    ]
  }
]
