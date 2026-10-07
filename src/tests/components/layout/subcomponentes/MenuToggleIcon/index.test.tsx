import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useState } from 'react'

import { MenuToggleIcon } from '@components/layout/subcomponentes/MenuToggleIcon/index.tsx'

const openIcon = (container: HTMLElement) => container.querySelector('[data-icon="menu-open"]')

const hamburgerIcon = (container: HTMLElement) => container.querySelector('.lucide-menu')

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

    expect(openIcon(container)).toBeInTheDocument()
    expect(hamburgerIcon(container)).not.toBeInTheDocument()
    expect(openIcon(container)?.querySelectorAll('path')).toHaveLength(4)
  })

  it('shows the plain hamburger icon when the menu is closed', () => {
    const { container } = renderWithProviders(<MenuToggleIcon open={false} />)

    expect(hamburgerIcon(container)).toBeInTheDocument()
    expect(openIcon(container)).not.toBeInTheDocument()
  })

  it('is decorative and hidden from assistive technology', () => {
    const { container } = renderWithProviders(<MenuToggleIcon open />)

    expect(container.querySelector('span[aria-hidden="true"]')).toContainElement(openIcon(container) as HTMLElement)
  })

  it('swaps the icon when the state changes', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Harness />)

    expect(hamburgerIcon(container)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'alternar' }))
    await waitFor(() => expect(openIcon(container)).toBeInTheDocument())
    expect(hamburgerIcon(container)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'alternar' }))
    await waitFor(() => expect(hamburgerIcon(container)).toBeInTheDocument())
    expect(openIcon(container)).not.toBeInTheDocument()
  })
})
