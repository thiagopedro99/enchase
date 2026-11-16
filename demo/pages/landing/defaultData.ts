import { workbench } from 'enchase/styles/workbench'
import { shadcn } from 'enchase/styles/shadcn'

import type { ThemeInput, ThemeStyle } from 'enchase/theme'
import type { FooterProps, SidebarSection } from 'enchase'
import type { Look, LookStyle } from './types.ts'

export const landingPath = '/landing'

export const brand = 'Enchase'

export const version = '0.23'

export const installCommand = 'npm install enchase'

export const repositoryUrl = 'https://github.com/thiagopedro99/enchase'

export const packageUrl = 'https://www.npmjs.com/package/enchase'

export const stylingGuideUrl = `${repositoryUrl}/blob/main/STYLING.md`

export const changelogUrl = `${repositoryUrl}/blob/main/CHANGELOG.md`

export const docsUrl = import.meta.env.DEV ? 'http://localhost:6006' : '/docs/'

export const sectionIds = ['playground', 'recursos', 'estilizacao', 'faq']

export const defaultBrand = 'default'

export const defaultLook: Look = {
  style: 'enchase',
  brand: defaultBrand,
  shape: 'auto',
  compact: false
}

const styles: Record<LookStyle, ThemeStyle | undefined> = {
  enchase: undefined,
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
      { id: 'playground', label: 'Ao vivo', href: '#playground' },
      { id: 'recursos', label: 'Recursos', href: '#recursos' },
      { id: 'estilizacao', label: 'Estilização', href: '#estilizacao' },
      { id: 'faq', label: 'Perguntas', href: '#faq' },
      { id: 'docs', label: 'Documentação', href: docsUrl, native: true }
    ]
  }
]

export const footerProps: FooterProps = {
  companyName: brand,
  notice: 'Licença MIT.',
  links: [
    { label: 'Documentação', href: docsUrl },
    { label: 'GitHub', href: repositoryUrl },
    { label: 'npm', href: packageUrl },
    { label: 'Novidades', href: changelogUrl }
  ]
}
