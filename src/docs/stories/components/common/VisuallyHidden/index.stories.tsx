import { Button, VisuallyHidden } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  args: { children: 'Texto só para leitores de tela' },
  argTypes: {
    className: { description: 'Classe do elemento (data-slot="visually-hidden").', control: 'text' },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'Esconde o texto da tela mas o mantém na árvore de acessibilidade. Serve para dar nome a controles que só têm ícone.'
      }
    }
  }
} satisfies Meta<typeof VisuallyHidden>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const NamedIconButton: Story = {
  render: () => (
    <Button variant="outline">
      <span aria-hidden="true">+</span>
      <VisuallyHidden>Adicionar item</VisuallyHidden>
    </Button>
  )
}
