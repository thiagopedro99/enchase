import { Button, ToastProvider, useToast } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const Launcher = () => {
  const toast = useToast()

  return <Button onClick={() => toast.info('Alterações salvas')}>Mostrar notificação</Button>
}

const meta = {
  title: 'System/ToastProvider',
  component: ToastProvider,
  args: { children: undefined },
  argTypes: {
    children: { description: 'A aplicação. Os componentes dentro dela usam useToast para abrir notificações.', control: false },
    animation: {
      description: 'Movimento de entrada e saída das notificações, que deslizam da direita com uma mola curta. false desliga; { recipe, from, tuning } ajusta a receita, o lado e a duração.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, from, tuning }' }, defaultValue: { summary: 'slide' } }
    },
    className: {
      description: 'Classe da região de notificações (data-slot="toast-viewport"), que vence a da biblioteca.',
      control: 'text'
    },
    style: { description: 'Estilo da região de notificações.', control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'Guarda a fila de notificações e a região onde elas aparecem (role="region", com aria-live). Os métodos success, error, warning e info de useToast abrem as notificações.'
      }
    }
  },
  render: (args) => (
    <ToastProvider {...args}>
      <Launcher />
    </ToastProvider>
  )
} satisfies Meta<typeof ToastProvider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithoutMotion: Story = {
  args: { animation: false }
}
