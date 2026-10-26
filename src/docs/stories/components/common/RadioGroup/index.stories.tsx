import { useState } from 'react'
import { RadioGroup } from 'enchase'
import { defaultOrientation, plans, plansWithLockedTeam } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [plan, setPlan] = useState('pro')

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <RadioGroup label="Plan" options={plans} value={plan} onValueChange={setPlan} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Chosen value: {plan}</div>
    </div>
  )
}

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Plan',
    options: plans,
    orientation: defaultOrientation,
    disabled: false,
    required: false
  },
  parameters: {
    docs: {
      description: {
        component:
          'A group of radio buttons to choose one among a few alternatives that fit on the screen at once; for many, use the `Select`. It builds a `<fieldset>` with `role="radiogroup"`, a title, helper text and an error message, like the other fields. Each option is a native `<input type="radio">` with the same `name`, so the keyboard already works: Tab enters the group, and the arrow keys move to an option and check it. It accepts `ref`, which goes to the `<fieldset>`, and the attributes of the `<fieldset>`; `className` and `style` also go to it.'
      }
    }
  },
  argTypes: {
    options: {
      description: 'Options of the group, each one with `value`, `label` and, optionally, `disabled`. The order of the array is the order on the screen.',
      control: 'object'
    },
    label: {
      description: 'Title of the group, rendered as the `<legend>` of the `<fieldset>`. Without a visible title, pass aria-label to the group.',
      control: 'text'
    },
    name: {
      description: 'Name of the field in the form, the same for all the options. Without it, the group uses a generated name, which keeps the options linked to each other and separates one group from another.',
      control: 'text'
    },
    value: {
      description: 'Value of the checked option when the group is controlled. It also requires onValueChange. To control it with none checked, pass an empty string. See the Controlled story.',
      control: false
    },
    defaultValue: {
      description: 'Value of the option checked at the start, for use without external control. See the WithDefaultValue story.',
      control: 'text'
    },
    onValueChange: {
      description: 'Called with the value of the option the user just checked, by click or with the arrow keys of the keyboard.',
      control: false
    },
    required: {
      description: 'Requires a checked option when the form is submitted and tells screen readers with aria-required.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    error: {
      description: 'Error message. Marks the group as invalid (aria-invalid), paints the title and the options red and is announced as an alert. It replaces the helperText.',
      control: 'text'
    },
    helperText: {
      description: 'Helper text under the group. It is tied to the group by aria-describedby and disappears when there is an error.',
      control: 'text'
    },
    orientation: {
      description: 'Direction of the list: vertical stacks the options and horizontal puts them side by side, wrapping to a new line when there is not enough room.',
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      table: { defaultValue: { summary: `'${defaultOrientation}'` } }
    },
    disabled: {
      description: 'Disables all the options of the group.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    animation: {
      description: 'Animation of the dot of the checked option, which grows with a short pop. false turns it off; { tuning: { duration, scale } } sets the duration in seconds and the initial scale.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    }
  }
} satisfies Meta<typeof RadioGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: 'pro' }
}

export const Horizontal: Story = {
  args: { orientation: 'horizontal', options: plans.slice(0, 2), defaultValue: 'free' }
}

export const WithHelperText: Story = {
  args: { helperText: 'You can switch plans whenever you want', defaultValue: 'free' }
}

export const WithError: Story = {
  args: { error: 'Choose a plan to continue', required: true }
}

export const DisabledOption: Story = {
  args: { options: plansWithLockedTeam, defaultValue: 'free' }
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'pro' }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}
