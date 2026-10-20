import { BookOpenIcon, HomeIcon } from './exampleIcons.tsx'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'

export const brand = 'Enchase'

export const brandLogo = '/enchase-marca.svg'

export const footerProps = { companyName: 'Enchase', notice: 'Licença MIT.' }

export const docsUrl = 'http://localhost:6006'

export const demoSections: SidebarSection[] = [
  {
    id: 'navigation',
    title: 'Navegação',
    items: [
      { id: 'home', label: 'Início', icon: <HomeIcon />, href: '/' },
      { id: 'docs', label: 'Documentação', icon: <BookOpenIcon />, href: docsUrl, native: true }
    ]
  }
]
