import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { useSlider } from '@components/common/Slider/useSlider.ts'

import type { UseSliderOptions } from '@components/common/Slider/types.ts'
import type { RefObject } from 'react'

interface ShellProps extends UseSliderOptions {
  controlProps?: Record<string, unknown>
  trackProps?: Record<string, unknown>
  thumbProps?: Record<string, unknown>
}

const rect = (left: number, width: number) => ({ left, width, right: left + width, top: 0, bottom: 4, height: 4, x: left, y: 0, toJSON: () => ({}) })

const finger = (clientX: number, clientY = 20) => ({ pointerType: 'touch', pointerId: 5, clientX, clientY, button: 0 })

const Shell = ({ controlProps, trackProps, thumbProps, ...options }: ShellProps) => {
  const slider = useSlider(options)

  return (
    <div data-testid="root" data-dragging={slider.dragging ? '' : undefined} data-pointer-focus={slider.pointerFocus ? '' : undefined}>
      <div {...slider.getControlProps({ 'data-testid': 'control', ...controlProps })}>
        <div {...slider.getTrackProps({ 'data-testid': 'track', ...trackProps })}>
          <div {...slider.getThumbProps({ 'aria-label': 'Volume', ...thumbProps })} />
        </div>
      </div>

      <output>{slider.valueText}</output>
    </div>
  )
}

const Controlled = ({ onValueChange }: { onValueChange: (value: number) => void }) => {
  const [value, setValue] = useState(20)

  return (
    <>
      <button type="button" onClick={() => setValue(80)}>
        jump
      </button>

      <Shell value={value} onValueChange={onValueChange} />
    </>
  )
}

const thumb = () => screen.getByRole('slider')

const value = () => Number(thumb().getAttribute('aria-valuenow'))

const control = () => screen.getByTestId('control')

const mount = (props: ShellProps = {}) => {
  const view = render(<Shell {...props} />)

  vi.spyOn(screen.getByTestId('track'), 'getBoundingClientRect').mockReturnValue(rect(0, 200))

  return view
}

describe('useSlider', () => {
  it('exposes a slider with the range, the value and the text', () => {
    render(<Shell defaultValue={30} />)

    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
    expect(thumb()).toHaveAttribute('aria-valuemin', '0')
    expect(thumb()).toHaveAttribute('aria-valuemax', '100')
    expect(thumb()).toHaveAttribute('aria-valuenow', '30')
    expect(thumb()).toHaveAttribute('tabindex', '0')
    expect(thumb()).not.toHaveAttribute('aria-disabled')
    expect(thumb()).not.toHaveAttribute('aria-valuetext')
    expect(screen.getByRole('status')).toHaveTextContent('30')
  })

  it('reads the value to screen readers with the formatted text when there is a formatter', () => {
    render(<Shell defaultValue={30} formatValue={(next) => `${next}%`} />)

    expect(thumb()).toHaveAttribute('aria-valuetext', '30%')
    expect(screen.getByRole('status')).toHaveTextContent('30%')
  })

  it('starts at the minimum, shows a value that is not a number at the minimum and keeps the value on a step inside the range', () => {
    expect(renderHook(() => useSlider({ min: 10 })).result.current.value).toBe(10)
    expect(renderHook(() => useSlider({ value: Number.NaN, min: 5 })).result.current.value).toBe(5)
    expect(renderHook(() => useSlider({ defaultValue: 250 })).result.current.value).toBe(100)
    expect(renderHook(() => useSlider({ defaultValue: 33, step: 10 })).result.current.value).toBe(30)
    expect(renderHook(() => useSlider({ defaultValue: 37, min: 20, max: 50, step: 7 })).result.current.value).toBe(34)
  })

  it('tells the position of the value in the range, in percent', () => {
    expect(renderHook(() => useSlider({ defaultValue: 25 })).result.current.percent).toBe(25)
    expect(renderHook(() => useSlider({ defaultValue: 30, min: 20, max: 40 })).result.current.percent).toBe(50)
    expect(renderHook(() => useSlider({ min: 10, max: 10 })).result.current.percent).toBe(0)
  })

  it('moves with the arrow keys by one step, and up and down mean more and less', async () => {
    const user = userEvent.setup()

    render(<Shell defaultValue={50} step={5} />)
    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(value()).toBe(55)

    await user.keyboard('{ArrowUp}')

    expect(value()).toBe(60)

    await user.keyboard('{ArrowLeft}')

    expect(value()).toBe(55)

    await user.keyboard('{ArrowDown}')

    expect(value()).toBe(50)
  })

  it('goes to the ends with Home and End and by a tenth of the range with PageUp and PageDown', async () => {
    const user = userEvent.setup()

    render(<Shell defaultValue={50} />)
    await user.tab()
    await user.keyboard('{PageUp}')

    expect(value()).toBe(60)

    await user.keyboard('{PageDown}{PageDown}')

    expect(value()).toBe(40)

    await user.keyboard('{End}')

    expect(value()).toBe(100)

    await user.keyboard('{Home}')

    expect(value()).toBe(0)
  })

  it('adds fractional steps without drifting, and stops at the last step that fits', async () => {
    const user = userEvent.setup()
    const first = render(<Shell step={0.1} />)

    await user.tab()
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')

    expect(value()).toBe(0.3)
    first.unmount()

    render(<Shell defaultValue={90} max={95} step={10} />)
    await user.tab()
    await user.keyboard('{End}')

    expect(value()).toBe(90)
  })

  it('does not report a change when it cannot move, and ignores the keys with a modifier', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell onValueChange={onValueChange} />)
    await user.tab()
    await user.keyboard('{ArrowLeft}{Home}')
    await user.keyboard('{Control>}{ArrowRight}{/Control}')

    expect(value()).toBe(0)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('inverts the left and right arrows when it runs from right to left', async () => {
    const user = userEvent.setup()

    render(<Shell defaultValue={50} />)
    await user.tab()

    const computed = vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration)

    await user.keyboard('{ArrowRight}')

    expect(value()).toBe(49)

    computed.mockRestore()
  })

  it('sets the value from outside with setValue, on a step and inside the range', () => {
    const onValueChange = vi.fn()
    const { result } = renderHook(() => useSlider({ step: 10, onValueChange }))

    act(() => result.current.setValue(47))

    expect(result.current.value).toBe(50)
    expect(onValueChange).toHaveBeenLastCalledWith(50)

    act(() => result.current.setValue(-30))

    expect(result.current.value).toBe(0)

    act(() => result.current.setValue(900))

    expect(result.current.value).toBe(100)
  })

  it('reports the choice and waits for the parent when it is controlled, then follows the parent', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Controlled onValueChange={onValueChange} />)
    await user.tab()
    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalledWith(21)
    expect(value()).toBe(20)

    await user.click(screen.getByRole('button', { name: 'jump' }))

    expect(value()).toBe(80)
  })

  it('sets the value where the pointer goes down and follows it while it is dragged', () => {
    const onValueChange = vi.fn()

    mount({ onValueChange })
    fireEvent.pointerDown(control(), { pointerType: 'mouse', pointerId: 1, button: 0, clientX: 100 })

    expect(value()).toBe(50)
    expect(thumb()).toHaveFocus()
    expect(screen.getByTestId('root')).toHaveAttribute('data-dragging')
    expect(screen.getByTestId('root')).toHaveAttribute('data-pointer-focus')

    fireEvent.pointerMove(control(), { pointerType: 'mouse', pointerId: 1, clientX: 150 })

    expect(value()).toBe(75)

    fireEvent.pointerMove(control(), { pointerType: 'mouse', pointerId: 1, clientX: 900 })

    expect(value()).toBe(100)

    fireEvent.pointerUp(control(), { pointerType: 'mouse', pointerId: 1, clientX: 900 })

    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dragging')

    fireEvent.pointerMove(control(), { pointerType: 'mouse', pointerId: 1, clientX: 20 })

    expect(value()).toBe(100)
    expect(onValueChange.mock.calls.map(([next]) => next)).toEqual([50, 75, 100])
  })

  it('maps the pointer from the right edge when it runs from right to left', () => {
    mount()

    const computed = vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration)

    fireEvent.pointerDown(control(), { pointerType: 'mouse', pointerId: 1, button: 0, clientX: 150 })

    expect(value()).toBe(25)

    computed.mockRestore()
  })

  it('ignores the secondary mouse buttons', () => {
    mount()
    fireEvent.pointerDown(control(), { pointerType: 'mouse', pointerId: 1, button: 2, clientX: 150 })

    expect(value()).toBe(0)
  })

  it('sets the value of a tap where the finger is lifted, and not before', () => {
    mount()
    fireEvent.pointerDown(control(), finger(100))

    expect(value()).toBe(0)
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dragging')

    fireEvent.pointerUp(control(), finger(100))

    expect(value()).toBe(50)
    expect(thumb()).toHaveFocus()
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dragging')
  })

  it('leaves the value alone when the finger goes up or down, and follows it when it goes across', () => {
    const onValueChange = vi.fn()

    mount({ onValueChange })
    fireEvent.pointerDown(control(), finger(100, 20))
    fireEvent.pointerMove(control(), finger(108, 60))
    fireEvent.pointerCancel(control(), finger(110, 120))

    expect(value()).toBe(0)
    expect(onValueChange).not.toHaveBeenCalled()

    fireEvent.pointerDown(control(), finger(100))
    fireEvent.pointerMove(control(), finger(103))

    expect(value()).toBe(0)

    fireEvent.pointerMove(control(), finger(120, 26))

    expect(value()).toBe(60)
    expect(screen.getByTestId('root')).toHaveAttribute('data-dragging')
  })

  it('does not take a second finger while the first is down', () => {
    mount()
    fireEvent.pointerDown(control(), finger(100))
    fireEvent.pointerDown(control(), { ...finger(180), pointerId: 6 })
    fireEvent.pointerUp(control(), { ...finger(180), pointerId: 6 })

    expect(value()).toBe(0)

    fireEvent.pointerUp(control(), finger(100))

    expect(value()).toBe(50)
  })

  it('drops the pointer focus flag with a key or with the blur', async () => {
    const user = userEvent.setup()

    mount()
    fireEvent.pointerDown(control(), { pointerType: 'mouse', pointerId: 1, button: 0, clientX: 100 })
    fireEvent.pointerUp(control(), { pointerType: 'mouse', pointerId: 1, clientX: 100 })

    expect(screen.getByTestId('root')).toHaveAttribute('data-pointer-focus')

    await user.keyboard('{ArrowRight}')

    expect(screen.getByTestId('root')).not.toHaveAttribute('data-pointer-focus')

    fireEvent.pointerDown(control(), { pointerType: 'mouse', pointerId: 2, button: 0, clientX: 100 })
    fireEvent.pointerUp(control(), { pointerType: 'mouse', pointerId: 2, clientX: 100 })
    fireEvent.blur(thumb())

    expect(screen.getByTestId('root')).not.toHaveAttribute('data-pointer-focus')
  })

  it('is out of the tab order, flagged and inert when it is disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    mount({ disabled: true, onValueChange })

    expect(thumb()).not.toHaveAttribute('tabindex')
    expect(thumb()).toHaveAttribute('aria-disabled', 'true')

    fireEvent.pointerDown(control(), { pointerType: 'mouse', pointerId: 1, button: 0, clientX: 150 })
    thumb().focus()
    await user.keyboard('{ArrowRight}')

    expect(value()).toBe(0)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('passes the props of the consumer through, and chains its handlers before its own', async () => {
    const user = userEvent.setup()
    const pressed = vi.fn()
    const down = vi.fn()

    mount({ thumbProps: { className: 'thumb', onKeyDown: pressed }, controlProps: { className: 'control', onPointerDown: down }, trackProps: { className: 'track' } })

    expect(thumb()).toHaveClass('thumb')
    expect(control()).toHaveClass('control')
    expect(screen.getByTestId('track')).toHaveClass('track')

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(pressed).toHaveBeenCalledTimes(1)
    expect(value()).toBe(1)

    fireEvent.pointerDown(control(), { pointerType: 'mouse', pointerId: 1, button: 0, clientX: 100 })

    expect(down).toHaveBeenCalledTimes(1)
    expect(value()).toBe(50)
  })

  it('still runs its own handler when the handler of the consumer prevents the default', async () => {
    const user = userEvent.setup()
    const prevent = (event: { preventDefault: () => void }) => event.preventDefault()

    mount({ thumbProps: { onKeyDown: prevent }, controlProps: { onPointerDown: prevent } })
    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(value()).toBe(1)

    fireEvent.pointerDown(control(), { pointerType: 'mouse', pointerId: 1, button: 0, clientX: 100 })

    expect(value()).toBe(50)
  })

  it('keeps the refs of the consumer for the track and the thumb', () => {
    const trackRef: RefObject<HTMLDivElement | null> = createRef()
    const thumbRef: RefObject<HTMLDivElement | null> = createRef()

    render(<Shell trackProps={{ ref: trackRef }} thumbProps={{ ref: thumbRef }} />)

    expect(trackRef.current).toBe(screen.getByTestId('track'))
    expect(thumbRef.current).toBe(thumb())
  })

  it('has no accessibility violations in a shell of its own', async () => {
    const { container } = render(<Shell defaultValue={40} formatValue={(next) => `${next}%`} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
