import { Button, ToastProvider, useToast } from 'enchase'
import { containerArgType } from '@docs/shared/argTypes.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const Launcher = () => {
  const toast = useToast()

  return <Button onClick={() => toast.info('Changes saved')}>Show notification</Button>
}

const meta = {
  title: 'System/ToastProvider',
  component: ToastProvider,
  args: { children: undefined },
  argTypes: {
    children: { description: 'The app. The components inside it use `useToast` to open notifications.', control: false },
    container: containerArgType,
    position: {
      description: 'Corner of the window where the notifications stack: `top-end` (the default), `top-start`, `bottom-end` or `bottom-start`. Start and end follow the direction of the page, and the notifications slide in from that side. The oldest one is always first from top to bottom.',
      control: 'select',
      options: ['top-end', 'top-start', 'bottom-end', 'bottom-start'],
      table: { defaultValue: { summary: 'top-end' } }
    },
    limit: {
      description: 'Most notifications on the screen at once, from 1 up. The others wait in a queue, in order, and appear as the visible ones close; a waiting one is neither announced nor counted down until it appears. Without it, there is no limit.',
      control: 'number'
    },
    animation: {
      description: 'Entry and exit motion of the notifications, which slide in from the right with a short spring. `false` turns it off; `{ recipe, from, tuning }` adjusts the recipe, the side and the duration.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, from, tuning }' }, defaultValue: { summary: 'slide' } }
    },
    className: {
      description: 'Class of the notification region (`data-slot="toast-viewport"`), which wins over the one of the library.',
      control: 'text'
    },
    style: { description: 'Style of the notification region.', control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'Holds the queue of notifications and the region where they appear (`role="region"`, named by `labels.notifications`, not a live region). Two hidden announcers, which exist before the first notification, read the text of each one aloud: `role="status"` for success, info and warning, and `role="alert"` for error. The countdown of all the notifications stops while the pointer or the keyboard focus is anywhere in the region. The `success`, `error`, `warning` and `info` methods of `useToast` open the notifications, and the message can be text or nodes.'
      }
    }
  },
  render: (args) => (
    <ToastProvider {...args}>
      <Launcher />
    </ToastProvider>
  )
} satisfies Meta<typeof ToastProvider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const BottomStart: Story = {
  args: { position: 'bottom-start' }
}

export const LimitOfTwo: Story = {
  args: { limit: 2 },
  parameters: { docs: { description: { story: 'With `limit` 2, press the button four times: two notifications show and the others wait their turn.' } } }
}

export const WithoutMotion: Story = {
  args: { animation: false }
}
