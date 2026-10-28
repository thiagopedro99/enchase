import { Checkbox } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    label: 'I accept the terms',
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component: 'A styled native checkbox, with a clickable label and an animated check mark. It accepts `ref` and the attributes of the `<input>`. With `aria-invalid="true"` the box of an unchecked checkbox takes the color of the error on its border. To choose among several options, use the `CheckboxGroup`.'
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
