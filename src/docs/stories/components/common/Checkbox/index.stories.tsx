import { useState } from 'react'
import { Checkbox } from 'enchase'
import { channels, defaultDisabled, defaultIndeterminate } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const SelectAllDemo = () => {
  const [selected, setSelected] = useState([channels[0]])
  const all = selected.length === channels.length

  return (
    <div style={{ display: 'grid', gap: '0.25rem' }}>
      <Checkbox label="All channels" checked={all} indeterminate={selected.length > 0 && !all} onChange={() => setSelected(all ? [] : channels)} />
      <div style={{ display: 'grid', gap: '0.25rem', paddingInlineStart: '1.75rem' }}>
        {channels.map((channel) => (
          <Checkbox key={channel} label={channel} checked={selected.includes(channel)} onChange={() => setSelected(selected.includes(channel) ? selected.filter((value) => value !== channel) : [...selected, channel])} />
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    label: 'I accept the terms',
    disabled: defaultDisabled,
    indeterminate: defaultIndeterminate
  },
  parameters: {
    docs: {
      description: {
        component: 'A styled native checkbox, with a clickable label and an animated check mark. It accepts `ref` and the attributes of the `<input>`. With `indeterminate` it shows the mixed state of a box that summarizes other boxes, such as a select all (see the SelectAll story). With `aria-invalid="true"` the box of an unchecked checkbox takes the color of the error on its border. To choose among several options, use the `CheckboxGroup`.'
      }
    }
  },
  argTypes: {
    label: {
      description: 'Text of the label. Clicking it also checks the box.',
      control: 'text'
    },
    disabled: {
      description: 'Disables the box and blocks checking it.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    indeterminate: {
      description: 'Shows the mixed state, for a box that summarizes other boxes. It sets the `indeterminate` property of the native input, so assistive technology reads it as mixed, and it does not change `checked`. A click does not clear it: do that in `onChange`. The property is set on the client, so a mixed box that is rendered on the server looks checked or unchecked until the page hydrates.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    defaultChecked: {
      description: 'Initial checked state, for use without external control. See the Checked story.',
      control: false
    },
    checked: {
      description: 'Checked state when the component is controlled. It also requires onChange.',
      control: false
    },
    wrapperClassName: {
      description: 'Class of the root (data-slot="checkbox"). className stays on the native input (data-slot="checkbox-input").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Style of the root (data-slot="checkbox"). style stays on the native input.',
      control: false
    },
    animation: {
      description: 'Animation of the check mark, which grows with a short pop. false turns it off; { tuning: { duration, scale } } sets the duration in seconds and the initial scale.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    }
  }
} satisfies Meta<typeof Checkbox>

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

export const Invalid: Story = {
  args: { 'aria-invalid': true }
}

export const Indeterminate: Story = {
  args: { indeterminate: true }
}

export const SelectAll: Story = {
  render: () => <SelectAllDemo />
}
