import { describePortalContainerContract } from '@tests/shared/contracts/portalContainerContract.tsx'
import { describeDialogContract } from '@tests/shared/contracts/dialogContract.tsx'
import { ControlledDialog } from '@tests/shared/contracts/dialogHarness.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'

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

describePortalContainerContract({
  name: 'Modal',
  slot: 'modal',
  render: (container) => (
    <Modal isOpen onClose={vi.fn()} title="Inside" container={container}>
      <p>content</p>
    </Modal>
  )
})

describePortalContainerContract({
  name: 'ConfirmModal',
  slot: 'modal',
  render: (container) => <ConfirmModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} message="Delete this item?" container={container} />
})

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

describe('Modal contract', () => {
  it('merges className and style on the panel and exposes the slots and state', async () => {
    renderWithProviders(
      <Modal isOpen onClose={vi.fn()} title="Slots" className="mine" style={{ color: 'red' }} footer={<button>Ok</button>}>
        <p>content</p>
      </Modal>
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveClass('mine')
    expect(dialog.style.color).toBe('red')
    expect(dialog).toHaveAttribute('data-slot', 'modal-panel')
    expect(dialog).toHaveAttribute('data-size', 'md')
    expect(dialog.previousElementSibling).toHaveAttribute('data-slot', 'modal-overlay')
    expect(screen.getByRole('heading', { name: 'Slots' })).toHaveAttribute('data-slot', 'modal-title')
    expect(screen.getByRole('button', { name: 'Fechar modal' })).toHaveAttribute('data-slot', 'modal-close')
    await waitFor(() => expect(dialog).toHaveAttribute('data-state', 'open'))
  })

  it('turns the presence variables to zero when the animation is off', async () => {
    renderWithProviders(
      <Modal isOpen onClose={vi.fn()} title="Still" animation={false}>
        <p>content</p>
      </Modal>
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog.style.getPropertyValue('--enchase-modal-duration')).toBe('0ms')
    expect(dialog.style.getPropertyValue('--enchase-modal-distance')).toBe('0px')
    expect(dialog.style.getPropertyValue('--enchase-modal-scale')).toBe('1')
  })

  it('scales in from the centre with the spring duration, without travelling, by default', async () => {
    renderWithProviders(
      <Modal isOpen onClose={vi.fn()} title="Pop">
        <p>content</p>
      </Modal>
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog.style.getPropertyValue('--enchase-modal-duration')).toBe('var(--enchase-motion-spring-gentle-duration)')
    expect(dialog.style.getPropertyValue('--enchase-modal-exit-duration')).toBe('calc(var(--enchase-motion-spring-gentle-duration) * 0.5)')
    expect(dialog.style.getPropertyValue('--enchase-modal-distance')).toBe('0px')
    expect(dialog.style.getPropertyValue('--enchase-modal-scale')).toBe('0.96')
  })

  it('stays mounted while exiting and unmounts after the exit time', async () => {
    const Harness = () => {
      const [open, setOpen] = useState(true)

      return (
        <>
          <button onClick={() => setOpen(false)}>Close</button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="Exit">
            <p>content</p>
          </Modal>
        </>
      )
    }
    renderWithProviders(<Harness />)
    await screen.findByRole('dialog')

    await act(async () => {
      document.querySelector<HTMLButtonElement>('button')?.click()
    })

    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('data-state', 'exiting')
    await waitFor(() => expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument(), { timeout: 2000 })
  })

  it('reopens in the middle of the exit without losing the dialog', async () => {
    let setOpenOutside: (open: boolean) => void = () => undefined
    const Harness = () => {
      const [open, setOpen] = useState(true)
      setOpenOutside = setOpen

      return (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Again">
          <p>content</p>
        </Modal>
      )
    }
    renderWithProviders(<Harness />)
    await screen.findByRole('dialog')

    act(() => setOpenOutside(false))
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('data-state', 'exiting')
    act(() => setOpenOutside(true))

    await waitFor(() => expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open'))
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })

  it('closes only the top modal on Escape when modals are stacked', async () => {
    const user = userEvent.setup()
    const closeBottom = vi.fn()
    const closeTop = vi.fn()
    render(
      <>
        <Modal isOpen onClose={closeBottom} title="Bottom">
          <p>bottom</p>
        </Modal>
        <Modal isOpen onClose={closeTop} title="Top">
          <p>top</p>
        </Modal>
      </>
    )
    await screen.findAllByRole('dialog', { hidden: true })

    await user.keyboard('{Escape}')

    expect(closeTop).toHaveBeenCalledTimes(1)
    expect(closeBottom).not.toHaveBeenCalled()
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
