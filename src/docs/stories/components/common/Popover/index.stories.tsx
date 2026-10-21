import { useState } from 'react'
import { Button, Modal, Popover } from 'enchase'

import { defaultArrow, defaultCloseOnEsc, defaultCloseOnOutsideClick, defaultOffset, defaultPadding, defaultPlacement, defaultRole, placements } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'

const panel = (
  <div style={{ display: 'grid', gap: '0.5rem', inlineSize: '16rem' }}>
    <strong>Detalhes do pedido</strong>
    <span>Três itens, entrega prevista para sexta-feira.</span>
    <Button size="sm">Ver pedido</Button>
  </div>
)

const meta = {
  title: 'Componentes/Popover',
  component: Popover,
  args: {
    placement: defaultPlacement,
    offset: defaultOffset,
    padding: defaultPadding,
    role: defaultRole,
    arrow: defaultArrow,
    closeOnEsc: defaultCloseOnEsc,
    closeOnOutsideClick: defaultCloseOnOutsideClick,
    label: 'Detalhes do pedido',
    content: panel,
    children: <Button>Abrir detalhes</Button>
  },
  parameters: {
    docs: {
      description: {
        component: 'Painel flutuante ligado a um gatilho. A posição se ajusta sozinha perto da borda (inverte o lado, desliza e encolhe), o foco é gerenciado, e Esc ou um clique fora fecham.'
      }
    }
  },
  argTypes: {
    placement: {
      description: 'Lado e alinhamento em relação ao gatilho. start e end seguem a direção do UIProvider. Perto da borda o popover inverte o lado, desliza para caber e encolhe até o espaço disponível.',
      control: 'select',
      options: placements,
      table: { defaultValue: { summary: defaultPlacement } }
    },
    offset: {
      description: 'Distância em px entre o gatilho e o popover.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultOffset) } }
    },
    padding: {
      description: 'Margem em px até a borda da janela.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultPadding) } }
    },
    role: {
      description: 'Papel do conteúdo, que também vira aria-haspopup no gatilho. O padrão é dialog; menu não é suportado porque exige navegação própria por setas.',
      control: 'select',
      options: ['dialog', 'listbox', 'tree', 'grid'],
      table: { defaultValue: { summary: defaultRole } }
    },
    label: {
      description: 'Nome acessível do conteúdo (aria-label).',
      control: 'text'
    },
    arrow: {
      description: 'Mostra uma seta apontando para o gatilho. Quando a caixa tem borda (--enchase-popover-content-border-width), a seta leva a borda nos dois lados de fora.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultArrow) } }
    },
    closeOnEsc: {
      description: 'Esc fecha só a camada de cima e devolve o foco ao gatilho.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultCloseOnEsc) } }
    },
    closeOnOutsideClick: {
      description: 'Um clique fora fecha o popover sem tirar o foco de onde o clique caiu.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultCloseOnOutsideClick) } }
    },
    open: {
      description: 'Estado controlado. Sem ele, o componente guarda o próprio estado (defaultOpen e onOpenChange).',
      control: 'boolean'
    },
    defaultOpen: {
      description: 'Estado inicial quando o popover não é controlado.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    onOpenChange: {
      description: 'Chamado com o novo estado quando o usuário abre ou fecha: clique no gatilho, Esc ou clique fora. Combine com open para controlar de fora.',
      control: false
    },
    animation: {
      description: 'false desliga a transição. { recipe: "fade" } troca o pop por um fade; { tuning: { duration, scale } } ajusta duração e escala.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    },
    className: {
      description: 'Classe do elemento que envolve o gatilho (data-slot="popover-trigger").',
      control: 'text'
    },
    contentClassName: {
      description: 'Classe do conteúdo (data-slot="popover-content"), a caixa que leva o fundo, a borda, a sombra e a seta. O que rola e leva o espaçamento é o corpo (data-slot="popover-body"). Também dá para estilizar por data-state e data-placement.',
      control: 'text'
    },
    children: {
      description: 'O gatilho: um clique nele abre e fecha o popover. Fica dentro de um span (data-slot="popover-trigger") e, sendo um elemento React, recebe aria-expanded, aria-controls e aria-haspopup.',
      control: false
    },
    content: {
      description: 'Conteúdo do popover. Renderiza em um portal no body, só enquanto o popover está aberto e durante a saída.',
      control: false
    },
    style: { description: 'Estilo do elemento que envolve o gatilho.', control: false },
    contentStyle: { description: 'Estilo do conteúdo.', control: false }
  }
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithArrow: Story = {
  args: { arrow: true }
}

export const Placements: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1.5rem', padding: '8rem 4rem', flexWrap: 'wrap' }}>
      {(['top', 'bottom', 'start', 'end'] as const).map((placement) => (
        <Popover key={placement} {...args} placement={placement}>
          <Button variant="outline">{placement}</Button>
        </Popover>
      ))}
    </div>
  )
}

const ModalDemo = (args: ComponentProps<typeof Popover>) => {
  const [open, setOpen] = useState(true)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Modal com popover">
        <Popover {...args}>
          <Button variant="outline">Abrir popover</Button>
        </Popover>
      </Modal>
    </>
  )
}

export const OverAModal: Story = {
  render: (args) => <ModalDemo {...args} />
}

export const NoAnimation: Story = {
  args: { animation: false }
}
