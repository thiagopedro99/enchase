import { Button } from 'enchase'
import { PlusIcon } from 'enchase/icons'
import { defaultDisabled, defaultFullWidth, defaultIconOnly, defaultRecipe, defaultSize, defaultVariant, motionLabels, toAnimation } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ButtonStoryArgs } from './types.ts'
import type { CSSProperties } from 'react'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Send',
    variant: defaultVariant,
    size: defaultSize,
    fullWidth: defaultFullWidth,
    iconOnly: defaultIconOnly,
    disabled: defaultDisabled,
    motionRecipe: 'default'
  },
  parameters: {
    docs: {
      description: {
        component: 'A button with five variants and three sizes, and press feedback made with CSS only. It is a real `<button>` and accepts its attributes.'
      }
    }
  },
  argTypes: {
    variant: {
      description: 'Visual style of the button. `danger` is filled with the error color of the theme, for an action that deletes something or cannot be undone.',
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
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
    iconOnly: {
      description: 'Makes the button a square for a single icon: as wide as it is tall in every size, with the same padding on the four sides and the icon in the middle. There is no text to name it, so pass `aria-label`; without it a screen reader announces an empty button.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultIconOnly) } }
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

export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete project' },
  parameters: {
    docs: {
      description: {
        story: 'Filled with the error color of the theme and the text color made for it, for an action that deletes something or cannot be undone. It has the same hooks by state as the primary variant, and the `confirmVariant` of the `ConfirmModal` accepts it.'
      }
    }
  }
}

export const IconOnly: Story = {
  args: { iconOnly: true, variant: 'ghost', 'aria-label': 'Add item', children: <PlusIcon /> },
  parameters: {
    docs: {
      description: {
        story: 'A square for a single icon, in every size and variant. The icon is decorative and there is no text, so the button needs an `aria-label`.'
      }
    }
  }
}

export const CustomHooks: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'The corner of each size has its own hook, `--enchase-button-radius-sm`, `-md` and `-lg`, which falls back to `--enchase-button-radius` and then to the button role of the theme. The outline variant paints its background with `--enchase-button-background-outline`, transparent by default. The inline padding of the ghost variant has a hook for each size too, `--enchase-button-padding-inline-ghost-sm`, `-md` and `-lg`, which falls back to `--enchase-button-padding-inline-ghost` and then to the medium space of the theme. Here the hooks are set in the `style` of a wrapper: corners of 4, 6 and 8 px, a surface background and ghost buttons with a padding of 0.5, 1 and 1.5 rem.'
      }
    }
  },
  render: () => (
    <div
      style={
        {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: 'var(--enchase-color-surface-container)',
          '--enchase-button-radius-sm': '4px',
          '--enchase-button-radius-md': '6px',
          '--enchase-button-radius-lg': '8px',
          '--enchase-button-background-outline': 'var(--enchase-color-surface)',
          '--enchase-button-padding-inline-ghost-sm': '0.5rem',
          '--enchase-button-padding-inline-ghost-md': '1rem',
          '--enchase-button-padding-inline-ghost-lg': '1.5rem'
        } as CSSProperties
      }
    >
      <Button variant="outline" size="sm">
        Small
      </Button>
      <Button variant="outline" size="md">
        Medium
      </Button>
      <Button variant="outline" size="lg">
        Large
      </Button>
      <Button size="lg">Filled</Button>
      <Button variant="ghost" size="sm">
        Small ghost
      </Button>
      <Button variant="ghost" size="md">
        Medium ghost
      </Button>
      <Button variant="ghost" size="lg">
        Large ghost
      </Button>
    </div>
  )
}
