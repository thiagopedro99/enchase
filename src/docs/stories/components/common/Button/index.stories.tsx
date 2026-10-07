import { defaultDisabled, defaultFullWidth, defaultRecipe, defaultSize, defaultVariant } from '@components/common/Button/defaultData.ts'
import { Button } from '@components/common/Button/index.tsx'
import { motionLabels, toAnimation } from './defaultData.ts'

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
      description: 'Receita de motion do botão. Use false para desligar a animação, ou { recipe, tuning } para trocar a receita e ajustar duração, escala e distância. Use os controles do grupo Motion para experimentar.',
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
