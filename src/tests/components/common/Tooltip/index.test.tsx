import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { resetTooltipGroup } from '@components/common/Tooltip/defaultData.ts'
import { ptBR } from '@locales/ptBR.ts'

const visibleBubble = () => screen.queryByText('Save changes', { selector: '[aria-hidden="true"]' })

beforeEach(resetTooltipGroup)

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

  const withViewport = () => {
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024)
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768)
  }

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
    withViewport()
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

  it('follows the trigger when the page scrolls instead of closing', async () => {
    withViewport()
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect)
    renderWithProviders(
      <Tooltip text="Save changes" position="bottom">
        <button>Save</button>
      </Tooltip>
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Save' }).parentElement as HTMLElement)
    const bubble = await screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })
    expect(bubble).toHaveStyle({ top: '128px' })

    spy.mockReturnValue({ ...rect, top: 160, bottom: 180, y: 160 } as DOMRect)
    fireEvent.scroll(window)

    await waitFor(() => expect(bubble).toHaveStyle({ top: '188px' }))
    expect(visibleBubble()).toBeInTheDocument()
  })

  it('closes when the trigger scrolls out of view', async () => {
    withViewport()
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect)
    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Save' }).parentElement as HTMLElement)
    await screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })

    spy.mockReturnValue({ ...rect, top: -400, bottom: -380, y: -400 } as DOMRect)
    fireEvent.scroll(window)

    await waitFor(() => expect(visibleBubble()).not.toBeInTheDocument())
  })
})

describe('Tooltip contract', () => {
  const hoverSave = async (user: ReturnType<typeof userEvent.setup>) => user.hover(screen.getByRole('button', { name: 'Save' }))
  const bubbleOf = () => screen.findByText('Save changes', { selector: '[aria-hidden="true"]' })

  it('marks the trigger and the bubble with data-slot and the bubble with position and state', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <Tooltip text="Save changes" position="bottom">
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    const bubble = await bubbleOf()

    expect(container.querySelector('[data-slot="tooltip-trigger"]')).toBeInTheDocument()
    expect(bubble).toHaveAttribute('data-slot', 'tooltip-bubble')
    expect(bubble).toHaveAttribute('data-position', 'bottom')
    await waitFor(() => expect(bubble).toHaveAttribute('data-state', 'open'))
  })

  it('merges className and style on the trigger wrapper and on the bubble', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <Tooltip text="Save changes" className="mine" style={{ color: 'red' }} bubbleClassName="bubble-mine" bubbleStyle={{ letterSpacing: '2px' }}>
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    const bubble = await bubbleOf()
    const wrapper = container.querySelector('[data-slot="tooltip-trigger"]') as HTMLElement

    expect(wrapper).toHaveClass('mine')
    expect(wrapper.className).toContain('wrapper')
    expect(wrapper.style.color).toBe('red')
    expect(bubble).toHaveClass('bubble-mine')
    expect(bubble).toHaveStyle({ letterSpacing: '2px' })
  })

  it.each([
    ['ltr', 'start', 'left'],
    ['ltr', 'end', 'right'],
    ['rtl', 'start', 'right'],
    ['rtl', 'end', 'left']
  ] as const)('maps %s %s to the %s side', async (dir, position, placement) => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes" position={position}>
        <button>Save</button>
      </Tooltip>,
      { locale: { locale: 'x', dir, messages: ptBR.messages } }
    )

    await hoverSave(user)

    expect(await bubbleOf()).toHaveAttribute('data-position', placement)
  })

  it('waits for openDelay before showing', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes" openDelay={150}>
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    expect(visibleBubble()).not.toBeInTheDocument()

    expect(await bubbleOf()).toBeInTheDocument()
  })

  it('opens a second tooltip at once and without animation while another is open', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Tooltip text="First" openDelay={200}>
          <button>One</button>
        </Tooltip>
        <Tooltip text="Second" openDelay={200}>
          <button>Two</button>
        </Tooltip>
      </>
    )

    await user.hover(screen.getByRole('button', { name: 'One' }))
    expect(await screen.findByText('First', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
    await user.hover(screen.getByRole('button', { name: 'Two' }))

    const second = screen.getByText('Second', { selector: '[aria-hidden="true"]' })
    expect(second).toHaveAttribute('data-animation', 'off')
  })

  it('does not open when the pointer leaves before openDelay', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes" openDelay={150}>
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    await user.unhover(screen.getByRole('button', { name: 'Save' }))
    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(visibleBubble()).not.toBeInTheDocument()
  })

  it('honors closeDelay before hiding', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes" closeDelay={400} animation={false}>
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    await bubbleOf()
    await user.unhover(screen.getByRole('button', { name: 'Save' }))
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(visibleBubble()).toBeInTheDocument()

    await waitFor(() => expect(visibleBubble()).not.toBeInTheDocument(), { timeout: 1000 })
  })

  it('turns the transition off with animation false or motion never', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(
      <Tooltip text="Save changes" animation={false}>
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    expect(await bubbleOf()).toHaveAttribute('data-animation', 'off')
    unmount()

    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>,
      { motion: { mode: 'never' } }
    )
    await hoverSave(user)

    expect(await bubbleOf()).toHaveAttribute('data-animation', 'off')
  })

  it('exposes the duration and the pop scale as CSS variables', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes" animation={{ recipe: 'pop', tuning: { duration: 0.4, scale: 0.9 } }}>
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    const bubble = await bubbleOf()

    expect(bubble.style.getPropertyValue('--enchase-tooltip-duration')).toBe('0.4s')
    expect(bubble.style.getPropertyValue('--enchase-tooltip-scale')).toBe('0.9')
  })

  it('enters from a subtle scale by default, with no spring', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    const bubble = await bubbleOf()

    expect(bubble.style.getPropertyValue('--enchase-tooltip-scale')).toBe('0.97')
    expect(bubble.style.getPropertyValue('--enchase-tooltip-duration')).toBe('0.15s')
  })

  it('only fades when the user asks for the fade recipe', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes" animation={{ recipe: 'fade' }}>
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    const bubble = await bubbleOf()

    expect(bubble.style.getPropertyValue('--enchase-tooltip-scale')).toBe('1')
  })

  it('keeps the description wiring off the visual bubble', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tooltip text="Save changes">
        <button>Save</button>
      </Tooltip>
    )

    await hoverSave(user)
    const bubble = await bubbleOf()

    expect(bubble).not.toHaveAttribute('id')
    expect(bubble).not.toHaveAttribute('role')
  })
})
