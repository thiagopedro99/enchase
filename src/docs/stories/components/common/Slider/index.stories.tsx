import { useState } from 'react'
import { Flex, Slider } from 'enchase'
import { defaultDisabled, defaultMax, defaultMin, defaultShowValue, defaultStep, formatPercent, formatPrice, formatTemperature } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'

const ControlledDemo = () => {
  const [volume, setVolume] = useState(30)

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(24rem, 100%)' }}>
      <Slider label="Volume" showValue formatValue={formatPercent} value={volume} onValueChange={setVolume} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Chosen value: {volume}</div>
    </div>
  )
}

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: {
    label: 'Volume',
    min: defaultMin,
    max: defaultMax,
    step: defaultStep,
    showValue: defaultShowValue,
    disabled: defaultDisabled,
    defaultValue: 30
  },
  parameters: {
    docs: {
      description: {
        component:
          'Picks one number in a range by dragging a thumb, clicking the track or using the keyboard. It is a `slider` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`: the arrow keys move by one `step`, PageUp and PageDown by a tenth of the range, and Home and End go to the ends. In a right-to-left page the left and right arrows swap, and the track fills from the right. On a touch screen it moves with a tap or a horizontal drag, so a swipe up or down that starts on it still scrolls the page. It picks one value only: there is no range with two thumbs. Give it a name with `label`, `ariaLabel` or `aria-labelledby`. When the number is not enough for a person who cannot see the thumb, such as a price or a temperature, pass `formatValue` so that `aria-valuetext` says it with its unit. It accepts `ref`, which goes to the root, and the attributes of the `<div>`.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 'min(24rem, 100%)' }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    value: {
      description: 'Value of the slider when it is controlled. It also requires onValueChange. A value outside the range, or off a step, is shown at the nearest allowed one. See the Controlled story.',
      control: false
    },
    defaultValue: {
      description: 'Value at the start, for use without external control. Without it, the slider starts at `min`.',
      control: { type: 'number', min: 0, max: 100, step: 1 }
    },
    onValueChange: {
      description: 'Called with the new value each time it changes, by pointer or by keyboard, already rounded to the step and held inside the range. It is not called when the value stays the same.',
      control: false
    },
    min: {
      description: 'Smallest value.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultMin) } }
    },
    max: {
      description: 'Largest value. When it is not a multiple of `step` away from `min`, the largest value that can be picked is the last step before it.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultMax) } }
    },
    step: {
      description: 'Distance between two values. It accepts fractions, such as 0.1. A number that is not above 0 is replaced by 1.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultStep) } }
    },
    label: {
      description: 'Visible name of the slider, above the track. It also names the thumb for screen readers.',
      control: 'text'
    },
    ariaLabel: {
      description: 'Name of the slider for screen readers when there is no visible `label`. Without any name, pass aria-labelledby.',
      control: 'text'
    },
    formatValue: {
      description: 'Turns the value into the text that is shown with `showValue` and read to screen readers as `aria-valuetext`, such as 30% or $120. Without it the number is shown as it is and `aria-valuetext` is not set.',
      control: false
    },
    showValue: {
      description: 'Shows the current value beside the label. It is hidden from screen readers, which read the value of the thumb.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultShowValue) } }
    },
    name: {
      description: 'Name of the field that carries the value in a form. Without it nothing is submitted, and a disabled slider does not submit it either, as a native control would not.',
      control: 'text'
    },
    disabled: {
      description: 'Disables the slider: the thumb leaves the Tab order and neither the pointer nor the keyboard change the value.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    animation: {
      description: 'Animation of the filled part and of the thumb when the value changes by a key or by a click. Dragging follows the pointer with no delay. false turns it off; { tuning: { duration } } sets the duration in seconds.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'fade' } }
    }
  }
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithValue: Story = {
  args: { showValue: true, formatValue: formatPercent },
  parameters: { docs: { description: { story: '`showValue` shows the number beside the label, and `formatValue` gives it a unit. The same text is what `aria-valuetext` tells a screen reader.' } } }
}

export const WithSteps: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'The value always lands on a step, from `min`, even when it comes from the pointer. `step` accepts fractions, and a `max` that is not on a step leaves the last step below it as the largest value.' } }
  },
  render: () => (
    <Flex direction="column" align="stretch" gap="1.5rem">
      <Slider label="Price" showValue formatValue={formatPrice} min={10} max={200} step={10} defaultValue={60} />
      <Slider label="Temperature" showValue formatValue={formatTemperature} min={16} max={30} step={0.5} defaultValue={21.5} />
      <Slider label="Opacity" showValue min={0} max={1} step={0.1} defaultValue={0.4} />
    </Flex>
  )
}

export const WithoutLabel: Story = {
  args: { label: undefined, ariaLabel: 'Volume' },
  parameters: { docs: { description: { story: 'Without a visible label, `ariaLabel` is what names it. Use it only when the text around the slider already says what it changes.' } } }
}

export const InForm: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'With `name`, the slider carries its value in a hidden field, so a `<form>` submits it with the others.' } }
  },
  render: () => (
    <form
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      <Slider label="Brightness" name="brightness" showValue defaultValue={70} />
    </form>
  )
}

export const Disabled: Story = {
  args: { disabled: true, showValue: true, defaultValue: 40 }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}

export const CustomHooks: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Under the pointer the border of the thumb can get wider with `--enchase-slider-thumb-border-width-hover`, and while it is dragged with `--enchase-slider-thumb-border-width-active`, which wins over the hover one. The filled part of the track can change color under the pointer with `--enchase-slider-range-background-hover`. All of them fall back to what the slider has at rest, so without them only the halo changes, and a disabled slider has no hover at all. Here the border of the thumb goes from 2 px to 4 px, and the filled part takes the hover color of the primary role.'
      }
    }
  },
  render: () => (
    <div
      style={
        {
          display: 'grid',
          gap: '1rem',
          '--enchase-slider-thumb-border-width-hover': '4px',
          '--enchase-slider-thumb-border-width-active': '4px',
          '--enchase-slider-range-background-hover': 'var(--enchase-color-primary-hover)'
        } as CSSProperties
      }
    >
      <Slider label="Volume" showValue defaultValue={40} />
      <Slider label="Locked" showValue defaultValue={40} disabled />
    </div>
  )
}
