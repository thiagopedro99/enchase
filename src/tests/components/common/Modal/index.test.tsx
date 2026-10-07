import { describeDialogContract } from '@tests/shared/contracts/dialogContract.tsx'
import { ControlledDialog } from '@tests/shared/contracts/dialogHarness.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { ConfirmModal, Modal } from '@components/common/Modal/index.tsx'

import type { DialogContractAdapter } from '@tests/shared/contracts/types.ts'

const modalAdapter: DialogContractAdapter = {
  name: 'Modal',
  triggerName: 'Open',
  dialogName: 'Edit profile',
  render: () => (
    <ControlledDialog>
      {({ open, close }) => (
        <Modal isOpen={open} onClose={close} title="Edit profile" footer={<button>Save</button>}>
          <input aria-label="Name" />
        </Modal>
      )}
    </ControlledDialog>
  )
}

const confirmAdapter: DialogContractAdapter = {
  name: 'ConfirmModal',
  role: 'alertdialog',
  triggerName: 'Open',
  dialogName: 'Confirmar ação',
  render: () => (
    <ControlledDialog>{({ open, close }) => <ConfirmModal isOpen={open} onClose={close} onConfirm={vi.fn()} message="Delete this item?" />}</ControlledDialog>
  )
}

describeDialogContract(modalAdapter)
describeDialogContract(confirmAdapter)

describe('Modal', () => {
  it('gives each modal a unique title id', async () => {
    renderWithProviders(
      <>
        <Modal isOpen onClose={vi.fn()} title="First">
          <p>a</p>
        </Modal>
        <Modal isOpen onClose={vi.fn()} title="Second">
          <p>b</p>
        </Modal>
      </>
    )

    const first = await screen.findByRole('heading', { name: 'First' })
    const second = await screen.findByRole('heading', { name: 'Second' })
    expect(first.id).not.toBe(second.id)
  })

  it('follows the focus order close button, content and footer, wrapping around', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Modal isOpen onClose={vi.fn()} title="Edit profile" footer={<button>Save</button>}>
        <input aria-label="Name" />
      </Modal>
    )
    const closeButton = await screen.findByRole('button', { name: 'Fechar modal' })
    expect(closeButton).toHaveFocus()

    await user.tab()
    expect(screen.getByLabelText('Name')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
    await user.tab()
    expect(closeButton).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
  })

  it('closes on Escape only when enabled', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <Modal isOpen onClose={onClose} title="Locked" closeOnEsc={false}>
        <p>content</p>
      </Modal>
    )

    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <Modal isOpen onClose={onClose} title="Backdrop">
        <p>content</p>
      </Modal>
    )
    const dialog = await screen.findByRole('dialog')
    const backdrop = dialog.previousElementSibling as HTMLElement

    await user.click(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses the aria-label fallback when there is no title', async () => {
    renderWithProviders(
      <Modal isOpen onClose={vi.fn()} ariaLabel="Image preview">
        <p>content</p>
      </Modal>
    )

    expect(await screen.findByRole('dialog', { name: 'Image preview' })).toBeInTheDocument()
  })

  it('uses configurable labels from the UI provider', async () => {
    renderWithProviders(
      <Modal isOpen onClose={vi.fn()} title="Custom">
        <p>content</p>
      </Modal>,
      { labels: { closeModal: 'Close dialog' } }
    )

    expect(await screen.findByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })
})

describe('ConfirmModal', () => {
  it('is an alertdialog described by its message, focusing the cancel action first', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ConfirmModal isOpen onClose={onClose} onConfirm={onConfirm} message="Delete this item?" />)

    const dialog = await screen.findByRole('alertdialog', { name: 'Confirmar ação' })
    expect(dialog).toHaveAccessibleDescription('Delete this item?')
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
