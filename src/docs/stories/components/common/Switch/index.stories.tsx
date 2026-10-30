import { useState } from 'react'
import { Switch } from 'enchase'
import { settings } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'

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
        component: 'An on and off switch for a setting that takes effect at once, with a clickable label. It is an `<input type="checkbox">` with `role="switch"`, so screen readers announce it as a switch and the form sends the value only when it is on. It accepts `ref` and the attributes of the `<input>`. With `error` the switch is marked as invalid and the message shows under the label, and `helperText` shows a hint in the same place. Both sit outside the `<label>`, so the accessible name stays the label text. An invalid switch only exposes `aria-invalid` and the message: its track is not painted in the color of the error, unlike the box of a `Checkbox`. For a choice that only takes effect when the form is submitted, prefer the `Checkbox`.'
      }
    }
  },
  argTypes: {
    label: {
      description: 'Text of the label. Clicking it also turns the switch on or off. Without a visible label, pass aria-label.',
      control: 'text'
    },
    error: {
      description: 'Error message. Marks the switch as invalid (aria-invalid) and shows the message under the label, announced as an alert. It replaces the helperText. The message sits outside the `<label>`, in the `<span data-slot="switch-field">` that always wraps the label, so the input is never rebuilt when a message comes or goes.',
      control: 'text'
    },
    helperText: {
      description: 'Helper text under the label, aligned with its text. It is tied to the switch by aria-describedby and disappears when there is an error.',
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
      description: 'Class of the root (data-slot="switch"). className stays on the native input (data-slot="switch-input"). With a message, it still goes on the `<label>`, inside the column, and not on the outer `<span data-slot="switch-field">`.',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Style of the root (data-slot="switch"). style stays on the native input. With a message, it still goes on the `<label>`, inside the column, and not on the outer `<span data-slot="switch-field">`.',
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

export const WithHelperText: Story = {
  args: { helperText: 'One summary a day, no spam' }
}

export const WithError: Story = {
  args: { error: 'Turn notifications on to continue' }
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

export const CustomHooks: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'The thumb has a shadow at rest, `--enchase-switch-thumb-shadow`, and one for each state under the pointer: `--enchase-switch-thumb-shadow-hover` and `-active` when it is off, `-checked-hover` and `-checked-active` when it is on. Without them the thumb has no shadow at rest and shows the halo of the state. Here a style without the halo gives the thumb the same small shadow in every state, so it does not lose it under the pointer.'
      }
    }
  },
  render: () => (
    <div
      style={
        {
          display: 'grid',
          gap: '0.5rem',
          justifyItems: 'start',
          '--enchase-halo-size-switch': '0px',
          '--enchase-switch-thumb-shadow': 'var(--enchase-shadow-sm)',
          '--enchase-switch-thumb-shadow-hover': 'var(--enchase-shadow-sm)',
          '--enchase-switch-thumb-shadow-active': 'var(--enchase-shadow-sm)',
          '--enchase-switch-thumb-shadow-checked-hover': 'var(--enchase-shadow-sm)',
          '--enchase-switch-thumb-shadow-checked-active': 'var(--enchase-shadow-sm)'
        } as CSSProperties
      }
    >
      <Switch label="Receive notifications" />
      <Switch label="Weekly report" defaultChecked />
    </div>
  )
}
