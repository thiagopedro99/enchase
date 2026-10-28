import { useState } from 'react'
import { Flex, SegmentedControl } from 'enchase'
import { MoonIcon, SunIcon } from 'enchase/icons'
import { days, defaultFullWidth, defaultSize, sizes, views, viewsWithLockedBoard } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [view, setView] = useState('board')

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <SegmentedControl ariaLabel="View" items={views} value={view} onValueChange={setView} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Chosen value: {view}</div>
    </div>
  )
}

const MultipleDemo = () => {
  const [value, setValue] = useState(['mon', 'wed'])

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <SegmentedControl multiple ariaLabel="Days of the week" items={days} value={value} onValueChange={setValue} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Chosen values: {value.length === 0 ? 'none' : value.join(', ')}</div>
    </div>
  )
}

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  args: {
    ariaLabel: 'View',
    items: views,
    size: defaultSize,
    fullWidth: defaultFullWidth,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component:
          'A row of connected buttons to switch between a few alternatives that mean the same kind of thing, such as a view or a unit, without leaving the page. By default it chooses one: it is a `radiogroup`, with a single Tab stop on the checked option and the arrow keys, Home and End to move and check. With `multiple` it is a group of toggle buttons (`aria-pressed`), each one pressed or not, and Tab moves between them. It is not a set of tabs: nothing here shows or hides a panel, so use `Tabs` for that. It accepts `ref`, which goes to the root, and the attributes of the `<div>`.'
      }
    }
  },
  argTypes: {
    items: {
      description: 'Options of the control, in the order they appear. Each item has `value` (unique), `label` (text or nodes, such as an icon and a word), `ariaLabel` (the name of an option whose label is only an icon) and, optionally, `disabled`. The `label` sits inside a `<button>`, so no other button, link or field fits in it.',
      control: false
    },
    ariaLabel: {
      description: 'Name of the control for screen readers, such as View. It is not shown: describe what the options change. Without it, pass aria-labelledby.',
      control: 'text'
    },
    multiple: {
      description: 'Chooses several options instead of one. The control becomes a group of toggle buttons, and value and defaultValue become lists. See the Multiple story.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } }
    },
    value: {
      description: 'Value of the checked option when the control is controlled, or the list of the pressed values with multiple. It also requires onValueChange. To control it with nothing chosen, pass an empty string, or an empty list with multiple. See the Controlled story.',
      control: false,
      table: { type: { summary: 'string | string[]' } }
    },
    defaultValue: {
      description: 'Option checked at the start, or the list of the pressed ones with multiple, for use without external control. Without it, nothing is chosen.',
      control: false,
      table: { type: { summary: 'string | string[]' } }
    },
    onValueChange: {
      description: 'Called with the value of the option the user has just checked, by click or by keyboard, or with the list of all the pressed values, in the order of the items, with multiple. Clicking the checked option of a single control does nothing.',
      control: false,
      table: { type: { summary: '((value: string) => void) | ((value: string[]) => void)' } }
    },
    size: {
      description: 'Height of the control: sm is as tall as a small button, md as a medium button and lg as a large one.',
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    fullWidth: {
      description: 'Makes the control fill the width of its container, with options of the same width.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultFullWidth) } }
    },
    disabled: {
      description: 'Disables all the options.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    animation: {
      description: 'Animation of the color of the options when they are checked or pressed. false turns it off; { tuning: { duration } } sets the duration in seconds.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'fade' } }
    }
  }
} satisfies Meta<typeof SegmentedControl>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: 'board' }
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex direction="column" align="start" gap="1rem">
      {sizes.map((size) => (
        <SegmentedControl key={size} ariaLabel={`View, ${size}`} items={views} defaultValue="list" size={size} />
      ))}
    </Flex>
  )
}

export const WithIcons: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'An option can have an icon and a word. When it has only an icon, give it an `ariaLabel`, which is what a screen reader says.' } }
  },
  render: () => (
    <Flex direction="column" align="start" gap="1rem">
      <SegmentedControl
        ariaLabel="Theme"
        defaultValue="light"
        items={[
          {
            value: 'light',
            label: (
              <>
                <SunIcon /> Light
              </>
            )
          },
          {
            value: 'dark',
            label: (
              <>
                <MoonIcon /> Dark
              </>
            )
          }
        ]}
      />
      <SegmentedControl
        ariaLabel="Theme, icons only"
        defaultValue="dark"
        items={[
          { value: 'light', label: <SunIcon />, ariaLabel: 'Light theme' },
          { value: 'dark', label: <MoonIcon />, ariaLabel: 'Dark theme' }
        ]}
      />
    </Flex>
  )
}

export const FullWidth: Story = {
  args: { fullWidth: true, defaultValue: 'list' },
  parameters: { layout: 'padded' }
}

export const Multiple: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'With `multiple` each option is a toggle button: it is pressed or not, and the value is the list of the pressed ones, in the order of the items.' } }
  },
  render: () => <MultipleDemo />
}

export const DisabledOption: Story = {
  args: { items: viewsWithLockedBoard, defaultValue: 'list' }
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'board' }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}
