import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import { Tooltip } from '@components/common/Tooltip/index.tsx'

const visibleBubble = () => screen.queryByText('Save changes', { selector: '[aria-hidden="true"]' })

describe('Tooltip', () => {
  it('describes the trigger through a hidden tooltip element', () => {
    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    const button = screen.getByRole('button', { name: 'Save' })
    const tooltip = screen.getByRole('tooltip', { hidden: true })

    expect(button).toHaveAttribute('aria-describedby', tooltip.id)
    expect(button).toHaveAccessibleDescription('Save changes')
  })

  it('shows on keyboard focus and hides on blur', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    await user.tab()
    expect(await screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()

    await user.tab()
    await waitFor(() => expect(visibleBubble()).not.toBeInTheDocument())
  })

  it('shows on hover', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    await user.hover(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('stays open while the pointer moves onto the tooltip itself', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    await user.hover(screen.getByRole('button', { name: 'Save' }))
    const bubble = await screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })
    await user.unhover(screen.getByRole('button', { name: 'Save' }))
    await user.hover(bubble)
    await new Promise((resolve) => setTimeout(resolve, 250))

    expect(visibleBubble()).toBeInTheDocument()
  })

  it('dismisses with Escape without moving focus', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    await user.tab()
    await screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })
    await user.keyboard('{Escape}')

    await waitFor(() => expect(visibleBubble()).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
  })

  it('does not add a duplicated description when describe is false', () => {
    renderWithProviders(
      <Tooltip text="Save changes" describe={false}>
        <button aria-label="Save changes">Icon</button>
      </Tooltip>
    )

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Tooltip placement', () => {
  afterEach(() => vi.restoreAllMocks())

  const rect = { top: 100, left: 200, width: 40, height: 20, right: 240, bottom: 120, x: 200, y: 100, toJSON: () => ({}) } as DOMRect

  it('renders the bubble in a portal on the body, outside any clipping container', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <div style={{ overflow: 'hidden' }}>
        <Tooltip text="Save changes">
          <button>Save</button>
        </Tooltip>
      </div>
    )

    await user.hover(screen.getByRole('button', { name: 'Save' }))
    const bubble = await screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })

    expect(container).not.toContainElement(bubble)
    expect(document.body).toContainElement(bubble)
  })

  it.each([
    ['top', { top: '92px', left: '220px' }],
    ['bottom', { top: '128px', left: '220px' }],
    ['left', { top: '110px', left: '192px' }],
    ['right', { top: '110px', left: '248px' }]
  ] as const)('anchors a %s tooltip to the trigger with fixed coordinates', async (position, expected) => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect)
    renderWithProviders(
      <Tooltip text="Save changes" position={position}>
        <button>Save</button>
      </Tooltip>
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Save' }).parentElement as HTMLElement)
    const bubble = await screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })

    expect(bubble).toHaveStyle(expected)
  })

  it('closes when the page scrolls', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    await user.hover(screen.getByRole('button', { name: 'Save' }))
    await screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })
    fireEvent.scroll(window)

    await waitFor(() => expect(visibleBubble()).not.toBeInTheDocument())
  })
})
