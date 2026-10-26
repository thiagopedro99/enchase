import { Button } from 'enchase'
import { defaultDisabled, defaultFullWidth, defaultRecipe, defaultSize, defaultVariant, motionLabels, toAnimation } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ButtonStoryArgs } from './types.ts'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Send',
    variant: defaultVariant,
    size: defaultSize,
    fullWidth: defaultFullWidth,
    disabled: defaultDisabled,
    motionRecipe: 'default'
  },
  parameters: {
    docs: {
      description: {
        component: 'A button with four variants and three sizes, and press feedback made with CSS only. It is a real `<button>` and accepts its attributes.'
      }
    }
  },
  argTypes: {
    variant: {
      description: 'Visual style of the button.',
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      table: { defaultValue: { summary: defaultVariant } }
    },
    size: {
      description: 'Size of the button.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: defaultSize } }
    },
    fullWidth: {
      description: 'Takes up the full available width.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultFullWidth) } }
    },
    disabled: {
      description: 'Disables the button and blocks the click.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultDisabled) } }
    },
    animation: {
      description: 'Motion recipe of the button, made with CSS only. Use false to turn the animation off, or { recipe, tuning } with press (scales on press) or lift (rises on hover); other recipes are ignored. The duration, the scale and the distance become the variables --enchase-button-duration, --enchase-button-scale and --enchase-button-distance. Use the controls of the Motion group to experiment. The root element accepts className and style, and exposes data-slot="button".',
      control: false,
      table: { type: { summary: 'false | { recipe, from, tuning }' }, defaultValue: { summary: defaultRecipe } }
    },
    children: {
      description: 'Content of the button.',
      control: 'text'
    },
    motionRecipe: {
      name: 'Recipe',
      description: 'Motion recipe applied to the button.',
      control: 'select',
      options: Object.keys(motionLabels),
      labels: motionLabels,
      table: { category: 'Motion', defaultValue: { summary: motionLabels.default } }
    },
    motionDuration: {
      name: 'Duration (s)',
      description: 'Duration of the animation in seconds, for press and lift. Empty uses the value of the recipe.',
      control: { type: 'number', min: 0, step: 0.01 },
      if: { arg: 'motionRecipe', neq: 'default' },
      table: { category: 'Motion' }
    },
    motionScale: {
      name: 'Scale',
      description: 'Scale of the button when it is pressed. Empty uses the value of the recipe.',
      control: { type: 'number', min: 0, max: 1, step: 0.01 },
      if: { arg: 'motionRecipe', eq: 'press' },
      table: { category: 'Motion' }
    },
    motionDistance: {
      name: 'Distance (px)',
      description: 'How much the button rises on hover. Empty uses the value of the recipe.',
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
