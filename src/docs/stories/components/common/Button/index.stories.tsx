import { Button } from 'enchase'
import { defaultDisabled, defaultFullWidth, defaultRecipe, defaultSize, defaultVariant, motionLabels, toAnimation } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ButtonStoryArgs } from './types.ts'

const meta = {
  title: 'Componentes/Button',
  component: Button,
  args: {
    children: 'Enviar',
    variant: defaultVariant,
    size: defaultSize,
    fullWidth: defaultFullWidth,
    disabled: defaultDisabled,
    motionRecipe: 'default'
  },
  parameters: {
    docs: {
      description: {
        component: 'Botão com quatro variantes e três tamanhos, e feedback de toque feito só com CSS. É um `<button>` de verdade e aceita os atributos dele.'
      }
    }
  },
  argTypes: {
    variant: {
      description: 'Estilo visual do botão.',
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      table: { defaultValue: { summary: defaultVariant } }
    },
    size: {
      description: 'Tamanho do botão.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: defaultSize } }
    },
    fullWidth: {
      description: 'Ocupa toda a largura disponível.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultFullWidth) } }
    },
    disabled: {
      description: 'Desativa o botão e bloqueia o clique.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultDisabled) } }
    },
    animation: {
      description: 'Receita de motion do botão, feita só com CSS. Use false para desligar a animação, ou { recipe, tuning } com press (escala ao pressionar) ou lift (sobe ao passar o mouse); outras receitas são ignoradas. A duração, a escala e a distância viram as variáveis --enchase-button-duration, --enchase-button-scale e --enchase-button-distance. Use os controles do grupo Motion para experimentar. O elemento raiz aceita className e style, e expõe data-slot="button".',
      control: false,
      table: { type: { summary: 'false | { recipe, from, tuning }' }, defaultValue: { summary: defaultRecipe } }
    },
    children: {
      description: 'Conteúdo do botão.',
      control: 'text'
    },
    motionRecipe: {
      name: 'Receita',
      description: 'Receita de motion aplicada ao botão.',
      control: 'select',
      options: Object.keys(motionLabels),
      labels: motionLabels,
      table: { category: 'Motion', defaultValue: { summary: motionLabels.default } }
    },
    motionDuration: {
      name: 'Duração (s)',
      description: 'Duração da animação em segundos, para press e lift. Vazio usa o valor da receita.',
      control: { type: 'number', min: 0, step: 0.01 },
      if: { arg: 'motionRecipe', neq: 'default' },
      table: { category: 'Motion' }
    },
    motionScale: {
      name: 'Escala',
      description: 'Escala do botão ao ser pressionado. Vazio usa o valor da receita.',
      control: { type: 'number', min: 0, max: 1, step: 0.01 },
      if: { arg: 'motionRecipe', eq: 'press' },
      table: { category: 'Motion' }
    },
    motionDistance: {
      name: 'Distância (px)',
      description: 'Quanto o botão sobe ao passar o mouse. Vazio usa o valor da receita.',
      control: { type: 'number', min: 0, step: 1 },
      if: { arg: 'motionRecipe', eq: 'lift' },
      table: { category: 'Motion' }
    }
  },
  render: ({ motionRecipe, motionDuration, motionScale, motionDistance, ...args }) => (
    <Button {...args} animation={toAnimation({ motionRecipe, motionDuration, motionScale, motionDistance })} />
  )
} satisfies Meta<ButtonStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
