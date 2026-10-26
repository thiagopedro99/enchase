import { Button, useToast } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ToastType } from 'enchase'

type ToastStoryArgs = {
  type: ToastType
  duration: number
  message: string
  actionLabel?: string
  dismissible?: boolean
}

const Launcher = ({ type, duration, message, actionLabel, dismissible }: ToastStoryArgs) => {
  const toast = useToast()
  const action = actionLabel ? { label: actionLabel, onClick: () => toast.info('Undone', 2000) } : undefined

  return <Button onClick={() => toast[type](message, duration, { action, dismissible })}>Show notification</Button>
}

const meta = {
  title: 'Components/Toast',
  component: Launcher,
  args: {
    type: 'success',
    duration: 3000,
    message: 'Changes saved'
  },
  argTypes: {
    type: {
      description: 'Type of the notification: sets the color and the icon, and the way it is announced. Success, info and warning are announced politely (role="status") and error at once (role="alert"), by two hidden announcers of the provider.',
      control: 'inline-radio',
      options: ['success', 'error', 'warning', 'info']
    },
    duration: {
      description: 'Milliseconds until the notification closes by itself. 0 keeps it open until the user closes it. The countdown pauses while the pointer or the focus is inside it.',
      control: 'number',
      table: { defaultValue: { summary: '3000' } }
    },
    message: {
      description: 'Content of the notification: text or nodes, such as a link. The text of the content is what screen readers announce.',
      control: 'text'
    },
    actionLabel: {
      description: 'Label of the action button, passed as `options.action.label` (it can be nodes). The button calls `options.action.onClick` and then closes the notification. The announcement reads the message only, so keep the message complete without the action.',
      control: 'text'
    },
    dismissible: {
      description: 'Passed as `options.dismissible`. With false the notification has no close button and does not close on a click or on Esc: it only closes after its duration or with `removeToast`.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } }
    }
  }
} satisfies Meta<typeof Launcher>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const ErrorToast: Story = {
  args: { type: 'error', message: 'Could not save' }
}

export const WithAction: Story = {
  args: { message: 'Message deleted', duration: 8000, actionLabel: 'Undo' }
}

export const NotDismissible: Story = {
  args: { type: 'info', message: 'Syncing your files', duration: 4000, dismissible: false }
}

export const Sticky: Story = {
  args: { type: 'info', duration: 0, message: 'This notification only closes when you ask it to' }
}
