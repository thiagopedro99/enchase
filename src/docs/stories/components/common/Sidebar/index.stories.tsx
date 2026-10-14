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
    variant: {
      description: 'permanent fica na página; modal vira um drawer com foco preso, página inerte e Esc para fechar, que só fecha a camada de cima.',
      control: 'inline-radio',
      options: ['permanent', 'modal'],
      table: { defaultValue: { summary: 'permanent' } }
    },
    collapsed: {
      description: 'Barra de ícones (80px) em vez da barra completa. A largura muda de uma vez, sem animação.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    animation: {
      description: 'Só vale para o drawer. false desliga o deslize; { tuning: { distance, duration } } ajusta a distância e a duração.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, from, tuning }' } }
    },
    className: {
      description: 'Classe da raiz (data-slot="sidebar"); no drawer, do painel (data-slot="sidebar-panel"). Também dá para estilizar por data-slot, data-state e data-variant.',
      control: 'text'
    },
    sections: { control: false },
    header: { control: false },
    footer: { control: false },
    style: { control: false }
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
