import { useEffect, useState } from 'react'
import { Button, Flex, Progress } from 'enchase'
import { defaultMax, defaultSize, defaultVariant, sizes, variants } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const UploadDemo = () => {
  const [value, setValue] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return undefined

    const timer = setInterval(() => {
      setValue((current) => {
        if (current >= 100) {
          setRunning(false)

          return 100
        }

        return Math.min(100, current + 7)
      })
    }, 350)

    return () => clearInterval(timer)
  }, [running])

  return (
    <Flex direction="column" gap="1rem" style={{ inlineSize: 'min(24rem, 100%)' }}>
      <Progress value={value} aria-label="Uploading photos" />
      <Flex gap="0.5rem" align="center">
        <Button
          size="sm"
          disabled={running}
          onClick={() => {
            setValue(0)
            setRunning(true)
          }}
        >
          {value === 100 ? 'Upload again' : 'Start the upload'}
        </Button>
        <span aria-hidden="true">{value}%</span>
      </Flex>
    </Flex>
  )
}

const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: {
    value: 40,
    max: defaultMax,
    variant: defaultVariant,
    size: defaultSize,
    'aria-label': 'Uploading photos'
  },
  parameters: {
    docs: {
      description: {
        component: 'Shows how far a task has come, as a bar or as a ring. With a `value` it is determinate; without one it is indeterminate and loops until the task ends. It is a `progressbar` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, and the indeterminate one leaves `aria-valuenow` out. Give it a name that says what is progressing, with `aria-label` or `aria-labelledby`; without one the name is the `loading` label of the `UIProvider`. The bar eases to a new value and the ring follows it, and the loop of the indeterminate state follows the `shimmer` recipe for the bar and the `spin` recipe for the ring. With reduced motion the loop becomes a pulse of the whole bar or ring. It is a `<div>` and accepts the attributes of the `<div>`.'
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
      description: 'How far the task has come, from 0 to `max`. A value out of the range is held at the nearest end. Leave it out for an indeterminate progress, when you cannot tell how long the task takes.',
      control: { type: 'range', min: 0, max: 100, step: 5 }
    },
    max: {
      description: 'Value that means the task is done. A number that is not above 0 is replaced by 100.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultMax) } }
    },
    variant: {
      description: 'Shape of the progress: a bar that fills its row, or a ring that sits in the text.',
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: `'${defaultVariant}'` } }
    },
    size: {
      description: 'Size of the progress. For the bar it sets the thickness (sm is 0.25 rem, md is 0.5 rem and lg is 0.75 rem) and for the ring the diameter (sm is 1.5 rem, md is 2.5 rem and lg is 3.5 rem).',
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    animation: {
      description: 'Loop of the indeterminate state. false turns it off and leaves a still, faded bar or ring. { tuning: { duration } } sets the seconds of one cycle. The determinate bar and ring also stop easing when it is false.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'shimmer (bar), spin (ring)' } }
    }
  }
} satisfies Meta<typeof Progress>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Circular: Story = {
  args: { variant: 'circular', value: 65 }
}

export const Indeterminate: Story = {
  args: { value: undefined, 'aria-label': 'Loading the report' }
}

export const IndeterminateRing: Story = {
  args: { variant: 'circular', value: undefined, 'aria-label': 'Loading the report' }
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex direction="column" gap="1.5rem">
      <Flex direction="column" gap="0.75rem">
        {sizes.map((size) => (
          <Progress key={size} size={size} value={60} aria-label={`Bar, size ${size}`} />
        ))}
      </Flex>
      <Flex align="center" gap="1rem">
        {sizes.map((size) => (
          <Progress key={size} variant="circular" size={size} value={60} aria-label={`Ring, size ${size}`} />
        ))}
      </Flex>
    </Flex>
  )
}

export const SimulatedUpload: Story = {
  parameters: { controls: { disable: true } },
  render: () => <UploadDemo />
}
