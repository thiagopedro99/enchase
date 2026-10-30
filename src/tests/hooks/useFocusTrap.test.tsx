import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useRef, useState } from 'react'

import { resetInteractionTarget } from '@hooks/interactionTarget.ts'
import { useFocusTrap } from '@hooks/useFocusTrap.ts'

const Trap = () => {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, true)

  return (
    <div ref={ref} role="dialog" aria-label="Caixa">
      <button>Primeiro</button>
      <button>Segundo</button>
      <button>Terceiro</button>
    </div>
  )
}

const refuseFocus = (element: HTMLElement | null) => {
  if (element) element.focus = () => undefined
}

const TrapWithAwkwardControls = () => {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, true)

  return (
    <div ref={ref} role="dialog" aria-label="Caixa" tabIndex={-1}>
      <input type="hidden" name="token" value="x" />
      <button>Primeiro</button>
      <button ref={refuseFocus}>Preso</button>
      <button>Terceiro</button>
    </div>
  )
}

const TrapWithNothingToFocus = () => {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, true)

  return (
    <div ref={ref} role="dialog" aria-label="Caixa" tabIndex={-1}>
      <button ref={refuseFocus}>Preso</button>
    </div>
  )
}

const TrapWithAutofocus = () => {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, true)

  return (
    <div ref={ref} role="dialog" aria-label="Caixa">
      <button>Primeiro</button>
      <button data-autofocus>Segundo</button>
      <button>Terceiro</button>
    </div>
  )
}

const TrapWithoutControls = () => {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, true)

  return (
    <div ref={ref} role="dialog" aria-label="Caixa" tabIndex={-1}>
      <p>Sem controles</p>
    </div>
  )
}

const Page = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <button onClick={() => setOpen(false)}>Fora</button>
      {open && <Trap />}
    </>
  )
}

const PageThatDropsTheTrigger = () => {
  const [open, setOpen] = useState(false)
  const [trigger, setTrigger] = useState(true)

  return (
    <>
      {trigger && <button onClick={() => setOpen(true)}>Abrir</button>}
      <button
        onClick={() => {
          setOpen(false)
          setTrigger(false)
        }}
      >
        Fora
      </button>
      {open && <Trap />}
    </>
  )
}

const control = (name: string) => screen.getByRole('button', { name })

const stubScrollIntoView = () => {
  const scrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoView

  return scrollIntoView
}

afterEach(() => {
  resetInteractionTarget()
  vi.restoreAllMocks()
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
})

describe('useFocusTrap', () => {
  it('focuses the first control on open and gives the focus back to the focused trigger on close', () => {
    render(<Page />)

    control('Abrir').focus()
    fireEvent.click(control('Abrir'))
    expect(control('Primeiro')).toHaveFocus()

    fireEvent.click(control('Fora'))

    expect(control('Abrir')).toHaveFocus()
  })

  it('gives the focus back to the pressed trigger when the browser never focused it', () => {
    render(<Page />)
    const trigger = control('Abrir')

    expect(document.body).toHaveFocus()
    fireEvent.pointerDown(trigger)
    fireEvent.click(trigger)
    expect(control('Primeiro')).toHaveFocus()

    fireEvent.click(control('Fora'))

    expect(trigger).toHaveFocus()
  })

  it('does not take the focus back when it was moved outside the dialog before it closed', () => {
    render(<Page />)

    control('Abrir').focus()
    fireEvent.click(control('Abrir'))
    control('Fora').focus()
    fireEvent.click(control('Fora'))

    expect(control('Fora')).toHaveFocus()
  })

  it('does nothing when the trigger left the document', () => {
    render(<PageThatDropsTheTrigger />)
    const trigger = control('Abrir')

    trigger.focus()
    fireEvent.click(trigger)
    fireEvent.click(control('Fora'))

    expect(trigger.isConnected).toBe(false)
    expect(document.body).toHaveFocus()
  })

  it('ignores a press that is too old to be the trigger', () => {
    render(<Page />)
    const trigger = control('Abrir')
    const now = Date.now()
    const spy = Object.getOwnPropertyDescriptor(Date, 'now')

    fireEvent.pointerDown(trigger)
    Date.now = () => now + 60000
    fireEvent.click(trigger)
    fireEvent.click(control('Fora'))
    if (spy) Object.defineProperty(Date, 'now', spy)

    expect(trigger).not.toHaveFocus()
  })

  it('cycles Tab through the controls itself and wraps at both ends', () => {
    render(<Page />)

    control('Abrir').focus()
    fireEvent.click(control('Abrir'))

    fireEvent.keyDown(control('Primeiro'), { key: 'Tab' })
    expect(control('Segundo')).toHaveFocus()
    fireEvent.keyDown(control('Segundo'), { key: 'Tab' })
    expect(control('Terceiro')).toHaveFocus()
    fireEvent.keyDown(control('Terceiro'), { key: 'Tab' })
    expect(control('Primeiro')).toHaveFocus()
    fireEvent.keyDown(control('Primeiro'), { key: 'Tab', shiftKey: true })
    expect(control('Terceiro')).toHaveFocus()
  })

  it('starts on the first control that can take focus when a hidden input comes before it', () => {
    render(<TrapWithAwkwardControls />)

    expect(control('Primeiro')).toHaveFocus()
  })

  it('steps over a control that refuses the focus instead of staying where it was', () => {
    render(<TrapWithAwkwardControls />)

    fireEvent.keyDown(control('Primeiro'), { key: 'Tab' })
    expect(control('Terceiro')).toHaveFocus()
    fireEvent.keyDown(control('Terceiro'), { key: 'Tab' })
    expect(control('Primeiro')).toHaveFocus()
    fireEvent.keyDown(control('Primeiro'), { key: 'Tab', shiftKey: true })
    expect(control('Terceiro')).toHaveFocus()
    fireEvent.keyDown(control('Terceiro'), { key: 'Tab', shiftKey: true })
    expect(control('Primeiro')).toHaveFocus()
  })

  it('keeps the focus on the dialog itself when no control inside can take it', () => {
    render(<TrapWithNothingToFocus />)

    expect(screen.getByRole('dialog')).toHaveFocus()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' })

    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('brings the control that Tab moves the focus to into view, to the nearest edge', () => {
    const scrollIntoView = stubScrollIntoView()
    render(<Trap />)

    fireEvent.keyDown(control('Primeiro'), { key: 'Tab' })

    expect(control('Segundo')).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
    expect(scrollIntoView.mock.contexts[0]).toBe(control('Segundo'))
  })

  it('brings the control that Shift+Tab moves the focus to into view the same way', () => {
    const scrollIntoView = stubScrollIntoView()
    render(<Trap />)

    fireEvent.keyDown(control('Primeiro'), { key: 'Tab' })
    fireEvent.keyDown(control('Segundo'), { key: 'Tab' })
    scrollIntoView.mockClear()
    fireEvent.keyDown(control('Terceiro'), { key: 'Tab', shiftKey: true })

    expect(control('Segundo')).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
    expect(scrollIntoView.mock.contexts[0]).toBe(control('Segundo'))
  })

  it('brings into view the control it wraps to, from the first to the last and from the last to the first', () => {
    const scrollIntoView = stubScrollIntoView()
    render(<Trap />)

    fireEvent.keyDown(control('Primeiro'), { key: 'Tab', shiftKey: true })

    expect(control('Terceiro')).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.contexts[0]).toBe(control('Terceiro'))

    fireEvent.keyDown(control('Terceiro'), { key: 'Tab' })

    expect(control('Primeiro')).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'nearest', inline: 'nearest' })
    expect(scrollIntoView.mock.contexts[1]).toBe(control('Primeiro'))
  })

  it('brings into view the control that took the focus, and not the one that refused it', () => {
    const scrollIntoView = stubScrollIntoView()
    render(<TrapWithAwkwardControls />)

    fireEvent.keyDown(control('Primeiro'), { key: 'Tab' })

    expect(control('Terceiro')).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.contexts[0]).toBe(control('Terceiro'))
  })

  it('gives the focus it takes when it opens without scrolling, on the first control or on the data-autofocus one', () => {
    const scrollIntoView = stubScrollIntoView()
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    const { unmount } = render(<Trap />)

    expect(control('Primeiro')).toHaveFocus()
    expect(focus.mock.calls).toEqual([[{ preventScroll: true }]])
    expect(focus.mock.contexts[0]).toBe(control('Primeiro'))
    unmount()
    focus.mockClear()
    render(<TrapWithAutofocus />)

    expect(control('Segundo')).toHaveFocus()
    expect(focus.mock.calls).toEqual([[{ preventScroll: true }]])
    expect(focus.mock.contexts[0]).toBe(control('Segundo'))
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it.each([
    ['nothing inside can take the focus', <TrapWithNothingToFocus />],
    ['there is no control inside', <TrapWithoutControls />]
  ] as const)('does not scroll and keeps the focus on the dialog when %s', (_reason, trap) => {
    const scrollIntoView = stubScrollIntoView()
    render(trap)

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' })
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab', shiftKey: true })

    expect(screen.getByRole('dialog')).toHaveFocus()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('keeps moving the focus when the browser has no scrollIntoView', () => {
    render(<Trap />)

    expect(Element.prototype.scrollIntoView).toBeUndefined()

    fireEvent.keyDown(control('Primeiro'), { key: 'Tab' })
    expect(control('Segundo')).toHaveFocus()
    fireEvent.keyDown(control('Segundo'), { key: 'Tab', shiftKey: true })
    expect(control('Primeiro')).toHaveFocus()
  })
})
