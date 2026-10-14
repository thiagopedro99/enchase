import { ThemeToggle } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/ThemeToggle',
  component: ThemeToggle,
  argTypes: {
    animation: {
      description: 'false desliga o feedback de toque; { recipe } ajusta. O ícone troca por crossfade de CSS em até 150 ms.',
      control: false
    },
    className: {
      description: 'Classe do usuário, aplicada no botão depois da classe da biblioteca.',
      control: false
    }
  }
} satisfies Meta<typeof ThemeToggle>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithoutPressFeedback: Story = {
  args: { animation: false }
}
