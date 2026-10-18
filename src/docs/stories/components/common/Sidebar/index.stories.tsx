import { useState } from 'react'
import { Button, Icon, Sidebar } from 'enchase'

import type { ComponentProps } from 'react'
import type { SidebarSection } from 'enchase'
import type { Meta, StoryObj } from '@storybook/react-vite'

const sections: SidebarSection[] = [
  {
    id: 'app',
    title: 'Aplicação',
    items: [
      {
        id: 'home',
        label: 'Início',
        icon: (
          <Icon name="home">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
            <path d="M10 20v-6h4v6" />
          </Icon>
        ),
        href: '/'
      },
      { id: 'components', label: 'Componentes', href: '/components', badge: 'Novo' }
    ]
  },
  { id: 'guide', title: 'Nesta página', items: [{ id: 'usage', label: 'Uso', href: '#uso' }] }
]

const meta = {
  title: 'Componentes/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  args: { sections, variant: 'permanent', collapsed: false },
  argTypes: {
    sections: {
      description: 'Seções do menu, como [{ id, title?, items: [{ id, label, icon?, href?, native?, badge?, onClick? }] }]. Um item com href é um link; sem href é um botão que chama onClick. Sem icon, o item mostra a inicial do rótulo.',
      control: false
    },
    activeSectionId: {
      description: 'Id do item de âncora (href que começa com #, ou aponta para a página atual) marcado como localização atual (aria-current="location"). Use useScrollSpy para obtê-lo.',
      control: 'text'
    },
    currentHref: {
      description: 'Caminho atual, que marca o item da página (aria-current="page") e vale também para o hash da página atual. Sem ele vale o currentHref do UIProvider.',
      control: 'text'
    },
    header: {
      description: 'Conteúdo fixo no topo, como a marca. Pode ser uma função que recebe { collapsed } para trocar o conteúdo na barra recolhida.',
      control: false
    },
    footer: {
      description: 'Conteúdo fixo no rodapé, acima do botão de recolher. Pode ser uma função que recebe { collapsed }.',
      control: false
    },
    variant: {
      description: 'permanent fica na página; modal vira um drawer com foco preso, página inerte e Esc para fechar, que só fecha a camada de cima.',
      control: 'inline-radio',
      options: ['permanent', 'modal'],
      table: { defaultValue: { summary: 'permanent' } }
    },
    collapsed: {
      description: 'Barra só de ícones (80px) em vez da completa. A largura anima por data-state (expanded, collapsing, collapsed e expanding); com animation={false} muda de uma vez. Só vale em permanent.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    onToggleCollapsed: {
      description: 'Mostra o botão de recolher no rodapé e é chamado ao clicar nele. Sem esta prop o botão não aparece; quem usa guarda o estado de collapsed.',
      control: false
    },
    open: {
      description: 'Só em modal: abre o drawer. Fechado, nada é renderizado.',
      control: 'boolean'
    },
    onClose: {
      description: 'Só em modal: chamado ao clicar no fundo, apertar Esc ou escolher um item.',
      control: false
    },
    ariaLabel: {
      description: 'Nome acessível da navegação. O padrão vem do UIProvider: labels.mainNavigation em permanent e labels.mobileNavigation em modal.',
      control: 'text'
    },
    id: {
      description: 'id da raiz em permanent ou do painel em modal, útil para o aria-controls do botão que abre o menu.',
      control: 'text'
    },
    animation: {
      description: 'false desliga o movimento. Em permanent ajusta o recolher ({ tuning: { duration } }); em modal, o deslize do drawer ({ tuning: { distance, duration } }).',
      control: 'object',
      table: { type: { summary: 'false | { recipe, from, tuning }' } }
    },
    className: {
      description: 'Classe da raiz (data-slot="sidebar"); no drawer, do painel (data-slot="sidebar-panel"). Também dá para estilizar por data-slot, data-state e data-variant.',
      control: 'text'
    },
    style: { description: 'Estilo da raiz em permanent ou do painel em modal.', control: false }
  }
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

type SidebarProps = ComponentProps<typeof Sidebar>

const PermanentDemo = (args: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: 360 }}>
      <Sidebar {...args} variant="permanent" collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} header={<strong>Enchase</strong>} />
    </div>
  )
}

const DrawerDemo = (args: SidebarProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir menu</Button>
      <Sidebar {...args} variant="modal" open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export const Permanente: Story = {
  render: (args) => <PermanentDemo {...args} />
}

export const Drawer: Story = {
  render: (args) => <DrawerDemo {...args} />
}
