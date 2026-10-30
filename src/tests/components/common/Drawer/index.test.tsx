import { describePortalContainerContract } from '@tests/shared/contracts/portalContainerContract.tsx'
import { describeDialogContract } from '@tests/shared/contracts/dialogContract.tsx'
import { ControlledDialog } from '@tests/shared/contracts/dialogHarness.tsx'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { afterEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'
import { useState } from 'react'

import { Drawer } from '@components/common/Drawer/index.tsx'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'
import { ptBR } from '@locales/ptBR.ts'

import type { DialogContractAdapter } from '@tests/shared/contracts/types.ts'

const drawerAdapter: DialogContractAdapter = {
  name: 'Drawer',
  triggerName: 'Open',
  dialogName: 'Filters',
  render: () => (
    <ControlledDialog>
      {({ open, close }) => (
        <Drawer open={open} onClose={close} title="Filters" footer={<button>Apply</button>}>
          <input aria-label="Name" />
        </Drawer>
      )}
    </ControlledDialog>
  )
}

describeDialogContract(drawerAdapter)

describePortalContainerContract({
  name: 'Drawer',
  slot: 'drawer',
  render: (container) => (
    <Drawer open onClose={vi.fn()} title="Inside" container={container}>
      <p>content</p>
    </Drawer>
  )
})

const withoutIds = (html: string) => html.replace(/_r_[a-z0-9]+_/g, '#').replace(/«r[a-z0-9]*»/g, '#').replace(/:r[a-z0-9]*:/g, '#')

const Above = () => {
  useOverlayStack(true)

  return null
}

describe('Drawer', () => {
  it('names the dialog with its title and gives each drawer its own title id', async () => {
    renderWithProviders(
      <>
        <Drawer open onClose={vi.fn()} title="First">
          <p>a</p>
        </Drawer>
        <Drawer open onClose={vi.fn()} title="Second">
          <p>b</p>
        </Drawer>
      </>
    )

    const first = await screen.findByRole('heading', { name: 'First' })
    const second = await screen.findByRole('heading', { name: 'Second' })

    expect(first.id).not.toBe(second.id)
    expect(first.closest('[role="dialog"]')).toHaveAttribute('aria-labelledby', first.id)
  })

  it('uses the aria-label fallback when there is no title', async () => {
    renderWithProviders(
      <Drawer open onClose={vi.fn()} ariaLabel="Navigation menu">
        <p>content</p>
      </Drawer>
    )

    expect(await screen.findByRole('dialog', { name: 'Navigation menu' })).not.toHaveAttribute('aria-labelledby')
  })

  it('follows the focus order close button, content and footer, wrapping around', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Filters" footer={<button>Apply</button>}>
        <input aria-label="Name" />
      </Drawer>
    )
    const closeButton = await screen.findByRole('button', { name: 'Fechar modal' })

    expect(closeButton).toHaveFocus()

    await user.tab()
    expect(screen.getByLabelText('Name')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus()
    await user.tab()
    expect(closeButton).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus()
  })

  it('closes with the close button, which showCloseButton can take away', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { unmount } = renderWithProviders(
      <Drawer open onClose={onClose} title="Close me">
        <p>content</p>
      </Drawer>
    )

    await user.click(await screen.findByRole('button', { name: 'Fechar modal' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    renderWithProviders(
      <Drawer open onClose={onClose} title="No button" showCloseButton={false}>
        <p>content</p>
      </Drawer>
    )

    await screen.findByRole('dialog')

    expect(screen.queryByRole('button', { name: 'Fechar modal' })).not.toBeInTheDocument()
  })

  it('keeps the close button at the end of the header when there is no title', async () => {
    renderWithProviders(
      <Drawer open onClose={vi.fn()} ariaLabel="Untitled">
        <p>content</p>
      </Drawer>
    )

    const header = (await screen.findByRole('button', { name: 'Fechar modal' })).parentElement as HTMLElement

    expect(header).toHaveAttribute('data-slot', 'drawer-header')
    expect(header.children).toHaveLength(1)
  })

  it('uses configurable labels from the UI provider', async () => {
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Custom">
        <p>content</p>
      </Drawer>,
      { labels: { closeModal: 'Close dialog' } }
    )

    expect(await screen.findByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })

  it('closes on Escape unless closeOnEsc is off', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { unmount } = renderWithProviders(
      <Drawer open onClose={onClose} title="Locked" closeOnEsc={false}>
        <p>content</p>
      </Drawer>
    )

    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
    unmount()

    renderWithProviders(
      <Drawer open onClose={onClose} title="Free">
        <p>content</p>
      </Drawer>
    )

    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when the overlay is clicked unless closeOnOverlayClick is off', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { unmount } = renderWithProviders(
      <Drawer open onClose={onClose} title="Overlay">
        <p>content</p>
      </Drawer>
    )

    await user.click((await screen.findByRole('dialog')).previousElementSibling as HTMLElement)

    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    renderWithProviders(
      <Drawer open onClose={onClose} title="Overlay" closeOnOverlayClick={false}>
        <p>content</p>
      </Drawer>
    )

    await user.click((await screen.findByRole('dialog')).previousElementSibling as HTMLElement)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignores a click on the overlay that began over a layer above it', async () => {
    const onClose = vi.fn()
    let showAbove: () => void = () => undefined

    const Harness = () => {
      const [above, setAbove] = useState(false)

      showAbove = () => setAbove(true)

      return (
        <>
          <Drawer open onClose={onClose} title="Below">
            <p>content</p>
          </Drawer>
          {above && <Above />}
        </>
      )
    }

    renderWithProviders(<Harness />)
    const overlay = (await screen.findByRole('dialog')).previousElementSibling as HTMLElement

    act(() => showAbove())
    fireEvent.pointerDown(overlay)
    fireEvent.click(overlay)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes only the top drawer on Escape when drawers are stacked', async () => {
    const user = userEvent.setup()
    const closeBottom = vi.fn()
    const closeTop = vi.fn()

    renderWithProviders(
      <>
        <Drawer open onClose={closeBottom} title="Bottom">
          <p>bottom</p>
        </Drawer>
        <Drawer open onClose={closeTop} title="Top">
          <p>top</p>
        </Drawer>
      </>
    )
    await screen.findAllByRole('dialog', { hidden: true })

    await user.keyboard('{Escape}')

    expect(closeTop).toHaveBeenCalledTimes(1)
    expect(closeBottom).not.toHaveBeenCalled()
  })

  it('merges className and style on the panel and exposes the slots and the state', async () => {
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Slots" className="mine" style={{ color: 'red' }} footer={<button>Ok</button>}>
        <p>content</p>
      </Drawer>
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveClass('mine')
    expect(dialog.style.color).toBe('red')
    expect(dialog).toHaveAttribute('data-slot', 'drawer-panel')
    expect(dialog).toHaveAttribute('data-side', 'start')
    expect(dialog).toHaveAttribute('data-size', 'md')
    expect(dialog.parentElement).toHaveAttribute('data-slot', 'drawer')
    expect(dialog.previousElementSibling).toHaveAttribute('data-slot', 'drawer-overlay')
    expect(screen.getByRole('heading', { name: 'Slots' })).toHaveAttribute('data-slot', 'drawer-title')
    expect(screen.getByRole('button', { name: 'Fechar modal' })).toHaveAttribute('data-slot', 'drawer-close')
    expect(screen.getByText('content').parentElement).toHaveAttribute('data-slot', 'drawer-body')
    expect(screen.getByRole('button', { name: 'Ok' }).parentElement).toHaveAttribute('data-slot', 'drawer-footer')
    await waitFor(() => expect(dialog).toHaveAttribute('data-state', 'open'))
  })

  it('takes the side and the size from their props', async () => {
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Wide" side="end" size="lg">
        <p>content</p>
      </Drawer>
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveAttribute('data-side', 'end')
    expect(dialog).toHaveAttribute('data-size', 'lg')
  })

  it.each([
    ['start', undefined, '-1'],
    ['end', undefined, '1'],
    ['start', 'rtl', '1'],
    ['end', 'rtl', '-1']
  ] as const)('slides in from the %s side of the page in a %s context', async (side, direction, expected) => {
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Slide" side={side}>
        <p>content</p>
      </Drawer>,
      { locale: direction === 'rtl' ? { ...ptBR, dir: 'rtl' } : ptBR }
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog.style.getPropertyValue('--enchase-drawer-dx')).toBe(expected)
    expect(dialog.style.getPropertyValue('--enchase-drawer-dy')).toBe('0')
  })

  it('turns the presence variables to zero when the animation is off', async () => {
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Still" animation={false}>
        <p>content</p>
      </Drawer>
    )
    const dialog = await screen.findByRole('dialog')

    expect(dialog.style.getPropertyValue('--enchase-drawer-duration')).toBe('0ms')
    expect(dialog.style.getPropertyValue('--enchase-drawer-distance')).toBe('0px')
  })

  it('stays mounted while exiting and unmounts after the exit time', async () => {
    const Harness = () => {
      const [open, setOpen] = useState(true)

      return (
        <>
          <button onClick={() => setOpen(false)}>Close</button>
          <Drawer open={open} onClose={() => setOpen(false)} title="Exit">
            <p>content</p>
          </Drawer>
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
        <Drawer open={open} onClose={() => setOpen(false)} title="Again">
          <p>content</p>
        </Drawer>
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

  it('renders an optional prop that is passed as undefined exactly as if it was omitted', async () => {
    const required = { open: true, onClose: vi.fn(), title: 'Same', children: <p>content</p> }

    const explicit = {
      ariaLabel: undefined,
      footer: undefined,
      side: undefined,
      size: undefined,
      showCloseButton: undefined,
      closeOnOverlayClick: undefined,
      closeOnEsc: undefined,
      container: undefined,
      animation: undefined,
      className: undefined,
      style: undefined
    }

    const rendered = async (props: Record<string, unknown>) => {
      const view = renderWithProviders(<Drawer {...required} {...props} />)

      await waitFor(() => expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open'))

      const html = withoutIds((screen.getByRole('dialog').parentElement as HTMLElement).outerHTML)

      view.unmount()

      return html
    }

    const omitted = await rendered({})

    expect(await rendered(explicit)).toBe(omitted)
  })
})

const size = { scroll: 300, client: 300 }

const observers: Array<() => void> = []

class FakeResizeObserver {
  constructor(callback: () => void) {
    observers.push(callback)
  }

  observe() {
    return undefined
  }

  disconnect() {
    return undefined
  }
}

const mockOverflow = (scroll: number, client: number) => {
  size.scroll = scroll
  size.client = client
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => size.scroll)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => size.client)
}

const bodyOf = () => document.querySelector('[data-slot="drawer-body"]') as HTMLElement

const semanticsOf = (element: HTMLElement) => element.getAttributeNames().filter((name) => name === 'tabindex' || name === 'role' || name.startsWith('aria-'))

describe('Drawer body scrolling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    observers.length = 0
  })

  it('has no tab stop, role or label while the content fits', async () => {
    mockOverflow(300, 300)
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Filters">
        <p>content</p>
      </Drawer>
    )
    await screen.findByRole('dialog')

    expect(semanticsOf(bodyOf())).toEqual([])
  })

  it('becomes a focusable region named by the title when the content is taller than the panel', async () => {
    mockOverflow(900, 300)
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Filters">
        <p>content</p>
      </Drawer>
    )

    const region = await screen.findByRole('region', { name: 'Filters' })

    expect(region).toBe(bodyOf())
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toHaveAttribute('aria-labelledby', screen.getByRole('heading', { name: 'Filters' }).id)
    expect(region).not.toHaveAttribute('aria-label')
  })

  it('names the region with the aria label of the drawer when there is no title', async () => {
    mockOverflow(900, 300)
    renderWithProviders(
      <Drawer open onClose={vi.fn()} ariaLabel="Navigation menu">
        <p>content</p>
      </Drawer>
    )

    const region = await screen.findByRole('region', { name: 'Navigation menu' })

    expect(region).toBe(bodyOf())
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toHaveAttribute('aria-label', 'Navigation menu')
    expect(region).not.toHaveAttribute('aria-labelledby')
  })

  it('is only focusable, without a role or a name, when the drawer has neither a title nor an aria label', async () => {
    mockOverflow(900, 300)
    renderWithProviders(
      <Drawer open onClose={vi.fn()}>
        <p>content</p>
      </Drawer>
    )
    await screen.findByRole('dialog')

    expect(semanticsOf(bodyOf())).toEqual(['tabindex'])
    expect(bodyOf()).toHaveAttribute('tabindex', '0')
  })

  it('follows the content as it grows and shrinks', async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    mockOverflow(300, 300)
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Filters">
        <p>content</p>
      </Drawer>
    )
    await screen.findByRole('dialog')

    expect(semanticsOf(bodyOf())).toEqual([])

    size.scroll = 900
    act(() => observers.forEach((measure) => measure()))

    expect(screen.getByRole('region', { name: 'Filters' })).toBe(bodyOf())
    expect(bodyOf()).toHaveAttribute('tabindex', '0')

    size.scroll = 300
    act(() => observers.forEach((measure) => measure()))

    expect(semanticsOf(bodyOf())).toEqual([])
  })

  it('puts the body between the close button and the footer in the focus order only while it scrolls', async () => {
    const user = userEvent.setup()
    mockOverflow(900, 300)
    const { unmount } = renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Filters" footer={<button>Apply</button>}>
        <p>content</p>
      </Drawer>
    )
    const closeButton = await screen.findByRole('button', { name: 'Fechar modal' })

    expect(closeButton).toHaveFocus()

    await user.tab()
    expect(bodyOf()).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus()
    await user.tab()
    expect(closeButton).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus()
    await user.tab({ shift: true })
    expect(bodyOf()).toHaveFocus()
    await user.tab({ shift: true })
    expect(closeButton).toHaveFocus()
    unmount()

    mockOverflow(300, 300)
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Filters" footer={<button>Apply</button>}>
        <p>content</p>
      </Drawer>
    )
    await screen.findByRole('dialog')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Fechar modal' })).toHaveFocus()
    expect(bodyOf()).not.toHaveFocus()
  })

  it('still closes on Escape while the body has the focus', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    mockOverflow(900, 300)
    renderWithProviders(
      <Drawer open onClose={onClose} title="Filters">
        <p>content</p>
      </Drawer>
    )
    await screen.findByRole('dialog')
    await user.tab()

    expect(bodyOf()).toHaveFocus()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['fits', 300],
    ['scrolls', 900]
  ] as const)('has no axe violations when the content %s', async (_, scroll) => {
    mockOverflow(scroll, 300)
    renderWithProviders(
      <Drawer open onClose={vi.fn()} title="Filters" footer={<button>Apply</button>}>
        <p>content</p>
      </Drawer>
    )

    expect(await axe(await screen.findByRole('dialog'))).toHaveNoViolations()
  })
})
