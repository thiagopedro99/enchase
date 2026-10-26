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
      description: 'Shape preset, passed in `createTheme({ shape })`: `pill` (the default look, with pill buttons), `soft` (rounded corners across the whole kit, with buttons and fields at 0.75rem) or `square` (almost square corners). It changes only the radii; colors, fonts and motion stay as they are.',
      control: 'inline-radio',
      options: shapes
    },
    buttonRadius: {
      description: 'Radius of the buttons, the menu items, the badges and the icon buttons (`createTheme({ radius: { button } })`), on top of the preset. Empty uses the one of the preset. Accepts `0` or a value in `rem`, `em`, `px` or `%`.',
      control: 'text'
    },
    controlRadius: {
      description: 'Radius of the fields (`createTheme({ radius: { control } })`), on top of the preset. Empty uses the one of the preset.',
      control: 'text'
    },
    cardRadius: {
      description: 'Radius of the cards (`createTheme({ radius: { xl } })`), on top of the preset. Empty uses the one of the preset.',
      control: 'text'
    }
  },
  render: (args) => <Preview {...args} />
} satisfies Meta<ShapeStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Soft: Story = {
  args: { shape: 'soft' }
}

export const Square: Story = {
  args: { shape: 'square' }
}

export const OnlyTheButtonsChange: Story = {
  args: { buttonRadius: '0.5rem' }
}
