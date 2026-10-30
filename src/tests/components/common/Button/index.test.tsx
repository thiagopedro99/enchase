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

  it('reflects the danger variant', () => {
    renderWithProviders(<Button variant="danger">Delete</Button>)

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('data-variant', 'danger')
  })

  it('marks an icon-only button with an attribute, and leaves a button with text without it', () => {
    renderWithProviders(
      <>
        <Button>Send</Button>
        <Button iconOnly aria-label="Add">
          +
        </Button>
      </>
    )

    expect(screen.getByRole('button', { name: 'Send' })).not.toHaveAttribute('data-icon-only')
    expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute('data-icon-only')
  })

  it('does not pass the icon-only prop to the element', () => {
    renderWithProviders(
      <Button iconOnly aria-label="Add">
        +
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Add' })

    expect(button).not.toHaveAttribute('icononly')
    expect(button).not.toHaveAttribute('iconOnly')
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

  it('has no axe violations for the danger variant and for an icon-only button that has a name', async () => {
    const { container } = renderWithProviders(
      <>
        <Button variant="danger">Delete</Button>
        <Button variant="danger" disabled>
          Delete
        </Button>
        <Button variant="ghost" iconOnly aria-label="Add">
          <svg aria-hidden="true" focusable="false" />
        </Button>
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('needs a name from the caller when it has only an icon: without aria-label, axe reports a button with no discernible text', async () => {
    const { container } = renderWithProviders(
      <Button iconOnly>
        <svg aria-hidden="true" focusable="false" />
      </Button>
    )

    const results = await axe(container)

    expect(results.violations.map((violation) => violation.id)).toEqual(['button-name'])
  })
})

describe('Button contract', () => {
  it('marks the root with its slot and keeps the caller className, style and handlers', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(
      <Button className="mine" style={{ color: 'red' }} onClick={onClick}>
        Send
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Send' })

    await user.click(button)

    expect(button).toHaveAttribute('data-slot', 'button')
    expect(button.className.split(' ').at(-1)).toBe('mine')
    expect(button).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a plain button with the press motion marked by an attribute and no inline style', () => {
    renderWithProviders(<Button>Send</Button>)
    const button = screen.getByRole('button', { name: 'Send' })

    expect(button.getAttribute('style')).toBeNull()
    expect(button).toHaveAttribute('data-motion', 'press')
  })

  it('turns the press motion off with animation={false}, mode never or preset off', () => {
    renderWithProviders(<Button animation={false}>Send</Button>)
    renderWithProviders(<Button>Never</Button>, { motion: { mode: 'never' } })
    renderWithProviders(<Button>Off</Button>, { motion: { preset: 'off' } })

    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('data-motion', 'off')
    expect(screen.getByRole('button', { name: 'Never' })).toHaveAttribute('data-motion', 'off')
    expect(screen.getByRole('button', { name: 'Off' })).toHaveAttribute('data-motion', 'off')
  })

  it('maps the animation override to the lift recipe and to css variables', () => {
    renderWithProviders(
      <>
        <Button animation={{ recipe: 'lift', tuning: { distance: 6, duration: 0.3 } }}>Lift</Button>
        <Button animation={{ tuning: { scale: 0.9 } }}>Press</Button>
        <Button animation={{ recipe: 'fade' }}>Fade</Button>
      </>
    )

    const lift = screen.getByRole('button', { name: 'Lift' })
    const press = screen.getByRole('button', { name: 'Press' })

    expect(lift).toHaveAttribute('data-motion', 'lift')
    expect(lift.style.getPropertyValue('--enchase-button-distance')).toBe('6px')
    expect(lift.style.getPropertyValue('--enchase-button-duration')).toBe('300ms')
    expect(press.style.getPropertyValue('--enchase-button-scale')).toBe('0.9')
    expect(screen.getByRole('button', { name: 'Fade' })).toHaveAttribute('data-motion', 'off')
  })

  it('scales the motion variables with the provider preset and recipe tuning', () => {
    renderWithProviders(<Button>Subtle</Button>, { motion: { preset: 'subtle' } })
    renderWithProviders(<Button>Tuned</Button>, { motion: { recipes: { press: { scale: 0.8 } } } })

    expect(screen.getByRole('button', { name: 'Subtle' }).style.getPropertyValue('--enchase-button-duration')).toBe('90ms')
    expect(screen.getByRole('button', { name: 'Tuned' }).style.getPropertyValue('--enchase-button-scale')).toBe('0.8')
  })
})
