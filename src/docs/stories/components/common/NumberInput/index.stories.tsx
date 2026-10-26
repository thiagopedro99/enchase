import { useState } from 'react'
import { Button, NumberInput } from 'enchase'
import { defaultFullWidth, defaultStep, defaultSteppers, defaultValue } from './defaultData.ts'

import type { FormEvent } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [quantity, setQuantity] = useState<number | null>(3)

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <NumberInput label="Quantity" min={1} max={20} value={quantity} onValueChange={setQuantity} />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Button size="sm" variant="outline" onClick={() => setQuantity(10)}>
          Set to 10
        </Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Value: {quantity === null ? 'empty' : quantity}</span>
      </div>
    </div>
  )
}

const FormDemo = () => {
  const [sent, setSent] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(String(new FormData(event.currentTarget).get('price')))
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <NumberInput label="Price" name="price" defaultValue={1234.5} formatOptions={{ style: 'currency', currency: 'USD' }} />
      <Button type="submit" size="sm">
        Submit
      </Button>
      <span style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>{sent ? `price=${sent}` : 'Nothing submitted'}</span>
    </form>
  )
}

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  args: {
    label: 'Quantity',
    defaultValue: 3,
    min: 0,
    max: 99,
    step: defaultStep,
    fullWidth: defaultFullWidth,
    steppers: defaultSteppers,
    disabled: false,
    readOnly: false
  },
  parameters: {
    docs: {
      description: {
        component:
          'A field for typing a number, with a label, an error message, helper text and buttons to decrease and increase. It is an `<input type="text">` with `role="spinbutton"` and a numeric keyboard on phones, instead of `type="number"`: the text follows the language of the `UIProvider` (a decimal comma and a period for thousands in pt-BR), it accepts currency and percent through `formatOptions`, and the value comes out as a `number`, or `null` when the field is empty. The arrow keys change the value by `step`; Shift with the arrow keys, Page Up and Page Down change it by `largeStep`; Home and End go to `min` and `max`. The value is confirmed when the user leaves the field or presses Enter, limited to the range and rounded to the decimal places of the format. With `name`, the number goes to the form in a hidden field, without the formatting shown on screen. The buttons stay out of the Tab order, because the keyboard already has the arrow keys, and their names come from `labels.increaseValue` and `labels.decreaseValue` of the `UIProvider`. It accepts `ref`, which goes to the `<input>`, and the attributes of the `<input>`.'
      }
    }
  },
  argTypes: {
    value: {
      description: 'Value when the component is controlled; `null` is the empty field. It also requires onValueChange. See the Controlled story.',
      control: false
    },
    defaultValue: {
      description: 'Initial value, for use without external control. `null` starts with the field empty.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultValue) } }
    },
    onValueChange: {
      description: 'Called with the confirmed number, or `null` if the field was left empty. It happens when the user leaves the field, on Enter, with the arrow keys and with the buttons, never on every key typed.',
      control: false
    },
    min: {
      description: 'Smallest accepted value. What is typed below it goes back to the minimum when the user leaves the field, the decrease button is disabled at it and Home goes to it. With a `min` of zero or more, the minus sign is not accepted. On iPhone the numeric keyboard has no minus sign: to accept negative values, pass `inputMode="text"`.',
      control: 'number'
    },
    max: {
      description: 'Largest accepted value. What is typed above it goes back to the maximum when the user leaves the field, the increase button is disabled at it and End goes to it.',
      control: 'number'
    },
    step: {
      description: 'How much the value changes with the arrow keys and with the buttons. Steps count from `min` (or from 0), and the decimal places of the step go into the format. A value that is not positive is replaced by 1.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultStep) } }
    },
    largeStep: {
      description: 'Large step, used by Shift with the arrow keys and by Page Up and Page Down. Without it, ten times the `step` applies.',
      control: 'number'
    },
    formatOptions: {
      description:
        'Format of the number, as in `Intl.NumberFormat`: `style` (`decimal`, `currency` or `percent`), `currency` (a code such as `USD`), `currencyDisplay`, `minimumFractionDigits`, `maximumFractionDigits` and `useGrouping`. The language comes from the `UIProvider`. Without `maximumFractionDigits`, the decimal places of the style apply (3 for decimal, 2 for currency, 0 for percent) or the ones the `step` calls for. For percent the value is the fraction: 0.15 shows as 15%, and the `step` is usually 0.01.',
      control: false,
      table: { type: { summary: 'NumberInputFormat' } }
    },
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
    steppers: {
      description: 'Shows the decrease and increase buttons, and the spoken announcement of the new value when one of them is used. Without them, the keyboard still has the arrow keys.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultSteppers) } }
    },
    name: {
      description: 'Name of the field in the form. The number goes in a hidden field, as `1234.5`, and the text shown on screen is not sent.',
      control: 'text'
    },
    placeholder: {
      description: 'Example text shown when the field is empty. With a label, it only appears on focus.',
      control: 'text'
    },
    disabled: {
      description: 'Disables the field and the buttons.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    readOnly: {
      description: 'Makes the value read-only: nothing can be typed, the arrow keys do not change the value and the buttons are disabled.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    wrapperClassName: {
      description: 'Class of the root (data-slot="number-input"). className and style stay on the input (data-slot="number-input-field").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Style of the root (data-slot="number-input"). style stays on the input.',
      control: false
    }
  }
} satisfies Meta<typeof NumberInput>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithHelperText: Story = {
  args: { helperText: 'From 0 to 99 units' }
}

export const WithError: Story = {
  args: { error: 'Enter a quantity of at least 1', defaultValue: 0 }
}

export const Decimals: Story = {
  args: { label: 'Score', defaultValue: 7.5, min: 0, max: 10, step: 0.1 }
}

export const Currency: Story = {
  args: { label: 'Price', defaultValue: 1234.5, min: 0, max: undefined, step: 0.5, formatOptions: { style: 'currency', currency: 'USD' } }
}

export const Percent: Story = {
  args: { label: 'Discount', defaultValue: 0.15, min: 0, max: 1, step: 0.01, formatOptions: { style: 'percent' } }
}

export const Integers: Story = {
  args: { label: 'People', defaultValue: 2, min: 1, max: 10, formatOptions: { maximumFractionDigits: 0 }, helperText: 'Type integers only' }
}

export const Negative: Story = {
  args: { label: 'Temperature', defaultValue: -4, min: -30, max: 50, inputMode: 'text', formatOptions: { maximumFractionDigits: 0 } }
}

export const WithoutSteppers: Story = {
  args: { steppers: false }
}

export const Empty: Story = {
  args: { defaultValue: null, placeholder: 'How many?' }
}

export const Disabled: Story = {
  args: { disabled: true }
}

export const ReadOnly: Story = {
  args: { readOnly: true }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}

export const InAForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FormDemo />
}

export const LabelAbove: Story = {
  args: { labelPlacement: 'stacked' }
}
