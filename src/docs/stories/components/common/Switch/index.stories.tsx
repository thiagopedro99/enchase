import { useState } from 'react'
import { Switch } from 'enchase'
import { settings } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [enabled, setEnabled] = useState(false)

  return (
    <div style={{ display: 'grid', gap: '0.5rem', justifyItems: 'start' }}>
      <Switch label="Receive notifications" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>{enabled ? 'Notifications on' : 'Notifications off'}</div>
    </div>
  )
}

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    label: 'Receive notifications',
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component: 'An on and off switch for a setting that takes effect at once, with a clickable label. It is an `<input type="checkbox">` with `role="switch"`, so screen readers announce it as a switch and the form sends the value only when it is on. It accepts `ref` and the attributes of the `<input>`. For a choice that only takes effect when the form is submitted, prefer the `Checkbox`.'
      }
    }
  },
  argTypes: {
    label: {
      description: 'Text of the label. Clicking it also turns the switch on or off. Without a visible label, pass aria-label.',
      control: 'text'
    },
    disabled: {
      description: 'Disables the switch and blocks toggling.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    defaultChecked: {
      description: 'Initial on state, for use without external control. See the Checked story.',
      control: false
    },
    checked: {
      description: 'On state when the component is controlled. It also requires onChange. See the Controlled story.',
      control: false
    },
    wrapperClassName: {
      description: 'Class of the root (data-slot="switch"). className stays on the native input (data-slot="switch-input").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Style of the root (data-slot="switch"). style stays on the native input.',
      control: false
    },
    animation: {
      description: 'Animation of the toggle: the thumb slides and the track changes color. false turns it off; { tuning: { duration } } sets the duration in seconds.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'fade' } }
    }
  }
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Checked: Story = {
  args: { defaultChecked: true }
}

export const Disabled: Story = {
  args: { disabled: true }
}

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}

export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Dark mode' }
}

export const Preferences: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: '0.25rem' }}>
      {settings.map(({ id, label, hint, checked }) => (
        <div key={id}>
          <Switch label={label} defaultChecked={checked} aria-describedby={`${id}-hint`} />
          <div id={`${id}-hint`} style={{ marginInlineStart: 'calc(3.25rem + var(--enchase-space-md))', fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>
            {hint}
          </div>
        </div>
      ))}
    </div>
  )
}
