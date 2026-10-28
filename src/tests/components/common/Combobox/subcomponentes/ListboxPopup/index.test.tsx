import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ListboxPopup } from '@components/common/Combobox/subcomponentes/ListboxPopup/index.tsx'

import type { ComponentProps } from 'react'

type Props = Partial<ComponentProps<typeof ListboxPopup>>

const Harness = ({ open = true, onClose = vi.fn(), ...props }: Props) => {
  const anchor = useRef<HTMLDivElement>(null)

  return (
    <>
      <div ref={anchor} data-testid="anchor">
        <button>Inside</button>
      </div>
      <p>Outside</p>
      <ListboxPopup open={open} anchorRef={anchor} id="list" multiple={false} busy={false} onClose={onClose} {...props}>
        <div role="option" aria-selected="false">
          One
        </div>
      </ListboxPopup>
    </>
  )
}

const listbox = () => screen.getByRole('listbox')

describe('ListboxPopup', () => {
  it('renders nothing while it is closed, and the list with its children when it opens', async () => {
    const user = userEvent.setup()
    const Toggle = () => {
      const [open, setOpen] = useState(false)

      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Harness open={open} />
        </>
      )
    }
    renderWithProviders(<Toggle />)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open' }))

    expect(listbox()).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'One' })).toBeInTheDocument()
  })

  it('is a listbox with the id it is given, in the body, with its children', () => {
    renderWithProviders(<Harness />)

    expect(listbox()).toHaveAttribute('id', 'list')
    expect(listbox().parentElement).toBe(document.body)
    expect(screen.getByRole('option', { name: 'One' })).toBeInTheDocument()
  })

  it('is named by the element it is labelled by, or else by its own label', () => {
    const { unmount } = renderWithProviders(
      <>
        <span id="name">Fruit</span>
        <Harness labelledBy="name" label="ignored" />
      </>
    )

    expect(listbox()).toHaveAccessibleName('Fruit')
    unmount()
    renderWithProviders(<Harness label="Own name" />)

    expect(listbox()).toHaveAccessibleName('Own name')
  })

  it('marks the list as multiselectable and busy only when it is', () => {
    const { unmount } = renderWithProviders(<Harness />)

    expect(listbox()).not.toHaveAttribute('aria-multiselectable')
    expect(listbox()).not.toHaveAttribute('aria-busy')
    unmount()
    renderWithProviders(<Harness multiple busy />)

    expect(listbox()).toHaveAttribute('aria-multiselectable', 'true')
    expect(listbox()).toHaveAttribute('aria-busy', 'true')
  })

  it('marks itself with a data-slot, and merges the class and the style of the caller last', () => {
    renderWithProviders(<Harness className="mine" style={{ minInlineSize: '12rem' }} />)

    expect(listbox()).toHaveAttribute('data-slot', 'combobox-listbox')
    expect(listbox().className.split(' ').at(-1)).toBe('mine')
    expect(listbox().style.minInlineSize).toBe('12rem')
  })

  it('keeps the focus where it is when the list is pressed with the mouse, wherever on it', () => {
    renderWithProviders(<Harness />)

    expect(fireEvent.mouseDown(listbox())).toBe(false)
    expect(fireEvent.mouseDown(screen.getByRole('option', { name: 'One' }))).toBe(false)
  })

  it('takes the direction of the provider, since it lives outside the page that sets it', () => {
    renderWithProviders(<Harness />)

    expect(listbox()).toHaveAttribute('dir', 'ltr')
  })

  it('goes into the element it is given as container', () => {
    const host = document.createElement('div')

    document.body.append(host)
    renderWithProviders(<Harness container={host} />)

    return waitFor(() => expect(listbox().parentElement).toBe(host)).finally(() => host.remove())
  })

  it('closes with Escape, and not when Escape was already handled', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<Harness onClose={onClose} />)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true }))
    expect(onClose).toHaveBeenCalledTimes(1)

    const handled = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true })

    handled.preventDefault()
    document.dispatchEvent(handled)
    await user.keyboard('a')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on a press outside, and not on a press in the anchor or in the list', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<Harness onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Inside' }))
    await user.click(screen.getByRole('option', { name: 'One' }))
    expect(onClose).not.toHaveBeenCalled()

    await user.click(screen.getByText('Outside'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not listen while it is closed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<Harness open={false} onClose={onClose} />)

    await user.click(screen.getByText('Outside'))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('lets only the layer on top react, when two are open', async () => {
    const user = userEvent.setup()
    const first = vi.fn()
    const second = vi.fn()
    renderWithProviders(
      <>
        <Harness onClose={first} />
        <Harness onClose={second} />
      </>
    )

    await user.click(screen.getAllByText('Outside')[0])
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalled()
  })

  it('sets a position on the list once it is laid out, and the width of the anchor for it to start from', async () => {
    renderWithProviders(<Harness />)

    await waitFor(() => expect(listbox().style.getPropertyValue('--combobox-anchor-width')).not.toBe(''))
    expect(listbox().style.left).not.toBe('')
    expect(listbox().style.top).not.toBe('')
  })

  it('is mounted again when it reopens', async () => {
    const user = userEvent.setup()
    const Toggle = () => {
      const [open, setOpen] = useState(true)

      return (
        <>
          <button onClick={() => setOpen((value) => !value)}>Toggle</button>
          <Harness open={open} />
        </>
      )
    }
    renderWithProviders(<Toggle />)
    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Toggle' }))

    expect(listbox()).toBeInTheDocument()
  })
})
