import { Input } from 'enchase'
import { fieldVariants, variantArgType, variantLabels, variantsStoryDescription } from '@docs/shared/fields.ts'
import { defaultFullWidth, defaultPasswordToggle } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'

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
      description: 'Where the label sits: floating (inside the field, moves up to the outline on focus or when filled), stacked (above the control, with no notch in the outline) or start (before the control, on the same line: the column of the label is as wide as `--enchase-input-label-width`, 7.5rem by default, and the error and the helper text go under the control). Without the prop, the style of the theme (createTheme) applies: floating in the default style and stacked in shadcn. With a variant other than outlined, a floating label is drawn above the field.',
      control: 'inline-radio',
      options: ['floating', 'stacked', 'start'],
      table: { defaultValue: { summary: "'floating'" } }
    },
    variant: variantArgType,
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

export const WithBackground: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={
        {
          display: 'grid',
          gap: '1rem',
          '--enchase-input-field-background': 'var(--enchase-color-surface-container-low)',
          '--enchase-input-field-background-hover': 'var(--enchase-color-surface-container)',
          '--enchase-input-field-background-focus': 'var(--enchase-color-surface)',
          '--enchase-input-field-background-disabled': 'var(--enchase-color-surface-container-high)'
        } as CSSProperties
      }
    >
      <Input {...args} labelPlacement="stacked" />
      <Input {...args} labelPlacement="stacked" label="Disabled" disabled />
    </div>
  )
}

export const FilledBackground: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The fill of the `filled` variant comes from four hooks of its own, `--enchase-input-field-background-filled` and the same with `-hover`, `-focus` and `-disabled`, set here on a container. The plain background hooks of the fields do not reach this variant. The line at the base of the field keeps the color of the border and has to stay at 3:1 or more against the fill (WCAG 1.4.11).'
      }
    }
  },
  render: (args) => (
    <div
      style={
        {
          display: 'grid',
          gap: '1rem',
          '--enchase-input-field-background-filled': 'var(--enchase-color-surface-container-low)',
          '--enchase-input-field-background-filled-hover': 'var(--enchase-color-surface-container)',
          '--enchase-input-field-background-filled-focus': 'var(--enchase-color-surface)',
          '--enchase-input-field-background-filled-disabled': 'var(--enchase-color-surface-container-high)'
        } as CSSProperties
      }
    >
      <Input {...args} variant="filled" />
      <Input {...args} variant="filled" label="Disabled" disabled />
    </div>
  )
}

export const Variants: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story: variantsStoryDescription } } },
  render: (args) => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {fieldVariants.map((variant) => (
        <Input key={variant} {...args} variant={variant} label={variantLabels[variant]} />
      ))}
    </div>
  )
}

export const LabelStart: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: '1rem', '--enchase-input-label-width': '8rem' } as CSSProperties}>
      <Input {...args} labelPlacement="start" label="Name" placeholder="Ada Lovelace" />
      <Input {...args} labelPlacement="start" label="Email address" helperText="We never share your email" />
      <Input {...args} labelPlacement="start" label="A longer label that wraps" error="This field is required" />
    </div>
  )
}
