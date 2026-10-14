import { Button, Tooltip } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Tooltip',
  component: Tooltip,
  args: {
    text: 'Salvar alterações',
    position: 'top',
    describe: true,
    openDelay: 0,
    closeDelay: 120,
    children: <Button>Salvar</Button>
  },
  argTypes: {
    text: {
      description: 'Texto da dica. Com describe ligado, ele também vira a descrição acessível do gatilho.',
      control: 'text'
    },
    position: {
      description: 'Lado do gatilho onde a dica aparece. start e end seguem a direção do UIProvider (esquerda e direita em ltr, o inverso em rtl). Perto da borda da tela a dica inverte o lado e se desloca para caber.',
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'start', 'end'],
      table: { defaultValue: { summary: 'top' } }
    },
    describe: {
      description: 'Liga a descrição acessível do gatilho. Desligue quando o gatilho já tem o mesmo texto como nome, como um botão só com ícone.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } }
    },
    openDelay: {
      description: 'Milissegundos entre entrar no gatilho e mostrar a dica.',
      control: 'number',
      table: { defaultValue: { summary: '0' } }
    },
    closeDelay: {
      description: 'Milissegundos entre sair do gatilho e esconder a dica. Mover o ponteiro para a própria dica mantém ela aberta.',
      control: 'number',
      table: { defaultValue: { summary: '120' } }
    },
    animation: {
      description: 'false desliga a transição. { recipe: "pop" } acrescenta uma escala leve; { tuning: { duration } } muda a duração em segundos.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'fade' } }
    },
    className: {
      description: 'Classe do elemento que envolve o gatilho (data-slot="tooltip-trigger").',
      control: 'text'
    },
    bubbleClassName: {
      description: 'Classe da dica (data-slot="tooltip-bubble"). Também dá para estilizar por data-slot, data-position e data-state.',
      control: 'text'
    },
    children: { control: false },
    style: { control: false },
    bubbleStyle: { control: false }
  }
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Positions: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1.5rem', padding: '3rem 4rem', flexWrap: 'wrap' }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((position) => (
        <Tooltip key={position} {...args} position={position} text={`Lado ${position}`}>
          <Button variant="outline">{position}</Button>
        </Tooltip>
      ))}
    </div>
  )
}

export const IconOnly: Story = {
  args: { text: 'Fechar', describe: false, children: <Button variant="ghost" aria-label="Fechar">×</Button> }
}

export const WithDelay: Story = {
  args: { openDelay: 400, closeDelay: 200 }
}

export const NoAnimation: Story = {
  args: { animation: false }
}
