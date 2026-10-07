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

  it('describes its style with data attributes, using the defaults when nothing is given', () => {
    renderWithProviders(<Button>Send</Button>)

    const button = screen.getByRole('button', { name: 'Send' })

    expect(button).toHaveAttribute('data-variant', 'primary')
    expect(button).toHaveAttribute('data-size', 'md')
    expect(button).not.toHaveAttribute('data-full-width')
  })

  it('reflects the variant, the size and the full width it receives', () => {
    renderWithProviders(
      <Button variant="outline" size="lg" fullWidth>
        Send
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Send' })

    expect(button).toHaveAttribute('data-variant', 'outline')
    expect(button).toHaveAttribute('data-size', 'lg')
    expect(button).toHaveAttribute('data-full-width')
  })

  it('does not pass its style props to the element', () => {
    renderWithProviders(
      <Button variant="ghost" size="sm" fullWidth>
        Send
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Send' })

    expect(button).not.toHaveAttribute('variant')
    expect(button).not.toHaveAttribute('size')
    expect(button).not.toHaveAttribute('fullwidth')
  })

  it('keeps the className and the other attributes the caller gives', () => {
    renderWithProviders(
      <Button className="custom" type="submit" aria-label="Enviar formulário">
        Send
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Enviar formulário' })

    expect(button).toHaveClass('custom')
    expect(button.className.split(' ').length).toBeGreaterThan(1)
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('has no axe violations across variants', async () => {
    const { container } = renderWithProviders(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
