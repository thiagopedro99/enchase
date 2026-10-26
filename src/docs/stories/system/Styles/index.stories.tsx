import { Preview } from './Preview.tsx'
import { defaultStyle, placementLabels, placements, shapeLabels, shapes, styles } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StyleStoryArgs } from './types.ts'

const meta = {
  title: 'System/Styles',
  tags: ['!autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'The `style` of `createTheme` (and of the `theme` prop of the `ColorModeProvider`) changes the look of the whole kit: the palette, the radii, the heights, the font weights, the borders, the shadows and the placement of the field label. Each style is an object that you import from its own entry, `enchase/styles/<name>` (`import { shadcn } from \'enchase/styles/shadcn\'`), and pass in `createTheme({ style: shadcn })`: only whoever imports a style gets its data. `enchase` is the usual look; `shadcn` brings the kit closer to shadcn/ui, without giving up the contrast of the library. What you pass in `brand`, `shape`, `radius`, `fonts`, `motion`, `light` and `dark` wins over the style. The Style item of the Storybook toolbar switches the style of all the stories.'
      }
    }
  },
  args: { style: defaultStyle, brand: '', shape: '', labelPlacement: '' },
  argTypes: {
    style: {
      description: 'Visual style, imported from `enchase/styles/<name>` and passed in `createTheme({ style })`: `enchase` (the default look, with no overrides) or `shadcn` (neutral palette, borders instead of shadows, 36px controls, 0.5rem corners, label above the field).',
      control: 'inline-radio',
      options: styles
    },
    brand: {
      description: 'Brand color (`createTheme({ brand })`), on top of the style. Empty uses the color of the style. With `shadcn`, only the accent changes: the neutrals stay. Accepts hex or `rgb()`.',
      control: 'text'
    },
    shape: {
      description: 'Shape of the corners (`createTheme({ shape })`), on top of the style. Empty uses the radii of the style.',
      control: { type: 'inline-radio', labels: shapeLabels },
      options: shapes
    },
    labelPlacement: {
      description: 'Where the field label goes (`labelPlacement` prop of the `Input`, the `NumberInput`, the `Select` and the `Textarea`), on top of the style. Empty uses the one of the style: `floating` in `enchase` and `stacked` in `shadcn`.',
      control: { type: 'inline-radio', labels: placementLabels },
      options: placements
    }
  },
  render: (args) => <Preview {...args} />
} satisfies Meta<StyleStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Shadcn: Story = {
  args: { style: 'shadcn' }
}

export const ShadcnWithBrand: Story = {
  args: { style: 'shadcn', brand: '#0b6bcb' }
}

export const ShadcnWithPillButtons: Story = {
  args: { style: 'shadcn', shape: 'pill' }
}

export const LabelAbove: Story = {
  args: { style: 'enchase', labelPlacement: 'stacked' }
}
