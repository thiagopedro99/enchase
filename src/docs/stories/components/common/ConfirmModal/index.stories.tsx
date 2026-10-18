import { useState } from 'react'
import { Button, ConfirmModal } from 'enchase'

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

type ConfirmDemoProps = ComponentProps<typeof ConfirmModal> & { label: string }

const ConfirmDemo = ({ label, ...args }: ConfirmDemoProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ConfirmModal {...args} isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}

const meta = {
  title: 'Componentes/ConfirmModal',
  component: ConfirmModal,
  args: {
    isOpen: false,
    onClose: () => undefined,
    onConfirm: () => undefined,
    message: 'Esta ação não pode ser desfeita.',
    confirmVariant: 'primary'
  },
  argTypes: {
    isOpen: {
      description: 'Abre e fecha a confirmação. Como o Modal, ela é sempre controlada: quem usa guarda o estado e o muda em onClose.',
      control: false
    },
    onClose: {
      description: 'Chamado ao cancelar, ao fechar por Esc, pelo botão de fechar ou pelo fundo, e logo depois de onConfirm.',
      control: false
    },
    onConfirm: {
      description: 'Chamado ao clicar no botão de confirmar. O modal chama onClose em seguida, então não é preciso fechar aqui.',
      control: false
    },
    title: {
      description: 'Título da confirmação. Sem ele, usa o texto labels.confirmAction do UIProvider.',
      control: 'text'
    },
    message: {
      description: 'Texto da pergunta, no corpo do modal. O diálogo é um alertdialog e o corpo vira a descrição acessível.',
      control: 'text'
    },
    confirmText: {
      description: 'Texto do botão de confirmar. Sem ele, usa labels.confirm do UIProvider.',
      control: 'text'
    },
    cancelText: {
      description: 'Texto do botão de cancelar, que recebe o foco inicial. Sem ele, usa labels.cancel do UIProvider.',
      control: 'text'
    },
    confirmVariant: {
      description: 'Estilo do botão de confirmar, o mesmo do Button.',
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      table: { defaultValue: { summary: 'primary' } }
    },
    animation: {
      description: 'false desliga o movimento; { recipe, tuning } ajusta a duração, a distância e a escala, como no Modal.',
      control: false
    },
    className: {
      description: 'Classe do painel. Vence a da biblioteca sem !important.',
      control: false
    },
    style: {
      description: 'Estilo do painel, mesclado com o da biblioteca (o seu vence).',
      control: false
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Modal de confirmação pronto: um alertdialog com a pergunta e os botões de cancelar e confirmar. Use o Modal quando precisar de conteúdo próprio.'
      }
    }
  },
  render: (args) => <ConfirmDemo {...args} label="Excluir item" />
} satisfies Meta<typeof ConfirmModal>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const CustomTexts: Story = {
  args: { title: 'Excluir o projeto?', message: 'Todos os arquivos do projeto serão apagados.', confirmText: 'Excluir', cancelText: 'Manter' }
}
