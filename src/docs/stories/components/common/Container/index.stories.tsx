import { Container } from 'enchase'
import { asArgType } from '@docs/shared/argTypes.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const box = { background: 'var(--enchase-color-surface-container)', padding: '1rem', borderRadius: 'var(--enchase-radius-md)' }

const meta = {
  title: 'Components/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Limits the width of the content using the breakpoints of the `UIProvider`, with optional side spacing and centering. With `as`, the root becomes the right structure tag, such as `main` or `section`.'
      }
    }
  },
  args: {
    maxWidth: 'lg',
    padding: true,
    center: true,
    children: <div style={box}>Content limited by the maximum width</div>
  },
  argTypes: {
    as: asArgType,
    maxWidth: {
      description: 'Maximum width, taken from the breakpoints of the UIProvider (sm 576, md 768, lg 992, xl 1200, xxl 1400 px by default). full sets no limit. 2xl is still accepted as an alias of xxl.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl', 'xxl', 'full'],
      table: { defaultValue: { summary: 'lg' } }
    },
    padding: {
      description: 'true uses the default spacing on the sides, false removes it, and a CSS string sets the value (variable --enchase-container-padding).',
      control: 'text',
      table: { defaultValue: { summary: 'true' } }
    },
    center: {
      description: 'Centers the container. With false it stays at the start, and in RTL on the right side.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } }
    },
    className: { description: 'Class of the root (data-slot="container"), which wins over the default styles.', control: 'text' },
    style: { control: false }
  }
} satisfies Meta<typeof Container>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Narrow: Story = {
  args: { maxWidth: 'sm' }
}

export const FullWidth: Story = {
  args: { maxWidth: 'full', padding: '2rem' }
}

export const StartAligned: Story = {
  args: { maxWidth: 'md', center: false }
}

export const AsMain: Story = {
  args: { as: 'main', maxWidth: 'md' }
}
