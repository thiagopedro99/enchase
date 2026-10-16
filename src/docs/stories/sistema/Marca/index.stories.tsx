import { Preview } from './Preview.tsx'
import { brandPresets, defaultBrand } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { BrandStoryArgs } from './types.ts'

const meta = {
  title: 'Sistema/Marca',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: { brand: defaultBrand },
  argTypes: {
    brand: {
      description: 'Cor da marca (hex ou rgb(), opaca), passada em createTheme({ brand }). O primary claro é essa cor quando ela passa nos contrastes do tema; senão, a mesma cor, mais escura. Troque o tema na barra para ver o escuro.',
      control: { type: 'color', presetColors: brandPresets }
    }
  },
  render: (args) => <Preview brand={args.brand} />
} satisfies Meta<BrandStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const MarcaClara: Story = {
  args: { brand: '#FFD400' }
}

export const MarcaVibrante: Story = {
  args: { brand: '#E11D48' }
}

export const Cinza: Story = {
  args: { brand: '#808080' }
}
