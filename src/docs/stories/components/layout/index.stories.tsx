import { useEffect } from 'react'
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

const vivid = 'linear-gradient(160deg, var(--enchase-color-primary), var(--enchase-color-error) 35%, var(--enchase-color-warning) 65%, var(--enchase-color-success))'

const cards = ['Primeiro', 'Segundo', 'Terceiro', 'Quarto', 'Quinto', 'Sexto']

const ScrolledContent = () => {
  useEffect(() => {
    window.scrollTo({ top: 140 })
  }, [])

  return (
    <div style={{ display: 'grid', gap: '1rem', padding: '1rem', borderRadius: 'var(--enchase-radius-lg)', background: vivid }}>
      {cards.map((name) => (
        <div key={name} style={{ minBlockSize: '8rem', padding: '1rem', borderRadius: 'var(--enchase-radius-lg)', backgroundColor: 'var(--enchase-color-surface)', color: 'var(--enchase-color-text-primary)' }}>
          <strong>{name} quadro</strong>
          <p style={{ margin: 0 }}>Role a página: a cor e as bordas que passam por baixo da barra do topo aparecem desfocadas.</p>
        </div>
      ))}
    </div>
  )
}

const meta = {
  title: 'Componentes/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Casca de página: barra superior com a trilha de navegação e o menu lateral (permanente ou drawer), ou uma `Navbar`; o conteúdo em `<main>` e o rodapé. Não traz navegação, marca nem rodapé próprios, e não altera `document.title`.'
      }
    }
  },
  args: {
    pageTitle: 'Componentes',
    brand: 'Enchase',
    navigationSections,
    children: <h1>Conteúdo da página</h1>
  },
  argTypes: {
    children: {
      description: 'Conteúdo da página. Fica em `<main id="main-content">`, dentro de um `Container`, e é o destino do link para pular ao conteúdo.',
      control: false
    },
    pageTitle: {
      description: 'Título da página. Entra na trilha de navegação quando nenhum item do menu corresponde à página atual. O Layout não altera document.title.',
      control: 'text'
    },
    navigation: {
      description: 'sidebar mostra a barra superior com o botão de menu e o menu lateral. navbar mostra a barra de navegação clássica no topo.',
      control: 'inline-radio',
      options: ['sidebar', 'navbar'],
      table: { defaultValue: { summary: 'sidebar' } }
    },
    translucent: {
      description:
        'Deixa a barra do topo semitransparente, com desfoque do conteúdo que rola por baixo: a `AppBar` com a navegação sidebar, ou a `Navbar` com a navegação navbar. O fundo e o desfoque vêm de `--enchase-app-bar-background` e `--enchase-app-bar-blur` na AppBar (padrão: a cor `--enchase-app-bar-background-solid`, que é a `surface` do tema, a `--enchase-app-bar-background-alpha`, 0,8, e `12px`) e de `--enchase-navbar-background` e `--enchase-navbar-blur` na Navbar (a `--enchase-navbar-background-solid`, que é a `surfaceContainer`, a `--enchase-navbar-background-alpha`). Com `prefers-reduced-transparency: reduce`, `prefers-contrast: more`, cores forçadas ou sem `backdrop-filter`, o fundo é opaco.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    breakpoint: {
      description: 'Breakpoint em que a sidebar deixa de ser um drawer e passa a ser permanente. Os valores vêm do UIProvider.',
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl'],
      table: { defaultValue: { summary: 'md' } }
    },
    maxWidth: { description: 'Largura máxima do conteúdo, tirada dos breakpoints.', control: 'select', options: ['sm', 'md', 'lg', 'xl', 'xxl', 'full'] },
    padding: {
      description: 'Espaçamento lateral do conteúdo, como no Container: true usa o padrão, false remove, e um texto CSS define o valor.',
      control: 'text'
    },
    centered: { description: 'Centraliza o conteúdo na vertical.', control: 'boolean' },
    hideNavbar: { description: 'Esconde a navegação (a barra superior, a sidebar e a navbar).', control: 'boolean' },
    hideFooter: { description: 'Esconde o rodapé.', control: 'boolean' },
    brand: {
      description: 'Nome da marca. No topo da sidebar é um link para a raiz, com a inicial do nome no lugar da imagem; com navigation="navbar" vira o logo da Navbar.',
      control: 'text'
    },
    brandLogo: {
      description: 'URL de uma imagem para a marca da sidebar, no lugar da inicial do nome. A imagem é decorativa, e o nome continua como texto.',
      control: 'text'
    },
    footerProps: { description: 'companyName, notice, year e links do rodapé.', control: 'object' },
    sidebarFooter: {
      description: 'Conteúdo fixo no rodapé da sidebar, acima do botão de recolher. Pode ser uma função que recebe { collapsed }.',
      control: false
    },
    navigationSections: {
      description: 'Seções do menu principal, como em Sidebar: [{ id, title?, items: [{ id, label, href?, native?, icon?, badge?, onClick? }] }].',
      control: false
    },
    pageSections: { description: 'Seções de âncora acrescentadas ao menu.', control: false },
    activePageSectionId: {
      description: 'Id do item de âncora que está na tela (use useScrollSpy): fica marcado no menu (aria-current="location") e vira o último item da trilha.',
      control: 'text'
    },
    breadcrumbs: { description: 'Trilha explícita. Sem ela o Layout deriva a trilha do menu e da página atual.', control: false },
    collapsed: {
      description: 'Sidebar recolhida, controlada de fora junto com onCollapsedChange. Sem ela o estado é interno (defaultCollapsed) e pode ser guardado com storageKey.',
      control: 'boolean'
    },
    defaultCollapsed: { description: 'Estado inicial da sidebar recolhida. collapsed e onCollapsedChange controlam de fora.', control: 'boolean' },
    onCollapsedChange: { description: 'Chamado com o novo valor quando a sidebar é recolhida ou expandida.', control: false },
    storageKey: { description: 'Guarda o estado recolhido no localStorage com esse nome, lido só depois de montar. Ignorado quando collapsed é controlado.', control: 'text' },
    open: {
      description: 'Drawer do menu em telas estreitas (abaixo do breakpoint), controlado de fora junto com onOpenChange. Sem ele o estado é interno (defaultOpen).',
      control: 'boolean'
    },
    defaultOpen: { description: 'Estado inicial do drawer quando ele não é controlado.', control: 'boolean' },
    onOpenChange: { description: 'Chamado com o novo valor quando o drawer abre ou fecha.', control: false },
    className: { description: 'Classe da raiz (data-slot="layout").', control: 'text' },
    style: { description: 'Estilo da raiz.', control: false }
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

export const TranslucentSidebar: Story = {
  args: { translucent: true, children: <ScrolledContent /> },
  parameters: { docs: { story: { inline: false, iframeHeight: 520 }, description: { story: 'A `AppBar` translúcida com a navegação sidebar: a página já está rolada, e a cor que passa por baixo da barra aparece desfocada.' } } }
}

export const TranslucentNavbar: Story = {
  args: { navigation: 'navbar', translucent: true, children: <ScrolledContent /> },
  parameters: { docs: { story: { inline: false, iframeHeight: 520 }, description: { story: 'A `Navbar` translúcida com a navegação navbar. A barra fica fixa no topo enquanto a página rola.' } } }
}
