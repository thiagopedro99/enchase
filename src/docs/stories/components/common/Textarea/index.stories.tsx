import { Textarea } from 'enchase'
import { defaultFullWidth, defaultResize, defaultRows } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    label: 'Message',
    placeholder: 'Tell us what happened',
    fullWidth: defaultFullWidth,
    resize: defaultResize,
    rows: defaultRows,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component: 'A multi-line text field, with a label, an error message and helper text, like the `Input`. It accepts `ref` and the attributes of the `<textarea>`.'
      }
    }
  },
  argTypes: {
    label: {
      description: 'Label of the field, associated with the textarea for screen readers.',
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
    resize: {
      description: 'How the user resizes the field with the handle in the corner: none does not allow it, vertical changes only the height, horizontal only the width and both changes the height and the width.',
      control: 'inline-radio',
      options: ['none', 'vertical', 'horizontal', 'both'],
      table: { defaultValue: { summary: `'${defaultResize}'` } }
    },
    rows: {
      description: 'Number of visible rows. The field scrolls when the text goes past that.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultRows) } }
    },
    placeholder: {
      description: 'Example text shown when the field is empty. With a label, it only appears on focus.',
      control: 'text'
    },
    disabled: {
      description: 'Disables the field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    wrapperClassName: {
      description: 'Class of the root (data-slot="textarea"). className and style stay on the native textarea (data-slot="textarea-field").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Style of the root (data-slot="textarea"). style stays on the native textarea.',
      control: false
    }
  }
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithHelperText: Story = {
  args: { helperText: 'The more details, the faster we can help' }
}

export const WithError: Story = {
  args: { error: 'This field is required' }
}

export const FixedSize: Story = {
  args: { resize: 'none', rows: 6 }
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'This text cannot be edited' }
}

export const LabelAbove: Story = {
  args: { labelPlacement: 'stacked' }
}
