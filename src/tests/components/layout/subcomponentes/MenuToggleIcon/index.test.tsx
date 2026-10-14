import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useState } from 'react'

import { MenuToggleIcon } from '@components/layout/subcomponentes/MenuToggleIcon/index.tsx'

const active = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="icon-swap-item"][data-state="active"] [data-icon="${name}"]`)

const Harness = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen((current) => !current)}>alternar</button>
      <MenuToggleIcon open={open} />
    </>
  )
}

describe('MenuToggleIcon', () => {
  it('shows the menu-open icon (lines with a left chevron) when the menu is open', () => {
    const { container } = renderWithProviders(<MenuToggleIcon open />)

    expect(active(container, 'menu-open')).toBeInTheDocument()
    expect(active(container, 'menu')).not.toBeInTheDocument()
    expect(container.querySelector('[data-icon="menu-open"]')?.querySelectorAll('path')).toHaveLength(4)
  })

  it('shows the plain hamburger icon when the menu is closed', () => {
    const { container } = renderWithProviders(<MenuToggleIcon open={false} />)

    expect(active(container, 'menu')).toBeInTheDocument()
    expect(active(container, 'menu-open')).not.toBeInTheDocument()
  })

  it('keeps both icons mounted and crossfades them by attribute', () => {
    const { container } = renderWithProviders(<MenuToggleIcon open={false} />)

    expect(container.querySelectorAll('[data-slot="icon-swap-item"]')).toHaveLength(2)
    expect(container.querySelector('[data-slot="icon-swap-item"][data-state="inactive"] [data-icon="menu-open"]')).toBeInTheDocument()
  })

  it('is decorative and hidden from assistive technology', () => {
    const { container } = renderWithProviders(<MenuToggleIcon open />)

    expect(container.querySelector('[data-slot="menu-toggle-icon"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('keeps the caller className', () => {
    const { container } = renderWithProviders(<MenuToggleIcon open className="mine" />)

    expect(container.querySelector('[data-slot="menu-toggle-icon"]')?.className.split(' ')).toContain('mine')
  })

  it('swaps the active icon when the state changes', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Harness />)

    expect(active(container, 'menu')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'alternar' }))

    expect(active(container, 'menu-open')).toBeInTheDocument()
    expect(active(container, 'menu')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'alternar' }))

    expect(active(container, 'menu')).toBeInTheDocument()
    expect(active(container, 'menu-open')).not.toBeInTheDocument()
  })
})
