import { describe, expect, it, vi } from 'vitest'
import { describePortalContainerContract } from '@tests/shared/contracts/portalContainerContract.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { renderHook, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { useEffect, useState } from 'react'
import { axe } from '@tests/axe.ts'

import { Popover } from '@components/common/Popover/index.tsx'
import { usePopoverControl } from '@components/common/Popover/popoverControl.ts'
import { Modal } from '@components/common/Modal/index.tsx'

const content = <button>Dentro</button>

describePortalContainerContract({
  name: 'Popover',
  slot: 'popover-content',
  render: (container) => (
    <Popover open content={content} container={container}>
      <button>Open</button>
    </Popover>
  )
})

describe('Popover', () => {
  it('keeps the content out of the page until it opens and links it to the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Popover content={content} label="Detalhes">
        <button>Abrir</button>
      </Popover>
    )
    const trigger = screen.getByRole('button', { name: 'Abrir' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).not.toHaveAttribute('aria-controls')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(trigger)
    const dialog = await screen.findByRole('dialog', { name: 'Detalhes' })

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', dialog.id)
    expect(dialog.parentElement).toBe(document.body)
  })

  it('works controlled and reports the requested change', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderWithProviders(
      <Popover open={false} onOpenChange={onOpenChange} content={content}>
        <button>Abrir</button>
      </Popover>
    )

    await user.click(screen.getByRole('button', { name: 'Abrir' }))

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens by default with defaultOpen', async () => {
    renderWithProviders(
      <Popover defaultOpen content={content}>
        <button>Abrir</button>
      </Popover>
    )

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('closes with Escape and gives the focus back to the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Popover content={content}>
        <button>Abrir</button>
      </Popover>
    )
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus()
  })

  it('ignores Escape when closeOnEsc is off', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Popover closeOnEsc={false} content={content}>
        <button>Abrir</button>
      </Popover>
    )
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes on a click outside and stays open on a click inside', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <div>
        <Popover content={content}>
          <button>Abrir</button>
        </Popover>
        <p>Fora</p>
      </div>
    )
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await user.click(await screen.findByRole('button', { name: 'Dentro' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByText('Fora'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('moves the focus into the content when opened by keyboard and leaves it on the trigger for a pointer', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Popover content={content}>
        <button>Abrir</button>
      </Popover>
    )
    const trigger = screen.getByRole('button', { name: 'Abrir' })
    trigger.focus()
    await user.keyboard('{Enter}')

    await waitFor(() => expect(screen.getByRole('button', { name: 'Dentro' })).toHaveFocus())

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(trigger)
    await screen.findByRole('dialog')

    expect(trigger).toHaveFocus()
  })

  it('takes the focus to the next element after the trigger when Tab leaves the last element', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <div>
        <Popover content={content}>
          <button>Abrir</button>
        </Popover>
        <button>Depois</button>
      </div>
    )
    screen.getByRole('button', { name: 'Abrir' }).focus()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Dentro' })).toHaveFocus())
    await user.tab()

    await waitFor(() => expect(screen.getByRole('button', { name: 'Depois' })).toHaveFocus())
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('keeps a nested popover and its parent open when clicking inside the child', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Popover
        defaultOpen
        label="Pai"
        content={
          <Popover defaultOpen label="Filho" content={<button>Neto</button>}>
            <button>Abrir filho</button>
          </Popover>
        }
      >
        <button>Abrir pai</button>
      </Popover>
    )
    await user.click(await screen.findByRole('button', { name: 'Neto' }))

    expect(screen.getByRole('dialog', { name: 'Pai' })).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Filho' })).toBeInTheDocument()
  })

  it('closes only the popover with Escape when it is open over a modal, then the modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <Modal isOpen onClose={onClose} title="Modal">
        <Popover label="Pop" content={<button>Dentro</button>}>
          <button>Abrir</button>
        </Popover>
      </Modal>
    )
    await user.click(await screen.findByRole('button', { name: 'Abrir' }))
    await screen.findByRole('dialog', { name: 'Pop' })
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Pop' })).not.toBeInTheDocument())
    expect(onClose).not.toHaveBeenCalled()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes only the popover when its outside click lands on the modal backdrop', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <Modal isOpen onClose={onClose} title="Modal">
        <Popover label="Pop" content={<button>Dentro</button>}>
          <button>Abrir</button>
        </Popover>
      </Modal>
    )
    await user.click(await screen.findByRole('button', { name: 'Abrir' }))
    await screen.findByRole('dialog', { name: 'Pop' })
    const backdrop = document.querySelector('[data-slot="modal-overlay"]') as HTMLElement
    await user.click(backdrop)

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Pop' })).not.toBeInTheDocument())
    expect(onClose).not.toHaveBeenCalled()

    await user.click(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('stays open while the modal opened from it is on top', async () => {
    const user = userEvent.setup()
    const Host = () => {
      const [modal, setModal] = useState(false)

      return (
        <>
          <Popover defaultOpen label="Pop" content={<button onClick={() => setModal(true)}>Abrir modal</button>}>
            <button>Abrir</button>
          </Popover>
          <Modal isOpen={modal} onClose={() => setModal(false)} title="Aberto">
            <p>Conteúdo</p>
          </Modal>
        </>
      )
    }
    renderWithProviders(<Host />)
    await user.click(await screen.findByRole('button', { name: 'Abrir modal' }))
    const modal = await screen.findByRole('dialog', { name: 'Aberto' })
    await user.click(within(modal).getByText('Conteúdo'))

    expect(screen.getByRole('dialog', { name: 'Pop' })).toBeInTheDocument()
  })

  it('names the role of the popup on the trigger', async () => {
    renderWithProviders(
      <Popover role="listbox" content={<ul />}>
        <button>Abrir</button>
      </Popover>
    )

    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('marks the parts with slots and lets the user class and style win', async () => {
    renderWithProviders(
      <Popover defaultOpen arrow className="mine" style={{ color: 'rgb(1, 2, 3)' }} contentClassName="panel" contentStyle={{ color: 'rgb(4, 5, 6)' }} content={content}>
        <button>Abrir</button>
      </Popover>
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveAttribute('data-slot', 'popover-content')
    expect(dialog.className.split(' ').at(-1)).toBe('panel')
    expect(dialog).toHaveStyle({ color: 'rgb(4, 5, 6)' })
    expect(dialog.querySelector('[data-slot="popover-arrow"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="popover-trigger"]')).toHaveClass('mine')
    expect(document.querySelector('[data-slot="popover-trigger"]')).toHaveStyle({ color: 'rgb(1, 2, 3)' })
  })

  it('puts the content in a body of its own and the arrow next to the body, outside the part that scrolls', async () => {
    renderWithProviders(
      <Popover defaultOpen arrow content={content}>
        <button>Abrir</button>
      </Popover>
    )
    const dialog = await screen.findByRole('dialog')
    const body = dialog.querySelector('[data-slot="popover-body"]') as HTMLElement
    const arrow = dialog.querySelector('[data-slot="popover-arrow"]') as HTMLElement

    expect(body.parentElement).toBe(dialog)
    expect(within(body).getByRole('button', { name: 'Dentro' })).toBeInTheDocument()
    expect(arrow.parentElement).toBe(dialog)
    expect(body.contains(arrow)).toBe(false)
  })

  it('moves the focus to the body when the content has nothing to tab to and the popover opens by keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Popover content={<p>Só texto</p>}>
        <button>Abrir</button>
      </Popover>
    )
    screen.getByRole('button', { name: 'Abrir' }).focus()
    await user.keyboard('{Enter}')
    const dialog = await screen.findByRole('dialog')

    await waitFor(() => expect(dialog.querySelector('[data-slot="popover-body"]')).toHaveFocus())
  })

  it('exposes the motion as variables and turns them off with animation false', async () => {
    const { unmount } = renderWithProviders(
      <Popover defaultOpen content={content}>
        <button>Abrir</button>
      </Popover>
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog.style.getPropertyValue('--enchase-popover-duration')).not.toBe('0ms')

    unmount()
    renderWithProviders(
      <Popover defaultOpen animation={false} content={content}>
        <button>Abrir</button>
      </Popover>
    )

    expect((await screen.findByRole('dialog')).style.getPropertyValue('--enchase-popover-duration')).toBe('0ms')
  })

  it('has no axe violations open', async () => {
    const { container } = renderWithProviders(
      <Popover defaultOpen label="Detalhes" content={content}>
        <button>Abrir</button>
      </Popover>
    )
    await screen.findByRole('dialog')

    expect(await axe(document.body)).toHaveNoViolations()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders only the trigger on the server, even when open by default', () => {
    const html = renderToString(
      <Popover defaultOpen label="Detalhes" content={<p>Conteúdo do popover</p>}>
        <button>Abrir</button>
      </Popover>
    )

    expect(html).toContain('Abrir')
    expect(html).toContain('aria-expanded="true"')
    expect(html).not.toContain('Conteúdo do popover')
  })
})

describe('Popover with the menu role', () => {
  const items = (
    <>
      <button role="menuitem" tabIndex={-1}>
        Um
      </button>
      <button role="menuitem" tabIndex={-1}>
        Dois
      </button>
    </>
  )

  const withNeighbours = (
    <div>
      <button>Antes</button>
      <Popover role="menu" label="Ações" content={items}>
        <button>Abrir</button>
      </Popover>
      <button>Depois</button>
    </div>
  )

  it('names the menu on the trigger and on the popup', async () => {
    const user = userEvent.setup()
    renderWithProviders(withNeighbours)
    const trigger = screen.getByRole('button', { name: 'Abrir' })

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')

    await user.click(trigger)

    expect(await screen.findByRole('menu', { name: 'Ações' })).toHaveAttribute('id', trigger.getAttribute('aria-controls'))
  })

  it('does not make the scrolling body focusable, since the items hold the focus', async () => {
    const user = userEvent.setup()
    renderWithProviders(withNeighbours)

    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await screen.findByRole('menu')

    expect(document.querySelector('[data-slot="popover-body"]')).not.toHaveAttribute('tabindex')
  })

  it('closes with Tab from any item and takes the focus to the next element after the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(withNeighbours)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await screen.findByRole('menu')
    screen.getByRole('menuitem', { name: 'Um' }).focus()

    await user.tab()

    await waitFor(() => expect(screen.getByRole('button', { name: 'Depois' })).toHaveFocus())
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('closes with Shift+Tab from any item and gives the focus back to the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(withNeighbours)
    const trigger = screen.getByRole('button', { name: 'Abrir' })

    await user.click(trigger)
    await screen.findByRole('menu')
    screen.getByRole('menuitem', { name: 'Dois' }).focus()

    await user.tab({ shift: true })

    await waitFor(() => expect(trigger).toHaveFocus())
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('keeps a dialog popover open when Shift+Tab leaves its first element, as before', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Popover label="Painel" content={<button>Primeiro</button>}>
        <button>Abrir</button>
      </Popover>
    )
    const trigger = screen.getByRole('button', { name: 'Abrir' })

    trigger.focus()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Primeiro' })).toHaveFocus())
    await user.tab({ shift: true })

    expect(trigger).toHaveFocus()
    expect(screen.getByRole('dialog', { name: 'Painel' })).toBeInTheDocument()
  })
})

describe('the control of a popover for its content', () => {
  const Closer = () => {
    const control = usePopoverControl()

    return <button onClick={() => control?.close()}>Terminar</button>
  }

  it('closes the popover from inside and gives the focus back to the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Popover label="Painel" content={<Closer />}>
        <button>Abrir</button>
      </Popover>
    )
    const trigger = screen.getByRole('button', { name: 'Abrir' })

    await user.click(trigger)
    await user.click(await screen.findByRole('button', { name: 'Terminar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('gives the content its element so it can listen to the keys of the popup', async () => {
    const user = userEvent.setup()
    let seen: HTMLElement | null = null

    const Spy = () => {
      const control = usePopoverControl()

      useEffect(() => {
        seen = control?.contentRef.current ?? null
      }, [control])

      return <button>Dentro</button>
    }

    renderWithProviders(
      <Popover label="Painel" content={<Spy />}>
        <button>Abrir</button>
      </Popover>
    )
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    const dialog = await screen.findByRole('dialog')

    await waitFor(() => expect(seen).toBe(dialog))
  })

  it('is absent outside of a popover', () => {
    const { result } = renderHook(() => usePopoverControl())

    expect(result.current).toBeNull()
  })
})
