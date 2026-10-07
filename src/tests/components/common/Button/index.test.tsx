import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { Button } from '@components/common/Button/index.tsx'

describe('Button', () => {
  it('is focusable and activates with keyboard', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(<Button onClick={onClick}>Send</Button>)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Send' })).toHaveFocus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('does not fire when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(
      <Button onClick={onClick} disabled>
        Send
      </Button>
    )

    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('accepts animation={false} and still renders a working button', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(
      <Button onClick={onClick} animation={false}>
        Send
      </Button>
    )

    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations across variants', async () => {
    const { container } = renderWithProviders(
      <>
        <Button $variant="primary">Primary</Button>
        <Button $variant="secondary">Secondary</Button>
        <Button $variant="outline">Outline</Button>
        <Button $variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
