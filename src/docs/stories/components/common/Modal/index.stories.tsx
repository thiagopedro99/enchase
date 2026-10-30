import { useState } from 'react'
import { Button, Modal } from 'enchase'
import { containerArgType } from '@docs/shared/argTypes.ts'
import { clauses } from './defaultData.ts'

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

type ModalDemoProps = ComponentProps<typeof Modal> & { label: string }

const ModalDemo = ({ label, ...args }: ModalDemoProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}

const meta = {
  title: 'Components/Modal',
  component: Modal,
  args: {
    isOpen: false,
    onClose: () => undefined,
    title: 'Edit profile',
    children: 'The focus stays trapped in the panel, the page behind it is inert and Esc returns the focus to the button.',
    size: 'md',
    showCloseButton: true,
    closeOnOverlayClick: true,
    closeOnEsc: true
  },
  parameters: {
    docs: {
      description: {
        component:
          'A modal dialog rendered in a portal: the focus stays trapped in the panel, the page behind it is inert, and Esc or a click on the backdrop closes it. It enters and exits with animation. It is always controlled by `isOpen` and `onClose`. When the content is taller than the panel, the body scrolls and becomes a focusable region named by the title (or by `ariaLabel`), so a keyboard user can scroll it.'
      }
    }
  },
  argTypes: {
    isOpen: {
      description: 'Opens and closes the modal. It is always controlled: you keep the state and change it in onClose. It renders in a portal on the body, only after mounting, and stays mounted until the exit animation ends.',
      control: false
    },
    onClose: {
      description: 'Called when the user asks to close: close button, click on the backdrop or Esc, depending on showCloseButton, closeOnOverlayClick and closeOnEsc. The modal does not close itself.',
      control: false
    },
    title: { description: 'Title of the dialog (h2), which gives the accessible name. Without it, use ariaLabel.', control: 'text' },
    ariaLabel: { description: 'Accessible name of the dialog when there is no title.', control: 'text' },
    role: {
      description: 'dialog is the default. alertdialog is for confirmations that require a response: the body becomes the accessible description (aria-describedby).',
      control: 'inline-radio',
      options: ['dialog', 'alertdialog'],
      table: { defaultValue: { summary: 'dialog' } }
    },
    size: {
      description: 'Maximum width of the panel.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      table: { defaultValue: { summary: 'md' } }
    },
    showCloseButton: { description: 'Shows the close button in the header.', control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    closeOnOverlayClick: { description: 'Closes when the backdrop is clicked.', control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    closeOnEsc: { description: 'Closes with Esc. With stacked modals, only the top one closes.', control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    className: { description: 'Class of the panel. It wins over the library class without !important.', control: false },
    style: { description: 'Style of the panel, merged with the library style (yours wins).', control: false },
    container: containerArgType,
    animation: { description: 'false turns off the motion; { recipe, tuning } adjusts the duration, the distance and the scale.', control: false },
    children: { description: 'Content of the modal body.', control: 'text' },
    footer: { description: 'Fixed content below the body, such as the action buttons.', control: false }
  }
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => <ModalDemo {...args} label="Open modal" footer={<Button>Save</Button>} />
}

export const LongContent: Story = {
  args: { title: 'Terms of service' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'The header and the footer stay in place and the body scrolls when the content is taller than the screen. While it scrolls, the body is a region that Tab reaches, named by the title, so a keyboard user can scroll it with the arrow keys and Page Down.'
      }
    }
  },
  render: (args) => (
    <ModalDemo {...args} label="Open with long content" footer={<Button>Accept</Button>}>
      <ol style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
        {[...clauses, ...clauses, ...clauses].map((clause, index) => (
          <li key={`${clause}-${index}`}>{clause}</li>
        ))}
      </ol>
    </ModalDemo>
  )
}

export const WithoutMotion: Story = {
  render: (args) => <ModalDemo {...args} label="Open without animation" animation={false} />
}
