import { useState } from 'react'
import { Button, ConfirmModal } from 'enchase'

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

type ConfirmDemoProps = ComponentProps<typeof ConfirmModal> & { label: string }

const ConfirmDemo = ({ label, ...args }: ConfirmDemoProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ConfirmModal {...args} isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}

const meta = {
  title: 'Components/ConfirmModal',
  component: ConfirmModal,
  args: {
    isOpen: false,
    onClose: () => undefined,
    onConfirm: () => undefined,
    message: 'This action cannot be undone.',
    confirmVariant: 'primary'
  },
  argTypes: {
    isOpen: {
      description: 'Opens and closes the confirmation. Like the Modal, it is always controlled: you keep the state and change it in onClose.',
      control: false
    },
    onClose: {
      description: 'Called on cancel, when closed by Esc, the close button or the backdrop, and right after onConfirm.',
      control: false
    },
    onConfirm: {
      description: 'Called when the confirm button is clicked. The modal calls onClose right after, so there is no need to close it here.',
      control: false
    },
    title: {
      description: 'Title of the confirmation. Without it, it uses the labels.confirmAction text of the UIProvider.',
      control: 'text'
    },
    message: {
      description: 'Text of the question, in the body of the modal. The dialog is an alertdialog and the body becomes the accessible description.',
      control: 'text'
    },
    confirmText: {
      description: 'Text of the confirm button. Without it, it uses labels.confirm from the UIProvider.',
      control: 'text'
    },
    cancelText: {
      description: 'Text of the cancel button, which receives the initial focus. Without it, it uses labels.cancel from the UIProvider.',
      control: 'text'
    },
    confirmVariant: {
      description: 'Style of the confirm button, the same as in the Button.',
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      table: { defaultValue: { summary: 'primary' } }
    },
    animation: {
      description: 'false turns off the motion; { recipe, tuning } adjusts the duration, the distance and the scale, as in the Modal.',
      control: false
    },
    className: {
      description: 'Class of the panel. It wins over the library class without !important.',
      control: false
    },
    style: {
      description: 'Style of the panel, merged with the library style (yours wins).',
      control: false
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'A ready-made confirmation modal: an alertdialog with the question and the cancel and confirm buttons. Use the Modal when you need content of your own.'
      }
    }
  },
  render: (args) => <ConfirmDemo {...args} label="Delete item" />
} satisfies Meta<typeof ConfirmModal>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const CustomTexts: Story = {
  args: { title: 'Delete the project?', message: 'All the files in the project will be deleted.', confirmText: 'Delete', cancelText: 'Keep' }
}
