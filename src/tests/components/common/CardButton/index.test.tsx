import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { CardButton } from '@components/common/CardButton/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Grid } from '@components/common/Grid/index.tsx'

describe('CardButton', () => {
  it('renders a real button that does not submit a form unless told to', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    renderWithProviders(
      <form onSubmit={onSubmit}>
        <CardButton>Plain</CardButton>
        <CardButton type="submit">Send</CardButton>
      </form>
    )

    expect(screen.getByRole('button', { name: 'Plain' })).toHaveAttribute('type', 'button')
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit')

    await user.click(screen.getByRole('button', { name: 'Plain' }))

    expect(onSubmit).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('is reached with the keyboard and activates with Enter and Space', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(<CardButton onClick={onClick}>Open</CardButton>)

    await user.tab()

    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus()

    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('does not fire and leaves the tab order when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(
      <>
        <CardButton onClick={onClick} disabled>
          Soon
        </CardButton>
        <CardButton>Next</CardButton>
      </>
    )

    await user.click(screen.getByRole('button', { name: 'Soon' }))
    await user.tab()

    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Soon' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
  })

  it('takes its name from everything inside it', () => {
    renderWithProviders(
      <CardButton>
        <span>Skills</span> <span>Twelve tools</span>
      </CardButton>
    )

    expect(screen.getByRole('button', { name: 'Skills Twelve tools' })).toBeInTheDocument()
  })

  it('has no axe violations across variants and when disabled', async () => {
    const { container } = renderWithProviders(
      <>
        <CardButton>Default</CardButton>
        <CardButton variant="elevated">Elevated</CardButton>
        <CardButton variant="outlined">Outlined</CardButton>
        <CardButton disabled>Disabled</CardButton>
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('CardButton contract', () => {
  it('marks the root with its own slot and the surface of a Card', () => {
    renderWithProviders(
      <>
        <CardButton variant="outlined" data-testid="tile">
          a
        </CardButton>
        <Card variant="outlined" data-testid="card">
          b
        </Card>
      </>
    )
    const tile = screen.getByTestId('tile')
    const card = screen.getByTestId('card')

    expect(tile).toHaveAttribute('data-slot', 'card-button')
    expect(tile).toHaveAttribute('data-variant', 'outlined')
    expect(tile).toHaveAttribute('data-motion', 'off')
    expect(card.className.split(' ').every((name) => tile.classList.contains(name))).toBe(true)
  })

  it('uses the default variant of the Card when none is given', () => {
    renderWithProviders(<CardButton data-testid="tile">a</CardButton>)

    expect(screen.getByTestId('tile')).toHaveAttribute('data-variant', 'default')
  })

  it('keeps the caller className last and merges the caller style over the padding', () => {
    renderWithProviders(
      <>
        <CardButton padding="2rem" className="mine" data-testid="padded">
          a
        </CardButton>
        <CardButton padding="2rem" style={{ padding: '1px', color: 'red' }} data-testid="styled">
          b
        </CardButton>
      </>
    )

    expect(screen.getByTestId('padded')).toHaveStyle({ padding: '2rem' })
    expect(screen.getByTestId('padded').className.split(' ').at(-1)).toBe('mine')
    expect(screen.getByTestId('styled')).toHaveStyle({ padding: '1px', color: 'rgb(255, 0, 0)' })
  })

  it('lifts only the elevated tile, and animation false or the never mode turn the lift off', () => {
    renderWithProviders(
      <>
        <CardButton variant="elevated" data-testid="lift">
          a
        </CardButton>
        <CardButton variant="default" data-testid="flat">
          b
        </CardButton>
        <CardButton variant="elevated" animation={false} data-testid="off">
          c
        </CardButton>
        <CardButton variant="elevated" animation={{ tuning: { distance: 6, duration: 0.3 } }} data-testid="tuned">
          d
        </CardButton>
      </>
    )

    expect(screen.getByTestId('lift')).toHaveAttribute('data-motion', 'lift')
    expect(screen.getByTestId('flat')).toHaveAttribute('data-motion', 'off')
    expect(screen.getByTestId('off')).toHaveAttribute('data-motion', 'off')
    expect(screen.getByTestId('tuned').style.getPropertyValue('--enchase-card-distance')).toBe('6px')
    expect(screen.getByTestId('tuned').style.getPropertyValue('--enchase-card-duration')).toBe('300ms')
  })

  it('does not lift under the never mode', () => {
    renderWithProviders(
      <CardButton variant="elevated" data-testid="tile">
        a
      </CardButton>,
      { motion: { mode: 'never' } }
    )

    expect(screen.getByTestId('tile')).toHaveAttribute('data-motion', 'off')
  })

  it('runs the click handler of the caller and respects its preventDefault in a form', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(
      <CardButton onClick={onClick} data-testid="tile">
        a
      </CardButton>
    )

    await user.click(screen.getByTestId('tile'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is a tile that sits in a list: a button inside the li of a grid that is a ul', async () => {
    const { container } = renderWithProviders(
      <Grid as="ul" columns={2} aria-label="Skills">
        <li>
          <CardButton>React</CardButton>
        </li>
        <li>
          <CardButton>TypeScript</CardButton>
        </li>
      </Grid>
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['React', 'TypeScript'])
    expect(await axe(container)).toHaveNoViolations()
  })
})
