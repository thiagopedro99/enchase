import { Preview } from './Preview.tsx'
import { defaultShape, shapes } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ShapeStoryArgs } from './types.ts'

const meta = {
  title: 'System/Shape',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: { shape: defaultShape, buttonRadius: '', controlRadius: '', cardRadius: '' },
  argTypes: {
    shape: {
      description: 'Preset da forma, passado em createTheme({ shape }): pill (o visual padrão, com botões em pílula), soft (cantos arredondados em todo o kit, botões e campos de 0.75rem) ou square (cantos quase retos). Muda só os raios; cores, fontes e movimento ficam como estão.',
      control: 'inline-radio',
      options: shapes
    },
    buttonRadius: {
      description: 'Raio dos botões, dos itens de menu, dos badges e dos botões de ícone (createTheme({ radius: { button } })), por cima do preset. Vazio usa o do preset. Aceita 0, rem, em, px ou %.',
      control: 'text'
    },
    controlRadius: {
      description: 'Raio dos campos (createTheme({ radius: { control } })), por cima do preset. Vazio usa o do preset.',
      control: 'text'
    },
    cardRadius: {
      description: 'Raio dos cartões (createTheme({ radius: { xl } })), por cima do preset. Vazio usa o do preset.',
      control: 'text'
    }
  },
  render: (args) => <Preview {...args} />
} satisfies Meta<ShapeStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Suave: Story = {
  args: { shape: 'soft' }
}

export const Quadrada: Story = {
  args: { shape: 'square' }
}

export const SoOsBotoesMudam: Story = {
  args: { buttonRadius: '0.5rem' }
}
