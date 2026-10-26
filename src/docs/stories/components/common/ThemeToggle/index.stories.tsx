import { ThemeToggle } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    docs: {
      description: {
        component: 'A button that toggles between the light and the dark mode, with the icon swapping by crossfade. It needs a `ColorModeProvider`.'
      }
    }
  },
  argTypes: {
    animation: {
      description: 'false turns off the press feedback; { recipe } adjusts it. The icon swaps by a CSS crossfade in up to 150 ms.',
      control: false
    },
    className: {
      description: 'Class of whoever uses the library, applied to the button after the class of the library.',
      control: false
    }
  }
} satisfies Meta<typeof ThemeToggle>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithoutPressFeedback: Story = {
  args: { animation: false }
}
