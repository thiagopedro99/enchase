import { useState } from 'react'
import { Badge, Button, Input, Tabs } from 'enchase'
import { defaultActivation, manySections, sections } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const items = sections.map(({ value, label, text }) => ({ value, label, content: <p style={{ margin: 0 }}>{text}</p> }))

const ControlledDemo = () => {
  const [tab, setTab] = useState('billing')

  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(32rem, 100%)' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {sections.map(({ value, label }) => (
          <Button key={value} size="sm" variant={tab === value ? 'primary' : 'outline'} onClick={() => setTab(value)}>
            {label}
          </Button>
        ))}
      </div>
      <Tabs ariaLabel="Account sections" items={items} value={tab} onValueChange={setTab} />
    </div>
  )
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: {
    ariaLabel: 'Account sections',
    items,
    activation: defaultActivation
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A set of tabs that splits content into panels and shows one at a time. It follows the ARIA tabs pattern: `role="tablist"`, a single Tab stop on the selected tab, the arrow keys, Home and End to navigate, and each panel linked to its tab. An indicator slides to the selected tab, and the list scrolls horizontally when the tabs do not fit. The tabs are horizontal. It accepts a `ref`, which goes to the root, and the attributes of the `<div>`.'
      }
    }
  },
  argTypes: {
    items: {
      description:
        'Tabs of the list, in the order they appear on screen. Each item has `value` (unique), `label` (the content of the tab: text or nodes, such as a `span` and a `Badge`), `content` (the content of the panel) and, optionally, `disabled`. The `label` sits inside a `<button>`, so only text elements fit, with no other button, link or field, and everything in it is included in the name of the tab and of the panel. All panels stay in the document and only the panel of the selected tab is shown, so the others keep their state.',
      control: false
    },
    value: {
      description: 'Value of the selected tab when the component is controlled. It also requires onValueChange. See the Controlled story.',
      control: false
    },
    defaultValue: {
      description: 'Value of the tab that starts selected, for use without external control. Without it, the first tab that is not disabled is used.',
      control: 'text'
    },
    onValueChange: {
      description: 'Called with the value of the tab that the user has just selected, by click or by keyboard.',
      control: false
    },
    activation: {
      description: 'When a tab focused with the arrow keys becomes the selected one: automatic selects the tab as soon as it gets the focus; manual only moves the focus, and Enter or Space selects it. Prefer manual when the panel is slow to load.',
      control: 'inline-radio',
      options: ['automatic', 'manual'],
      table: { defaultValue: { summary: `'${defaultActivation}'` } }
    },
    ariaLabel: {
      description: 'Name of the list of tabs for screen readers. It does not appear on the screen: describe what the tabs organize, such as Account sections.',
      control: 'text'
    },
    animation: {
      description: 'Animation of the indicator, which slides to the selected tab, and of the panel, which appears with a fade. false turns it off; { tuning: { duration } } sets the duration in seconds.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'fade' } }
    }
  }
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: 'team' }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}

export const ManualActivation: Story = {
  args: { activation: 'manual' }
}

export const DisabledTab: Story = {
  args: { items: items.map((item) => (item.value === 'billing' ? { ...item, disabled: true } : item)) }
}

export const ManyTabs: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ inlineSize: 'min(24rem, 100%)' }}>
      <Tabs ariaLabel="Dashboard areas" items={manySections.map((label) => ({ value: label, label, content: <p style={{ margin: 0 }}>{label} content.</p> }))} />
    </div>
  )
}

export const KeepsState: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ inlineSize: 'min(28rem, 100%)' }}>
      <Tabs
        ariaLabel="Registration"
        items={[
          { value: 'form', label: 'Form', content: <Input label="Name" /> },
          { value: 'help', label: 'Help', content: <p style={{ margin: 0 }}>Type something in the form, switch tabs and come back: the text is still there.</p> }
        ]}
      />
    </div>
  )
}

export const WithNodesInLabel: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'The `label` accepts nodes, not only text: here the notifications tab holds a `Badge` with the count. The indicator follows the width of the whole tab, and the name of the tab is the text of everything in it ("Notifications 12").'
      }
    }
  },
  render: () => (
    <div style={{ inlineSize: 'min(32rem, 100%)' }}>
      <Tabs
        ariaLabel="Inbox"
        defaultValue="notifications"
        items={[
          { value: 'messages', label: 'Messages', content: <p style={{ margin: 0 }}>No new messages.</p> },
          {
            value: 'notifications',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Notifications</span>
                <Badge variant="primary" size="sm">
                  12
                </Badge>
              </span>
            ),
            content: <p style={{ margin: 0 }}>Twelve notifications to read.</p>
          }
        ]}
      />
    </div>
  )
}
