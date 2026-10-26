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
        component: 'Holds the queue of notifications and the region where they appear (`role="region"`, named by `labels.notifications`, not a live region). Two hidden announcers, which exist before the first notification, read the text of each one aloud: `role="status"` for success, info and warning, and `role="alert"` for error. The `success`, `error`, `warning` and `info` methods of `useToast` open the notifications, and the message can be text or nodes.'
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

export const WithoutMotion: Story = {
  args: { animation: false }
}
