import { useState } from 'react'
import { Alert, Button, Icon } from 'enchase'
import { defaultVariant, variantTexts, variants } from './defaultData.ts'

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const DismissibleDemo = (args: ComponentProps<typeof Alert>) => {
  const [open, setOpen] = useState(true)

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show again
      </Button>
    )
  }

  return <Alert {...args} onClose={() => setOpen(false)} />
}

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A status message inside the page, in four types (`info`, `success`, `warning` and `error`), with an optional title, icon and close button. For temporary messages that go away on their own, use notifications (`useToast`). It is a `<div>` and accepts the attributes of the `<div>`.'
      }
    }
  },
  args: {
    children: variantTexts.info.message,
    title: variantTexts.info.title,
    variant: defaultVariant
  },
  argTypes: {
    children: {
      description: 'Message of the alert. It accepts text and other elements, such as links.',
      control: 'text'
    },
    variant: {
      description: 'Type of the message: it sets the color, the icon and the ARIA role. Only error uses role="alert" and is announced at once; the others use role="status", which screen readers usually do not announce when the alert already appears with its text. For a message that is inserted after the page has loaded and has to be read, pass role="alert".',
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: `'${defaultVariant}'` } }
    },
    title: {
      description: 'Highlighted title, above the message.',
      control: 'text'
    },
    icon: {
      description: 'Icon in place of the default one of each type. With null or false, the Alert shows no icon. The icon is decorative (aria-hidden), so the text has to say everything.',
      control: false
    },
    onClose: {
      description: 'Shows the close button and is called when it is clicked. The Alert does not go away on its own: you remove it. The name of the button comes from labels.closeToast of the UIProvider.',
      control: false
    }
  }
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {variants.map((variant) => (
        <Alert key={variant} variant={variant} title={variantTexts[variant].title}>
          {variantTexts[variant].message}
        </Alert>
      ))}
    </div>
  )
}

export const WithoutTitle: Story = {
  args: { title: undefined, variant: 'success', children: variantTexts.success.title }
}

export const Dismissible: Story = {
  args: { variant: 'warning', title: variantTexts.warning.title, children: variantTexts.warning.message },
  render: (args) => <DismissibleDemo {...args} />
}

export const WithAction: Story = {
  args: { variant: 'warning', title: variantTexts.warning.title },
  render: (args) => (
    <Alert {...args}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span>{variantTexts.warning.message}</span>
        <Button size="sm" variant="outline">
          Renew now
        </Button>
      </div>
    </Alert>
  )
}

export const CustomIcon: Story = {
  args: {
    variant: 'info',
    title: 'Tip',
    children: 'Use the shortcut to open the search.',
    icon: (
      <Icon size={20}>
        <path d="M12 3v1M5.6 5.6l.7.7M3 12h1M5.6 18.4l.7-.7M12 20v1M18.4 18.4l-.7-.7M20 12h1M18.4 5.6l-.7.7" />
        <circle cx="12" cy="12" r="4" />
      </Icon>
    )
  }
}

export const WithoutIcon: Story = {
  args: { icon: null }
}
