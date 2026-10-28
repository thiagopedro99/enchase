import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Slider } from '@components/common/Slider/index.tsx'

const rect = (left: number, width: number) => ({ left, width, right: left + width, top: 0, bottom: 4, height: 4, x: left, y: 0, toJSON: () => ({}) })

const thumb = () => screen.getByRole('slider')

const value = () => Number(thumb().getAttribute('aria-valuenow'))

const control = (container: HTMLElement) => container.querySelector('[data-slot="slider-control"]') as HTMLElement

const track = (container: HTMLElement) => container.querySelector('[data-slot="slider-track"]') as HTMLElement

const styles: HTMLStyleElement[] = []

const rtl = () => {
  const element = document.createElement('style')

  element.textContent = '[data-slot^="slider"] { direction: rtl; }'
  document.head.append(element)
  styles.push(element)
}

afterEach(() => {
  styles.splice(0).forEach((element) => element.remove())
})

describe('Slider', () => {
  it('exposes a slider with the range, the value and a name', () => {
    renderWithProviders(<Slider ariaLabel="Volume" defaultValue={30} />)

    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
    expect(thumb()).toHaveAttribute('aria-valuemin', '0')
    expect(thumb()).toHaveAttribute('aria-valuemax', '100')
    expect(thumb()).toHaveAttribute('aria-valuenow', '30')
    expect(thumb()).not.toHaveAttribute('aria-valuetext')
    expect(thumb()).toHaveAttribute('tabindex', '0')
  })

  it('starts at the minimum when there is no default value', () => {
    renderWithProviders(<Slider ariaLabel="Volume" min={10} max={50} />)

    expect(value()).toBe(10)
  })

  it('takes its name from the visible label and from aria-labelledby, together', () => {
    renderWithProviders(
      <>
        <h2 id="outside">Audio</h2>
        <Slider label="Volume" aria-labelledby="outside" />
      </>
    )

    expect(screen.getByRole('slider', { name: 'Volume Audio' })).toBeInTheDocument()
    expect(screen.getByText('Volume').tagName).toBe('SPAN')
  })

  it('reads the value to screen readers with the formatted text when there is a formatter', () => {
    renderWithProviders(<Slider ariaLabel="Volume" defaultValue={40} formatValue={(current) => `${current} percent`} />)

    expect(thumb()).toHaveAttribute('aria-valuetext', '40 percent')
  })

  it('shows the formatted value, hidden from screen readers, when asked', () => {
    renderWithProviders(<Slider label="Volume" defaultValue={40} showValue formatValue={(current) => `${current}%`} />)

    expect(screen.getByText('40%')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('40%')).toHaveAttribute('data-slot', 'slider-value')
  })

  it('moves with the arrow keys by one step, and up and down mean more and less', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Slider ariaLabel="Volume" defaultValue={50} step={5} onValueChange={onValueChange} />)

    thumb().focus()
    await user.keyboard('{ArrowRight}{ArrowUp}')
    expect(value()).toBe(60)

    await user.keyboard('{ArrowLeft}{ArrowDown}{ArrowDown}')
    expect(value()).toBe(45)
    expect(onValueChange.mock.calls.map(([next]) => next)).toEqual([55, 60, 55, 50, 45])
  })

  it('goes to the ends with Home and End and by a tenth of the range with PageUp and PageDown', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Slider ariaLabel="Volume" defaultValue={50} />)

    thumb().focus()
    await user.keyboard('{PageUp}')
    expect(value()).toBe(60)

    await user.keyboard('{PageDown}{PageDown}')
    expect(value()).toBe(40)

    await user.keyboard('{End}')
    expect(value()).toBe(100)

    await user.keyboard('{Home}')
    expect(value()).toBe(0)
  })

  it('stops at the ends and does not report a change when it cannot move', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Slider ariaLabel="Volume" defaultValue={99} onValueChange={onValueChange} />)

    thumb().focus()
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')

    expect(value()).toBe(100)
    expect(onValueChange.mock.calls).toEqual([[100]])
  })

  it('inverts the left and right arrows in a right-to-left page', async () => {
    rtl()
    const user = userEvent.setup()
    renderWithProviders(<Slider ariaLabel="Volume" defaultValue={50} />)

    thumb().focus()
    await user.keyboard('{ArrowRight}')
    expect(value()).toBe(49)

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(value()).toBe(51)
  })

  it('adds fractional steps without drifting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Slider ariaLabel="Opacity" min={0} max={1} step={0.1} />)

    thumb().focus()
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')

    expect(value()).toBe(0.3)

    await user.keyboard('{End}')
    expect(value()).toBe(1)
  })

  it('stops at the last step that fits when the maximum is not a multiple of the step', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Slider ariaLabel="Level" min={0} max={10} step={3} />)

    thumb().focus()
    await user.keyboard('{End}')

    expect(value()).toBe(9)
    expect(thumb()).toHaveAttribute('aria-valuemax', '10')
  })

  it('shows a value that is not on a step, or outside the range, on the nearest step inside', () => {
    const { unmount } = renderWithProviders(<Slider ariaLabel="Level" min={0} max={100} step={10} defaultValue={34} />)

    expect(value()).toBe(30)
    unmount()

    renderWithProviders(<Slider ariaLabel="Level" min={0} max={100} value={250} onValueChange={() => undefined} />)

    expect(value()).toBe(100)
  })

  it('follows the value prop when controlled and reports each change', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    const Controlled = () => {
      const [level, setLevel] = useState(20)

      return (
        <Slider
          ariaLabel="Volume"
          value={level}
          onValueChange={(next) => {
            onValueChange(next)
            setLevel(next)
          }}
        />
      )
    }

    renderWithProviders(<Controlled />)

    thumb().focus()
    await user.keyboard('{ArrowRight}{End}')

    expect(value()).toBe(100)
    expect(onValueChange.mock.calls).toEqual([[21], [100]])
  })

  it('stays put when controlled and the owner refuses the change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Slider ariaLabel="Volume" value={20} onValueChange={() => undefined} />)

    thumb().focus()
    await user.keyboard('{ArrowRight}{End}')

    expect(value()).toBe(20)
  })

  it('sets the value where the pointer goes down and follows it while it is dragged', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = renderWithProviders(<Slider ariaLabel="Volume" onValueChange={onValueChange} />)

    vi.spyOn(track(container), 'getBoundingClientRect').mockReturnValue(rect(100, 200))
    await user.pointer([{ keys: '[MouseLeft>]', target: control(container), coords: { clientX: 200 } }])

    expect(value()).toBe(50)
    expect(thumb()).toHaveFocus()
    expect(container.querySelector('[data-slot="slider"]')).toHaveAttribute('data-dragging')

    await user.pointer({ coords: { clientX: 250 } })
    expect(value()).toBe(75)

    await user.pointer({ coords: { clientX: 900 } })
    expect(value()).toBe(100)

    await user.pointer({ keys: '[/MouseLeft]' })
    expect(container.querySelector('[data-slot="slider"]')).not.toHaveAttribute('data-dragging')

    await user.pointer({ coords: { clientX: 150 } })
    expect(value()).toBe(100)
    expect(onValueChange.mock.calls.map(([next]) => next)).toEqual([50, 75, 100])
  })

  it('snaps what the pointer sets to the step', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Slider ariaLabel="Volume" step={10} />)

    vi.spyOn(track(container), 'getBoundingClientRect').mockReturnValue(rect(0, 200))
    await user.pointer([{ keys: '[MouseLeft]', target: control(container), coords: { clientX: 61 } }])

    expect(value()).toBe(30)
  })

  it('maps the pointer from the right edge in a right-to-left page', async () => {
    rtl()
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Slider ariaLabel="Volume" />)

    vi.spyOn(track(container), 'getBoundingClientRect').mockReturnValue(rect(0, 200))
    await user.pointer([{ keys: '[MouseLeft]', target: control(container), coords: { clientX: 150 } }])

    expect(value()).toBe(25)
  })

  it('ignores the secondary mouse buttons', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Slider ariaLabel="Volume" />)

    vi.spyOn(track(container), 'getBoundingClientRect').mockReturnValue(rect(0, 200))
    await user.pointer([{ keys: '[MouseRight]', target: control(container), coords: { clientX: 150 } }])

    expect(value()).toBe(0)
  })

  it('does nothing when it is disabled and cannot take the focus', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = renderWithProviders(<Slider ariaLabel="Volume" defaultValue={10} disabled onValueChange={onValueChange} />)

    vi.spyOn(track(container), 'getBoundingClientRect').mockReturnValue(rect(0, 200))
    await user.pointer([{ keys: '[MouseLeft]', target: control(container), coords: { clientX: 150 } }])
    await user.tab()
    await user.keyboard('{ArrowRight}{End}')

    expect(value()).toBe(10)
    expect(thumb()).toHaveAttribute('aria-disabled', 'true')
    expect(thumb()).not.toHaveAttribute('tabindex')
    expect(thumb()).not.toHaveFocus()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('submits the value with a form when it has a name', () => {
    renderWithProviders(
      <form aria-label="Settings">
        <Slider ariaLabel="Volume" name="volume" defaultValue={35} />
      </form>
    )

    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('volume')).toBe('35')
  })

  it('does not submit the value of a disabled slider, as a native control would not', () => {
    renderWithProviders(
      <form aria-label="Settings">
        <Slider ariaLabel="Volume" name="volume" defaultValue={35} disabled />
      </form>
    )

    expect(new FormData(screen.getByRole('form') as HTMLFormElement).has('volume')).toBe(false)
  })

  it('shows the minimum for a value that is not a number', () => {
    renderWithProviders(<Slider ariaLabel="Volume" min={5} value={Number.NaN} onValueChange={() => undefined} />)

    expect(value()).toBe(5)
    expect(thumb()).toHaveAttribute('aria-valuenow', '5')
  })

  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <Slider ariaLabel="Plain" />
        <Slider label="With label and value" defaultValue={40} showValue formatValue={(current) => `${current}%`} />
        <Slider ariaLabel="Disabled" defaultValue={10} disabled />
        <Slider ariaLabel="Fractions" min={0} max={1} step={0.25} defaultValue={0.5} />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Slider with a touch pointer', () => {
  const finger = (clientX: number, clientY = 20) => ({ pointerType: 'touch', pointerId: 5, clientX, clientY, button: 0 })

  const setup = (onValueChange?: (value: number) => void) => {
    const view = renderWithProviders(<Slider ariaLabel="Volume" onValueChange={onValueChange} />)

    vi.spyOn(track(view.container), 'getBoundingClientRect').mockReturnValue(rect(0, 200))

    return { target: control(view.container), root: view.container.querySelector('[data-slot="slider"]') as HTMLElement }
  }

  it('sets the value of a tap where the finger is lifted, and not before', () => {
    const { target, root } = setup()

    fireEvent.pointerDown(target, finger(100))
    expect(value()).toBe(0)
    expect(root).not.toHaveAttribute('data-dragging')

    fireEvent.pointerUp(target, finger(100))
    expect(value()).toBe(50)
    expect(thumb()).toHaveFocus()
    expect(root).not.toHaveAttribute('data-dragging')
  })

  it('leaves the value alone when the finger goes up or down, which scrolls the page, and the touch is cancelled', () => {
    const onValueChange = vi.fn()
    const { target, root } = setup(onValueChange)

    fireEvent.pointerDown(target, finger(100, 20))
    fireEvent.pointerMove(target, finger(108, 60))
    fireEvent.pointerMove(target, finger(110, 120))
    fireEvent.pointerCancel(target, finger(110, 120))

    expect(value()).toBe(0)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(thumb()).not.toHaveFocus()
    expect(root).not.toHaveAttribute('data-dragging')
  })

  it('follows a finger that goes across, from the first move past the slop on', () => {
    const onValueChange = vi.fn()
    const { target, root } = setup(onValueChange)

    fireEvent.pointerDown(target, finger(100))
    fireEvent.pointerMove(target, finger(103))
    expect(value()).toBe(0)

    fireEvent.pointerMove(target, finger(120, 26))
    expect(value()).toBe(60)
    expect(root).toHaveAttribute('data-dragging')
    expect(thumb()).toHaveFocus()

    fireEvent.pointerMove(target, finger(180, 28))
    expect(value()).toBe(90)

    fireEvent.pointerUp(target, finger(180, 28))
    expect(root).not.toHaveAttribute('data-dragging')
    expect(onValueChange.mock.calls.map(([next]) => next)).toEqual([60, 90])
  })

  it('does not take a second finger while the first is down', () => {
    const { target } = setup()

    fireEvent.pointerDown(target, finger(100))
    fireEvent.pointerDown(target, { ...finger(180), pointerId: 6 })
    fireEvent.pointerUp(target, { ...finger(180), pointerId: 6 })
    expect(value()).toBe(0)

    fireEvent.pointerUp(target, finger(100))
    expect(value()).toBe(50)
  })

  it('moves at once with a mouse or a pen, which have no scroll to wait for', () => {
    const { target } = setup()

    fireEvent.pointerDown(target, { pointerType: 'pen', pointerId: 9, clientX: 150, clientY: 20, button: 0 })
    expect(value()).toBe(75)
  })
})

describe('Slider contract', () => {
  it('marks the root and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Slider label="Volume" showValue />)

    for (const part of ['slider', 'slider-header', 'slider-label', 'slider-value', 'slider-control', 'slider-track', 'slider-range', 'slider-thumb']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('draws the filled part and the thumb at the position of the value, from the start edge', () => {
    const { container } = renderWithProviders(<Slider ariaLabel="Volume" min={0} max={200} defaultValue={50} />)

    expect((container.querySelector('[data-slot="slider-range"]') as HTMLElement).style.inlineSize).toBe('25%')
    expect((thumb().parentElement as HTMLElement).style.insetInlineStart).toBe('25%')
  })

  it('has no header when there is neither a label nor a value to show', () => {
    const { container } = renderWithProviders(<Slider ariaLabel="Volume" />)

    expect(container.querySelector('[data-slot="slider-header"]')).not.toBeInTheDocument()
  })

  it('forwards the ref to the root and keeps className and style with the caller last', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = renderWithProviders(<Slider ariaLabel="Volume" ref={ref} className="mine" style={{ margin: '3px' }} />)
    const root = container.querySelector('[data-slot="slider"]') as HTMLElement

    expect(ref.current).toBe(root)
    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.style.margin).toBe('3px')
  })

  it('passes other attributes to the root and does not pass its own props to the page', () => {
    const { container } = renderWithProviders(<Slider ariaLabel="Volume" data-testid="slider" min={1} max={9} step={2} defaultValue={3} onValueChange={() => undefined} showValue name="v" animation={false} />)
    const root = container.querySelector('[data-slot="slider"]') as HTMLElement

    expect(screen.getByTestId('slider')).toBe(root)

    for (const name of ['arialabel', 'min', 'max', 'step', 'value', 'defaultvalue', 'onvaluechange', 'showvalue', 'name', 'animation', 'formatvalue', 'label']) {
      expect(root, name).not.toHaveAttribute(name)
    }
  })

  it('flags the disabled state on the root', () => {
    const { container, unmount } = renderWithProviders(<Slider ariaLabel="Volume" />)

    expect(container.querySelector('[data-slot="slider"]')).not.toHaveAttribute('data-disabled')
    unmount()

    const disabled = renderWithProviders(<Slider ariaLabel="Volume" disabled />)

    expect(disabled.container.querySelector('[data-slot="slider"]')).toHaveAttribute('data-disabled')
  })

  it('sets the motion variables on the root and drops them for animation={false}', () => {
    const { container, unmount } = renderWithProviders(<Slider ariaLabel="Volume" />)
    const duration = () => (container.querySelector('[data-slot="slider"]') as HTMLElement).style.getPropertyValue('--enchase-slider-duration')

    expect(duration()).not.toBe('')
    expect(duration()).not.toBe('0ms')
    unmount()

    const off = renderWithProviders(<Slider ariaLabel="Volume" animation={false} />)

    expect((off.container.querySelector('[data-slot="slider"]') as HTMLElement).style.getPropertyValue('--enchase-slider-duration')).toBe('0ms')
  })
})
