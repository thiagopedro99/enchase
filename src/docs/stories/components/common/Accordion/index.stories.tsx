import { useState } from 'react'
import { Accordion, Badge, Button } from 'enchase'
import { defaultHeadingLevel, defaultMultiple, faq } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const items = faq.map(({ value, title, text }) => ({ value, title, content: <p style={{ margin: 0 }}>{text}</p> }))

const company = (name: string, current = false) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
    <span
      aria-hidden="true"
      style={{ display: 'inline-grid', placeItems: 'center', inlineSize: '2rem', blockSize: '2rem', fontWeight: 600, borderRadius: 'var(--enchase-radius-md)', color: 'var(--enchase-color-on-primary-container)', background: 'var(--enchase-color-primary-container)' }}
    >
      {name[0]}
    </span>
    <span>{name}</span>
    {current && (
      <Badge variant="success" size="sm">
        Current
      </Badge>
    )}
  </span>
)

const experience = [
  { value: 'acme', title: company('Acme Labs', true), content: <p style={{ margin: 0 }}>Since 2023, on the platform team.</p> },
  { value: 'globex', title: company('Globex Corp.'), content: <p style={{ margin: 0 }}>From 2019 to 2022, on the product team.</p> },
  { value: 'initech', title: company('Initech'), content: <p style={{ margin: 0 }}>From 2016 to 2019, as a developer.</p> }
]

const ControlledDemo = () => {
  const [open, setOpen] = useState<string[]>(['returns'])

  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(36rem, 100%)' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button size="sm" variant="outline" onClick={() => setOpen(faq.map(({ value }) => value))}>
          Open all
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen([])}>
          Close all
        </Button>
      </div>
      <Accordion multiple items={items} value={open} onValueChange={setOpen} />
    </div>
  )
}

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  args: {
    items,
    multiple: defaultMultiple,
    headingLevel: defaultHeadingLevel
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A list of items that open and close to show one piece of content at a time, or several with `multiple`, as in frequently asked questions. It follows the ARIA accordion pattern: each item is a button with `aria-expanded` inside a heading (`<h3>` by default), and the panel is a region linked to the button. Tab moves through the buttons, Enter and Space open and close the item, and the arrow keys, Home and End move the focus. Closed panels stay in the document, so the content keeps its state. It accepts a `ref`, which goes to the root, and the attributes of the `<div>`.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 'min(36rem, 100%)' }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    items: {
      description:
        'Items of the accordion, in the order they appear on screen. Each item has `value` (unique), `title` (the content of the button: text or nodes, such as a logo, a `span` and a `Badge`), `content` (the content of the panel) and, optionally, `disabled`. The `title` sits inside a `<button>`, so only text elements fit, with no other button, link or field, and everything in it is included in the name of the button and of the panel. Closed panels stay in the document, so the content keeps its state.',
      control: false
    },
    multiple: {
      description: 'Lets several items stay open at the same time. Without it, opening an item closes the one that was open, and the open item can still be closed again.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultMultiple) } }
    },
    value: {
      description: 'Values of the open items when the component is controlled, as a list. It also requires onValueChange. See the Controlled story.',
      control: false
    },
    defaultValue: {
      description: 'Values of the items that start open, as a list, for use without external control. Without multiple, only the first one is used.',
      control: 'object'
    },
    onValueChange: {
      description: 'Called with the list of open items after each click.',
      control: false
    },
    headingLevel: {
      description: 'Level of the heading, from h2 to h6, that wraps the button of each item. Choose the level that continues the heading hierarchy of the page.',
      control: 'inline-radio',
      options: [2, 3, 4, 5, 6],
      table: { defaultValue: { summary: String(defaultHeadingLevel) } }
    },
    animation: {
      description: 'Animation of the panel, which appears with a fade and a small slide, and of the arrow, which rotates. The height does not animate. false turns it off; { tuning: { duration, distance } } sets the duration in seconds and the slide in pixels.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    }
  }
} satisfies Meta<typeof Accordion>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: ['returns'] }
}

export const Multiple: Story = {
  args: { multiple: true, defaultValue: ['shipping', 'payment'] }
}

export const DisabledItem: Story = {
  args: { items: items.map((item) => (item.value === 'payment' ? { ...item, disabled: true } : item)) }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}

export const WithNodesInTitle: Story = {
  args: { items: experience, defaultValue: ['acme'] },
  parameters: {
    docs: {
      description: {
        story: 'The `title` accepts nodes, not only text: here the company logo, the name and a `Badge` sit in the button, instead of going into the body of the panel. Use text elements (`span`, `Badge`, images): the title is inside a `<button>`. The name of the button and of the panel is the text of everything in it, so the decorative logo gets `aria-hidden` and the images get `alt=""`.'
      }
    }
  }
}
