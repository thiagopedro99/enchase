import { Button, useToast } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ToastType } from 'enchase'

type ToastStoryArgs = {
  type: ToastType
  duration: number
  message: string
}

const Launcher = ({ type, duration, message }: ToastStoryArgs) => {
  const toast = useToast()

  return <Button onClick={() => toast[type](message, duration)}>Mostrar notificação</Button>
}

const meta = {
  title: 'Components/Toast',
  component: Launcher,
  args: {
    type: 'success',
    duration: 3000,
    message: 'Alterações salvas'
  },
  argTypes: {
    type: {
      description: 'Tipo da notificação: define a cor e o ícone. Só error usa role="alert"; os demais são anunciados pela região de notificações.',
      control: 'inline-radio',
      options: ['success', 'error', 'warning', 'info']
    },
    duration: {
      description: 'Milissegundos até a notificação fechar sozinha. 0 mantém aberta até o usuário fechar. A contagem pausa com o ponteiro ou o foco dentro dela.',
      control: 'number',
      table: { defaultValue: { summary: '3000' } }
    },
    message: {
      description: 'Texto da notificação.',
      control: 'text'
    }
  }
} satisfies Meta<typeof Launcher>

export default meta

type Story = StoryObj<typeof meta>

export const Padrao: Story = {}

export const Erro: Story = {
  args: { type: 'error', message: 'Não foi possível salvar' }
}

export const Fixa: Story = {
  args: { type: 'info', duration: 0, message: 'Esta notificação só fecha quando você pedir' }
}
