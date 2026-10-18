import { Checkbox } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Checkbox',
  component: Checkbox,
  args: {
    label: 'Aceito os termos',
    disabled: false
  },
  argTypes: {
    label: {
      description: 'Texto do rótulo. Clicar nele também marca a caixa.',
      control: 'text'
    },
    disabled: {
      description: 'Desativa a caixa e bloqueia a marcação.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    defaultChecked: {
      description: 'Estado inicial marcado, para uso sem controle externo. Veja a story Checked.',
      control: false
    },
    checked: {
      description: 'Estado marcado quando o componente é controlado. Exige também onChange.',
      control: false
    },
    wrapperClassName: {
      description: 'Classe da raiz (data-slot="checkbox"). className continua no input nativo (data-slot="checkbox-input").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Estilo da raiz (data-slot="checkbox"). style continua no input nativo.',
      control: false
    },
    animation: {
      description: 'Animação do traço de marcado, que cresce com um pop curto. false desliga; { tuning: { duration, scale } } ajusta a duração em segundos e a escala inicial.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    }
  }
} satisfies Meta<typeof Checkbox>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Checked: Story = {
  args: { defaultChecked: true }
}

export const Disabled: Story = {
  args: { disabled: true }
}

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true }
}
