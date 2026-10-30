import { Select } from 'enchase'
import { fieldVariants, variantArgType, variantLabels, variantsStoryDescription } from '@docs/shared/fields.ts'
import { countryOptions, defaultFullWidth } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Country',
    placeholder: 'Select...',
    options: countryOptions,
    defaultValue: '',
    fullWidth: defaultFullWidth,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component: 'A styled native select, with a label, an error message, helper text and a `placeholder`. It accepts `ref` and the attributes of the `<select>`.'
      }
    }
  },
  argTypes: {
    label: {
      description: 'Label of the field, associated with the select for screen readers.',
      control: 'text'
    },
    labelPlacement: {
      description: 'Where the label sits: floating (inside the field, moves up to the outline on focus or when filled) or stacked (above the control, with no notch in the outline). Without the prop, the style of the theme (createTheme) applies: floating in the default style and stacked in shadcn.',
      control: 'inline-radio',
      options: ['floating', 'stacked'],
      table: { defaultValue: { summary: "'floating'" } }
    },
    variant: variantArgType,
    options: {
      description: 'List of options. Each one has value, label and, optionally, disabled.',
      control: 'object',
      table: { type: { summary: 'SelectOption[]' } }
    },
    placeholder: {
      description: 'Text of the initial option, shown while nothing has been chosen. For it to appear, the field needs to start with an empty defaultValue.',
      control: 'text'
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
    disabled: {
      description: 'Disables the field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    wrapperClassName: {
      description: 'Class of the root (data-slot="select"). className and style stay on the native select (data-slot="select-field").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Style of the root (data-slot="select"). style stays on the native select.',
      control: false
    },
    defaultValue: {
      description: 'Initial value when the field is uncontrolled. Use an empty value to show the placeholder.',
      control: false
    },
    value: {
      description: 'Current value when the field is controlled. It also requires onChange.',
      control: false
    }
  }
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithHelperText: Story = {
  args: { helperText: 'Used to set the default language' }
}

export const WithError: Story = {
  args: { error: 'Select a country' }
}

export const Disabled: Story = {
  args: { disabled: true }
}

export const LabelAbove: Story = {
  args: { labelPlacement: 'stacked' }
}

export const Variants: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story: variantsStoryDescription } } },
  render: (args) => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {fieldVariants.map((variant) => (
        <Select key={variant} {...args} variant={variant} label={variantLabels[variant]} />
      ))}
    </div>
  )
}
