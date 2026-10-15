import { Layout } from 'enchase'

import type { SidebarSection } from 'enchase'
import type { Meta, StoryObj } from '@storybook/react-vite'

const navigationSections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Aplicação',
    items: [
      { id: 'home', label: 'Início', href: '/' },
      { id: 'components', label: 'Componentes', href: '/components' },
      { id: 'docs', label: 'Documentação', href: '/docs' }
    ]
  }
]

const pageSections: SidebarSection[] = [
  { id: 'guide', title: 'Nesta página', items: [{ id: 'usage', label: 'Uso', href: '#uso' }, { id: 'api', label: 'API', href: '#api' }] }
]

const meta = {
  title: 'Componentes/Layout',
  component: Layout,
  parameters: { layout: 'fullscreen' },
  args: {
    pageTitle: 'Componentes',
    brand: 'Enchase',
    navigationSections,
    children: <h1>Conteúdo da página</h1>
  },
  argTypes: {
    navigation: {
      description: 'sidebar mostra a barra superior com o botão de menu e o menu lateral. navbar mostra a barra de navegação clássica no topo.',
      control: 'inline-radio',
      options: ['sidebar', 'navbar'],
      table: { defaultValue: { summary: 'sidebar' } }
    },
    breakpoint: {
      description: 'Breakpoint em que a sidebar deixa de ser um drawer e passa a ser permanente. Os valores vêm do UIProvider.',
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl'],
      table: { defaultValue: { summary: 'md' } }
    },
    maxWidth: { description: 'Largura máxima do conteúdo, tirada dos breakpoints.', control: 'select', options: ['sm', 'md', 'lg', 'xl', 'xxl', 'full'] },
    centered: { description: 'Centraliza o conteúdo na vertical.', control: 'boolean' },
    hideNavbar: { description: 'Esconde a navegação.', control: 'boolean' },
    hideFooter: { description: 'Esconde o rodapé.', control: 'boolean' },
    defaultCollapsed: { description: 'Estado inicial da sidebar recolhida. collapsed e onCollapsedChange controlam de fora.', control: 'boolean' },
    storageKey: { description: 'Guarda o estado recolhido no localStorage com esse nome, lido só depois de montar.', control: 'text' },
    breadcrumbs: { description: 'Trilha explícita. Sem ela o Layout deriva a trilha do menu e da página atual.', control: false },
    pageSections: { description: 'Seções de âncora acrescentadas ao menu.', control: false },
    sidebarFooter: { control: false },
    footerProps: { description: 'companyName, notice, year e links do rodapé.', control: 'object' },
    className: { description: 'Classe da raiz (data-slot="layout").', control: 'text' },
    style: { control: false }
  }
} satisfies Meta<typeof Layout>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithNavbar: Story = {
  args: { navigation: 'navbar' }
}

export const CollapsedSidebar: Story = {
  args: { defaultCollapsed: true }
}

export const WithPageSections: Story = {
  args: { pageSections, activePageSectionId: 'usage' }
}

export const WithFooter: Story = {
  args: { footerProps: { companyName: 'Enchase', notice: 'Licença MIT.' } }
}
