import { useState } from 'react'
import { Button, CheckboxGroup } from 'enchase'
import { defaultOrientation, topics, topicsWithLockedEvents } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [value, setValue] = useState(['news'])

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <CheckboxGroup label="Topics" options={topics} value={value} onValueChange={setValue} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Chosen values: {value.length === 0 ? 'none' : value.join(', ')}</div>
      <Button variant="outline" size="sm" onClick={() => setValue(topics.map((topic) => topic.value))}>
        Choose all
      </Button>
    </div>
  )
}

const ValidatedDemo = () => {
  const [value, setValue] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const error = submitted && value.length === 0 ? 'Choose at least one topic' : undefined

  return (
    <form
      noValidate
      style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(true)
      }}
    >
      <CheckboxGroup label="Topics" options={topics} value={value} onValueChange={setValue} error={error} />
      <Button type="submit">Subscribe</Button>
    </form>
  )
}

const meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  args: {
    label: 'Topics',
    options: topics,
    orientation: defaultOrientation,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component:
          'A group of checkboxes to choose any number of options that fit on the screen at once. It builds a `<fieldset>` with a title, helper text and an error message, like the other fields, and each option is the `Checkbox` of the library, so Tab moves from one checkbox to the next and Space checks the focused one. The value is the list of the checked values, in the order of the options. It accepts `ref`, which goes to the `<fieldset>`, and the attributes of the `<fieldset>`; `className` and `style` also go to it. The group does not know when a choice is required: validate in your form and pass `error`.'
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
      description: 'Name of the field in the form, the same for all the options, so that each checked value is submitted with it. Without it, the checkboxes have no name and the form does not receive them.',
      control: 'text'
    },
    value: {
      description: 'Values of the checked options when the group is controlled. It also requires onValueChange. To control it with none checked, pass an empty array. See the Controlled story.',
      control: false
    },
    defaultValue: {
      description: 'Values of the options checked at the start, for use without external control. See the WithDefaultValue story.',
      control: 'object'
    },
    onValueChange: {
      description: 'Called with the values of all the checked options, in the order of the options, each time the user checks or unchecks one. A disabled option that is checked stays in the list.',
      control: false
    },
    error: {
      description: 'Error message. Marks every checkbox as invalid (aria-invalid), paints the title and the unchecked boxes red and is announced as an alert. It replaces the helperText. See the Validated story.',
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
      description: 'Animation of the check mark of each option, which grows with a short pop. false turns it off; { tuning: { duration, scale } } sets the duration in seconds and the initial scale.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    }
  }
} satisfies Meta<typeof CheckboxGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: ['news', 'events'] }
}

export const Horizontal: Story = {
  args: { orientation: 'horizontal', options: topics.slice(0, 2), defaultValue: ['news'] }
}

export const WithHelperText: Story = {
  args: { helperText: 'You can change this at any time', defaultValue: ['news'] }
}

export const WithError: Story = {
  args: { error: 'Choose at least one topic' }
}

export const DisabledOption: Story = {
  args: { options: topicsWithLockedEvents, defaultValue: ['news'] }
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: ['news', 'offers'] }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}

export const Validated: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'The group does not require a choice by itself. Validate in your form, here when the form is submitted, and pass the message in `error`.' } }
  },
  render: () => <ValidatedDemo />
}
