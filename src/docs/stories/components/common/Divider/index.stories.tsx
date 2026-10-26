import { Button, Divider, Flex } from 'enchase'
import { defaultDecorative, defaultOrientation } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Divider',
  component: Divider,
  args: {
    orientation: defaultOrientation,
    decorative: defaultDecorative
  },
  parameters: {
    docs: {
      description: {
        component: 'A thin line that separates sections of content or groups of controls. It is an `<hr>`, so assistive technology announces it as a separator, and `decorative` turns that off for a line that only adds to the look. A vertical divider stretches to the height of a flex row. It accepts the attributes of the `<hr>`.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 'min(28rem, 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', blockSize: '8rem' }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    orientation: {
      description: 'Direction of the line. A vertical divider is announced with `aria-orientation="vertical"` and stretches to the height of its parent when the parent is a flex container.',
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: `'${defaultOrientation}'` } }
    },
    decorative: {
      description: 'Hides the divider from assistive technology (`role="none"`). Use it when the line only adds to the look and the content already reads in order.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultDecorative) } }
    }
  }
} satisfies Meta<typeof Divider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const BetweenSections: Story = {
  parameters: { controls: { disable: true } },
  decorators: [(Story) => <div style={{ inlineSize: 'min(28rem, 100%)' }}><Story /></div>],
  render: (args) => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <section>
        <h3 style={{ margin: 0 }}>Shipping</h3>
        <p style={{ margin: 0 }}>We ship within two business days.</p>
      </section>
      <Divider {...args} orientation="horizontal" />
      <section>
        <h3 style={{ margin: 0 }}>Returns</h3>
        <p style={{ margin: 0 }}>Returns are accepted for thirty days.</p>
      </section>
    </div>
  )
}

export const InAToolbar: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Flex align="center" gap="0.5rem" style={{ blockSize: '2.5rem' }}>
      <Button size="sm" variant="ghost">
        Bold
      </Button>
      <Button size="sm" variant="ghost">
        Italic
      </Button>
      <Divider {...args} orientation="vertical" />
      <Button size="sm" variant="ghost">
        Link
      </Button>
    </Flex>
  )
}
