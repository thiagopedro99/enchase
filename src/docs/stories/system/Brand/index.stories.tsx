import { Preview } from './Preview.tsx'
import { brandPresets, defaultBrand } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { BrandStoryArgs } from './types.ts'

const meta = {
  title: 'System/Brand',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: { brand: defaultBrand },
  argTypes: {
    brand: {
      description: 'Brand color (hex or `rgb()`, opaque), passed in `createTheme({ brand })`. The light `primary` is that color when it passes the contrast checks of the theme; otherwise, the same color, darker. Switch the theme in the toolbar to see the dark one.',
      control: { type: 'color', presetColors: brandPresets }
    }
  },
  render: (args) => <Preview brand={args.brand} />
} satisfies Meta<BrandStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const LightBrand: Story = {
  args: { brand: '#FFD400' }
}

export const VibrantBrand: Story = {
  args: { brand: '#E11D48' }
}

export const Gray: Story = {
  args: { brand: '#808080' }
}
