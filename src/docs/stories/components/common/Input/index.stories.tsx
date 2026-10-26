import { Input } from 'enchase'
import { defaultFullWidth, defaultPasswordToggle } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'text',
    fullWidth: defaultFullWidth,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component: 'A text field with a label, an error message, helper text and a button to reveal the password. It accepts `ref` and the attributes of the `<input>`.'
      }
    }
  },
  argTypes: {
    label: {
      description: 'Label of the field, associated with the input for screen readers.',
      control: 'text'
    },
    labelPlacement: {
      description: 'Where the label sits: floating (inside the field, moves up to the outline on focus or when filled) or stacked (above the control, with no notch in the outline). Without the prop, the style of the theme (createTheme) applies: floating in the default style and stacked in shadcn.',
      control: 'inline-radio',
      options: ['floating', 'stacked'],
      table: { defaultValue: { summary: "'floating'" } }
    },
    helperText: {
      description: 'Helper text. It is tied to the field by aria-describedby and disappears when there is an error.',
      control: 'text'
    },
    error: {
      description: 'Error message. Marks the field as invalid (aria-invalid) and is announced as an alert.',
      control: 'text'
    },
    fullWidth: {
      description: 'Takes up the full available width.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultFullWidth) } }
    },
    passwordToggle: {
      description: 'Shows the button to reveal or hide the password. It only applies when type is password. The texts of the button come from the UIProvider.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultPasswordToggle) } }
    },
    type: {
      description: 'Native type of the input.',
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      table: { defaultValue: { summary: 'text' } }
    },
    placeholder: {
      description: 'Example text shown when the field is empty.',
      control: 'text'
    },
    disabled: {
      description: 'Disables the field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    wrapperClassName: {
      description: 'Class of the root (data-slot="input"). className and style stay on the native input (data-slot="input-field").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Style of the root (data-slot="input"). style stays on the native input.',
      control: false
    }
  }
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithHelperText: Story = {
  args: { helperText: 'We never share your email' }
}

export const WithError: Story = {
  args: { error: 'This field is required' }
}

export const Password: Story = {
  args: { label: 'Password', type: 'password', placeholder: undefined, helperText: 'Use the eye to check what you typed' }
}

export const Disabled: Story = {
  args: { disabled: true }
}

export const LabelAbove: Story = {
  args: { labelPlacement: 'stacked', helperText: 'We never share your email' }
}
