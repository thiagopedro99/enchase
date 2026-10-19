import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'

import { useRepeatPress } from '@hooks/useRepeatPress.ts'

const calls = { count: 0 }

const Harness = ({ enabled = true, delay, interval }: { enabled?: boolean; delay?: number; interval?: number }) => {
  const [step, setStep] = useState(1)
  const press = useRepeatPress(
    () => {
      calls.count += step
    },
    enabled,
    delay,
    interval
  )

  return (
    <>
      <button type="button" {...press}>
        hold
      </button>
      <button type="button" onClick={() => setStep(10)}>
        bigger
      </button>
    </>
  )
}

const hold = () => screen.getByRole('button', { name: 'hold' })

const advance = (milliseconds: number) => act(() => void vi.advanceTimersByTime(milliseconds))

describe('useRepeatPress', () => {
  beforeEach(() => {
    calls.count = 0
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('acts once at once, waits, and then repeats at the interval', () => {
    render(<Harness />)
    fireEvent.pointerDown(hold(), { button: 0, pointerType: 'mouse' })

    expect(calls.count).toBe(1)
    advance(399)
    expect(calls.count).toBe(1)
    advance(1)
    advance(60)
    expect(calls.count).toBe(2)
    advance(60 * 4)
    expect(calls.count).toBe(6)
  })

  it('takes its own delay and interval', () => {
    render(<Harness delay={100} interval={10} />)
    fireEvent.pointerDown(hold(), { button: 0, pointerType: 'touch' })
    advance(100)
    advance(30)

    expect(calls.count).toBe(4)
  })

  it('stops on release, on leaving, on cancel and on blur', () => {
    render(<Harness />)

    for (const stop of [fireEvent.pointerUp, fireEvent.pointerLeave, fireEvent.pointerCancel, fireEvent.blur]) {
      calls.count = 0
      fireEvent.pointerDown(hold(), { button: 0, pointerType: 'mouse' })
      advance(400 + 120)
      expect(calls.count).toBeGreaterThan(1)
      stop(hold())

      const stopped = calls.count

      advance(1000)
      expect(calls.count).toBe(stopped)
    }
  })

  it('stops before the first repeat when released early', () => {
    render(<Harness />)
    fireEvent.pointerDown(hold(), { button: 0, pointerType: 'mouse' })
    advance(200)
    fireEvent.pointerUp(hold())
    advance(2000)

    expect(calls.count).toBe(1)
  })

  it('ignores a mouse button that is not the primary one, and accepts a touch or a pen', () => {
    render(<Harness />)
    fireEvent.pointerDown(hold(), { button: 2, pointerType: 'mouse' })
    fireEvent.pointerDown(hold(), { button: 1, pointerType: 'mouse' })

    expect(calls.count).toBe(0)

    fireEvent.pointerDown(hold(), { button: 0, pointerType: 'pen' })
    expect(calls.count).toBe(1)
    fireEvent.pointerUp(hold())
    fireEvent.pointerDown(hold(), { button: -1, pointerType: 'touch' })
    expect(calls.count).toBe(2)
  })

  it('restarts the wait on a new press instead of stacking timers', () => {
    render(<Harness />)
    fireEvent.pointerDown(hold(), { button: 0, pointerType: 'mouse' })
    advance(500)
    fireEvent.pointerDown(hold(), { button: 0, pointerType: 'mouse' })

    const restarted = calls.count

    advance(60)
    expect(calls.count).toBe(restarted)
    advance(340)
    advance(60)
    expect(calls.count).toBe(restarted + 1)
  })

  it('stops by itself when it becomes disabled in the middle of a press', () => {
    const view = render(<Harness />)

    fireEvent.pointerDown(hold(), { button: 0, pointerType: 'mouse' })
    advance(400 + 120)

    const before = calls.count

    view.rerender(<Harness enabled={false} />)
    advance(1000)

    expect(calls.count).toBe(before)
  })

  it('stops when the component goes away', () => {
    const view = render(<Harness />)

    fireEvent.pointerDown(hold(), { button: 0, pointerType: 'mouse' })
    advance(400 + 120)
    view.unmount()

    const before = calls.count

    advance(1000)
    expect(calls.count).toBe(before)
  })

  it('always calls the latest action, also in the middle of a press', () => {
    render(<Harness />)
    fireEvent.pointerDown(hold(), { button: 0, pointerType: 'mouse' })
    advance(400)
    fireEvent.click(screen.getByRole('button', { name: 'bigger' }))

    const before = calls.count

    advance(60)
    expect(calls.count).toBe(before + 10)
  })

  it('acts on a click with no pointer, which is a keyboard or a screen reader, and not on a click after a pointer', () => {
    render(<Harness />)
    fireEvent.click(hold(), { detail: 0 })
    expect(calls.count).toBe(1)
    fireEvent.click(hold(), { detail: 1 })
    expect(calls.count).toBe(1)
  })

  it('keeps the focus where it is by cancelling the mouse down', () => {
    render(<Harness />)

    expect(fireEvent.mouseDown(hold())).toBe(false)
  })
})
