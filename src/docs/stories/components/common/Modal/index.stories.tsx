import { useState } from 'react'
import { Button, ConfirmModal, Modal } from 'enchase'

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

type ModalDemoProps = ComponentProps<typeof Modal> & { label: string }

const ModalDemo = ({ label, ...args }: ModalDemoProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}

const ConfirmDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Excluir item
      </Button>
      <ConfirmModal isOpen={open} onClose={() => setOpen(false)} onConfirm={() => undefined} message="Esta ação não pode ser desfeita." />
    </>
  )
}

const meta = {
  title: 'Componentes/Modal',
  component: Modal,
  args: {
    isOpen: false,
    onClose: () => undefined,
    title: 'Editar perfil',
    children: 'O foco fica preso no painel, a página atrás fica inerte e Esc devolve o foco ao botão.',
    size: 'md',
    showCloseButton: true,
    closeOnOverlayClick: true,
    closeOnEsc: true
  },
  argTypes: {
    title: { description: 'Título do diálogo. Sem ele, use ariaLabel.', control: 'text' },
    size: {
      description: 'Largura máxima do painel.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      table: { defaultValue: { summary: 'md' } }
    },
    showCloseButton: { description: 'Mostra o botão de fechar no cabeçalho.', control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    closeOnOverlayClick: { description: 'Fecha ao clicar no fundo.', control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    closeOnEsc: { description: 'Fecha com Esc. Com modais empilhados, só o de cima fecha.', control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    className: { description: 'Classe do painel. Vence a da biblioteca sem !important.', control: false },
    animation: { description: 'false desliga o movimento; { recipe, tuning } ajusta a duração, a distância e a escala.', control: false },
    isOpen: { control: false },
    onClose: { control: false },
    children: { control: 'text' },
    footer: { control: false }
  }
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => <ModalDemo {...args} label="Abrir modal" footer={<Button>Salvar</Button>} />
}

export const Confirmation: Story = {
  render: () => <ConfirmDemo />
}

export const WithoutMotion: Story = {
  render: (args) => <ModalDemo {...args} label="Abrir sem animação" animation={false} />
}
