import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { en } from '@locales/en.ts'

const field = () => screen.getByRole('spinbutton')

const more = () => screen.getByRole('button', { name: 'Aumentar valor' })

const less = () => screen.getByRole('button', { name: 'Diminuir valor' })

const status = () => field().closest('[data-slot="number-input"]')?.querySelector<HTMLElement>('[aria-live="polite"]') ?? null

const advance = (milliseconds: number) => act(() => void vi.advanceTimersByTime(milliseconds))

describe('NumberInput structure', () => {
  it('is a spinbutton named by its label, backed by a text input that asks for a numeric keyboard', () => {
    renderWithProviders(<NumberInput label="Quantidade" />)

    const input = screen.getByRole('spinbutton', { name: 'Quantidade' })

    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('inputmode', 'decimal')
    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toHaveAttribute('spellcheck', 'false')
    expect(input).toHaveValue('')
  })

  it('asks for the integer keyboard when no fraction digit is allowed', () => {
    renderWithProviders(<NumberInput label="Quantidade" formatOptions={{ maximumFractionDigits: 0 }} />)

    expect(field()).toHaveAttribute('inputmode', 'numeric')
  })

  it('exposes the range and the formatted value to assistive technology', () => {
    renderWithProviders(<NumberInput label="Preço" min={0} max={5000} defaultValue={1234.5} />)

    expect(field()).toHaveAttribute('aria-valuemin', '0')
    expect(field()).toHaveAttribute('aria-valuemax', '5000')
    expect(field()).toHaveAttribute('aria-valuenow', '1234.5')
    expect(field()).toHaveAttribute('aria-valuetext', '1.234,5')
    expect(field()).toHaveValue('1.234,5')
  })

  it('leaves out the current value and the limits that are not set', () => {
    renderWithProviders(<NumberInput label="Preço" />)

    for (const name of ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext']) expect(field()).not.toHaveAttribute(name)
  })

  it('describes the field with the helper text and announces an error instead of it', () => {
    const { rerender } = renderWithProviders(<NumberInput label="Preço" helperText="Em reais" />)

    expect(field()).toHaveAccessibleDescription('Em reais')
    expect(field()).not.toHaveAttribute('aria-invalid')

    rerender(<NumberInput label="Preço" helperText="Em reais" error="Valor inválido" />)

    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(field()).toHaveAccessibleDescription('Valor inválido')
    expect(screen.getByRole('alert')).toHaveTextContent('Valor inválido')
  })

  it('merges a consumer aria-describedby with its own and keeps ids unique and provided', () => {
    renderWithProviders(
      <>
        <p id="hint">Dica</p>
        <NumberInput label="Primeiro" helperText="Ajuda" aria-describedby="hint" />
        <NumberInput label="Segundo" id="second" helperText="Outra" />
      </>
    )

    expect(screen.getByRole('spinbutton', { name: 'Primeiro' })).toHaveAccessibleDescription('Dica Ajuda')
    expect(screen.getByRole('spinbutton', { name: 'Segundo' })).toHaveAttribute('id', 'second')
    expect(screen.getByRole('spinbutton', { name: 'Primeiro' }).id).not.toBe('second')
  })

  it('forwards the ref, keeps className and style on the input and the wrapper props on the root', () => {
    const ref = createRef<HTMLInputElement>()

    renderWithProviders(<NumberInput label="Preço" ref={ref} className="mine" style={{ color: 'red' }} wrapperClassName="outer" wrapperStyle={{ margin: 3 }} data-testid="field" />)

    expect(ref.current).toBe(field())
    expect(field()).toHaveClass('mine')
    expect(field().style.color).toBe('red')
    expect(field().closest('[data-slot="number-input"]')).toHaveClass('outer')
    expect(field().closest('[data-slot="number-input"]')).toHaveStyle({ margin: '3px' })
    expect(field()).toHaveAttribute('data-testid', 'field')
  })

  it('marks its parts with data-slot and does not leak its props to the DOM', () => {
    renderWithProviders(<NumberInput label="Preço" formatOptions={{ style: 'percent' }} largeStep={5} fullWidth steppers helperText="x" onValueChange={() => undefined} />)

    for (const part of ['number-input', 'number-input-control', 'number-input-field', 'number-input-label', 'number-input-outline', 'number-input-steppers', 'number-input-decrease', 'number-input-increase', 'number-input-helper']) {
      expect(document.querySelector(`[data-slot="${part}"]`), part).not.toBeNull()
    }

    for (const name of ['formatoptions', 'largestep', 'steppers', 'fullwidth', 'onvaluechange', 'helpertext']) expect(field()).not.toHaveAttribute(name)

    expect(field().closest('[data-slot="number-input"]')).toHaveAttribute('data-full-width')
  })
})

describe('NumberInput steppers', () => {
  it('has two buttons named by the labels of the provider, out of the tab order', () => {
    const { unmount } = renderWithProviders(<NumberInput label="Preço" />)

    expect(more()).toHaveAttribute('tabindex', '-1')
    expect(less()).toHaveAttribute('tabindex', '-1')
    expect(more()).toHaveAttribute('aria-controls', field().id)
    expect(less()).toHaveAttribute('aria-controls', field().id)
    unmount()

    renderWithProviders(<NumberInput label="Price" />, { locale: en })

    expect(screen.getByRole('button', { name: 'Increase value' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeInTheDocument()
  })

  it('takes custom labels and falls back to English for a locale without them', () => {
    const { unmount } = renderWithProviders(<NumberInput label="Preço" />, { labels: { increaseValue: 'Mais um', decreaseValue: 'Menos um' } })

    expect(screen.getByRole('button', { name: 'Mais um' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menos um' })).toBeInTheDocument()
    unmount()

    const { increaseValue, decreaseValue, ...messages } = en.messages

    void increaseValue
    void decreaseValue
    renderWithProviders(<NumberInput label="Preço" />, { locale: { ...en, messages } })

    expect(screen.getByRole('button', { name: 'Increase value' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeInTheDocument()
  })

  it('leaves the buttons and the live region out with steppers={false}', () => {
    renderWithProviders(<NumberInput label="Preço" steppers={false} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(status()).toBeNull()
    expect(field()).not.toHaveAttribute('data-has-steppers')
  })

  it('is not part of the tab order: Tab leaves the field', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <>
        <NumberInput label="Preço" />
        <button type="button">depois</button>
      </>
    )

    await user.tab()
    expect(field()).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'depois' })).toHaveFocus()
  })

  it('steps once per click and keeps the focus where it was', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} onValueChange={onValueChange} />)
    await user.click(field())
    await user.click(more())

    expect(field()).toHaveValue('6')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith(6)
    expect(field()).toHaveFocus()

    await user.click(less())
    await user.click(less())

    expect(field()).toHaveValue('4')
    expect(onValueChange).toHaveBeenLastCalledWith(4)
  })

  it('does not move the focus to the input when the buttons are used from outside', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} />)
    await user.click(more())

    expect(field()).toHaveValue('6')
    expect(more()).not.toHaveFocus()
    expect(field()).not.toHaveFocus()
  })

  it('steps by keyboard activation of a button, which clicks with no pointer', () => {
    renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} />)
    fireEvent.click(more(), { detail: 0 })

    expect(field()).toHaveValue('6')
  })

  it('disables a button at its limit and both buttons with the field', () => {
    const first = renderWithProviders(<NumberInput label="Quantidade" defaultValue={3} min={3} max={5} />)

    expect(less()).toBeDisabled()
    expect(more()).toBeEnabled()
    first.unmount()

    const second = renderWithProviders(<NumberInput label="Quantidade" value={5} min={3} max={5} onValueChange={() => undefined} />)

    expect(more()).toBeDisabled()
    expect(less()).toBeEnabled()
    second.unmount()

    const third = renderWithProviders(<NumberInput label="Quantidade" defaultValue={4} disabled />)

    expect(more()).toBeDisabled()
    expect(less()).toBeDisabled()
    third.unmount()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={4} readOnly />)

    expect(more()).toBeDisabled()
    expect(less()).toBeDisabled()
  })

  it('decides which button is available from what is typed, not only from the committed value', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={10} min={1} max={10} />)

    expect(more()).toBeDisabled()
    await user.clear(field())
    await user.type(field(), '3')
    expect(more()).toBeEnabled()
    expect(less()).toBeEnabled()
    await user.click(more())
    expect(field()).toHaveValue('4')
    await user.clear(field())
    await user.type(field(), '1')
    expect(less()).toBeDisabled()
    await user.clear(field())
    expect(more()).toBeEnabled()
    expect(less()).toBeEnabled()
  })

  it('announces the new value after a button, and only then', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Preço" defaultValue={1234} />)

    expect(status()).toHaveAttribute('aria-atomic', 'true')
    expect(status()).toBeEmptyDOMElement()
    await user.click(more())
    expect(status()).toHaveTextContent('1.235')
    await user.click(field())
    await user.keyboard('{ArrowUp}')
    expect(field()).toHaveValue('1.236')
    expect(status()).toHaveTextContent('1.235')
  })

  it('repeats while a button is held, and stops when it is released, left or disabled', () => {
    vi.useFakeTimers()

    try {
      renderWithProviders(<NumberInput label="Quantidade" defaultValue={0} max={20} />)

      fireEvent.pointerDown(more(), { button: 0, pointerType: 'mouse' })
      expect(field()).toHaveValue('1')
      advance(399)
      expect(field()).toHaveValue('1')
      advance(1)
      advance(60 * 3)
      expect(field()).toHaveValue('4')
      fireEvent.pointerUp(more())
      advance(1000)
      expect(field()).toHaveValue('4')

      fireEvent.pointerDown(less(), { button: 0, pointerType: 'mouse' })
      advance(400 + 60)
      expect(field()).toHaveValue('2')
      fireEvent.pointerLeave(less())
      advance(1000)
      expect(field()).toHaveValue('2')

      fireEvent.pointerDown(more(), { button: 0, pointerType: 'touch' })
      advance(400 + 60 * 40)
      expect(field()).toHaveValue('20')
      expect(more()).toBeDisabled()
      advance(1000)
      expect(field()).toHaveValue('20')
    } finally {
      vi.useRealTimers()
    }
  })

  it('ignores a pointer press that is not the primary button', () => {
    renderWithProviders(<NumberInput label="Quantidade" defaultValue={0} />)
    fireEvent.pointerDown(more(), { button: 2, pointerType: 'mouse' })

    expect(field()).toHaveValue('0')
  })
})

describe('NumberInput typing', () => {
  it('formats what was typed when the field loses the focus, and reports it once', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Preço" onValueChange={onValueChange} />)
    await user.type(field(), '1234,5')

    expect(field()).toHaveValue('1234,5')
    expect(onValueChange).not.toHaveBeenCalled()

    await user.tab()

    expect(field()).toHaveValue('1.234,5')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith(1234.5)
    expect(field()).toHaveAttribute('aria-valuenow', '1234.5')
  })

  it('commits on Enter, keeps the focus and does not stop the form from being submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      return new FormData(event.currentTarget).get('price')
    })

    renderWithProviders(
      <form onSubmit={onSubmit}>
        <NumberInput label="Preço" name="price" />
        <button type="submit">Enviar</button>
      </form>
    )
    await user.type(field(), '12,5{Enter}')

    expect(field()).toHaveValue('12,5')
    expect(field()).toHaveFocus()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.results[0].value).toBe('12.5')
  })

  it('refuses letters and symbols that are not part of a number', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Preço" />)
    await user.type(field(), 'a1b2,c3-+e*')

    expect(field()).toHaveValue('12,3')
  })

  it('refuses a second decimal mark and accepts a minus only at the start', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Temperatura" />)
    await user.type(field(), '-1,2,3-4')

    expect(field()).toHaveValue('-1,234')
  })

  it('refuses a minus sign when the minimum is zero or more and accepts it otherwise', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<NumberInput label="Quantidade" min={0} />)

    await user.type(field(), '-5')
    expect(field()).toHaveValue('5')
    unmount()

    const negative = renderWithProviders(<NumberInput label="Temperatura" min={-20} />)

    await user.type(field(), '-5')
    expect(field()).toHaveValue('-5')
    negative.unmount()

    renderWithProviders(<NumberInput label="Temperatura" />)
    await user.type(field(), '-5')
    expect(field()).toHaveValue('-5')
  })

  it('refuses a decimal mark when no fraction digit is allowed', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Quantidade" formatOptions={{ maximumFractionDigits: 0 }} />)
    await user.type(field(), '12,5')

    expect(field()).toHaveValue('125')
  })

  it('clamps to the limits when the field loses the focus', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Idade" min={18} max={65} onValueChange={onValueChange} />)
    await user.type(field(), '150')
    await user.tab()

    expect(field()).toHaveValue('65')
    expect(onValueChange).toHaveBeenLastCalledWith(65)

    await user.clear(field())
    await user.type(field(), '3')
    await user.tab()

    expect(field()).toHaveValue('18')
    expect(onValueChange).toHaveBeenLastCalledWith(18)
  })

  it('rounds to the digits of the format', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Peso" formatOptions={{ maximumFractionDigits: 2 }} onValueChange={onValueChange} />)
    await user.type(field(), '1,2349')
    await user.tab()

    expect(field()).toHaveValue('1,23')
    expect(onValueChange).toHaveBeenCalledWith(1.23)
  })

  it('reports an empty field as null', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Preço" defaultValue={7} onValueChange={onValueChange} />)
    await user.clear(field())
    await user.tab()

    expect(field()).toHaveValue('')
    expect(onValueChange).toHaveBeenCalledWith(null)
    expect(field()).not.toHaveAttribute('aria-valuenow')
  })

  it('puts the previous value back when the text is not a number, without reporting it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Preço" defaultValue={7} onValueChange={onValueChange} />)
    await user.clear(field())
    await user.type(field(), '-')
    await user.tab()

    expect(field()).toHaveValue('7')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('does not report a change when nothing was edited, even if the value has more digits than shown', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Peso" defaultValue={0.123456} onValueChange={onValueChange} />)
    await user.click(field())
    await user.tab()

    expect(field()).toHaveValue('0,123')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('reads a dot as the decimal mark when it cannot be a thousands mark', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Preço" />)
    await user.type(field(), '1.5')
    await user.tab()

    expect(field()).toHaveValue('1,5')
    expect(field()).toHaveAttribute('aria-valuenow', '1.5')
  })

  it('formats a currency, a percentage and the language of the provider', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<NumberInput label="Preço" formatOptions={{ style: 'currency', currency: 'BRL' }} />)

    await user.type(field(), '1234,5')
    await user.tab()
    expect(field()).toHaveValue('R$ 1.234,50')
    expect(field()).toHaveAttribute('aria-valuenow', '1234.5')
    unmount()

    const dollars = renderWithProviders(<NumberInput label="Price" formatOptions={{ style: 'currency', currency: 'USD' }} />, { locale: en })

    await user.type(field(), '1234.5')
    await user.tab()
    expect(field()).toHaveValue('$1,234.50')
    dollars.unmount()

    renderWithProviders(<NumberInput label="Desconto" step={0.01} formatOptions={{ style: 'percent', maximumFractionDigits: 1 }} />)
    await user.type(field(), '12,5')
    await user.tab()
    expect(field()).toHaveValue('12,5%')
    expect(field()).toHaveAttribute('aria-valuenow', '0.125')
  })

  it('keeps editing a formatted value and accepts its own symbols', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Preço" defaultValue={1234.5} formatOptions={{ style: 'currency', currency: 'BRL' }} />)
    await user.click(field())
    await user.keyboard('{End}{Backspace}{Backspace}9')

    expect(field()).toHaveValue('R$ 1.234,9')
    await user.tab()
    expect(field()).toHaveValue('R$ 1.234,90')
  })
})

describe('NumberInput keyboard', () => {
  it('steps with the arrow keys and reports each step', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} onValueChange={onValueChange} />)
    await user.click(field())
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowDown}')

    expect(field()).toHaveValue('6')
    expect(onValueChange.mock.calls).toEqual([[6], [7], [6]])
  })

  it('starts from the lowest allowed value going up and from the highest going down when empty', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<NumberInput label="Quantidade" min={1} max={10} />)

    await user.click(field())
    await user.keyboard('{ArrowUp}')
    expect(field()).toHaveValue('1')
    unmount()

    const down = renderWithProviders(<NumberInput label="Quantidade" min={1} max={10} />)

    await user.click(field())
    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveValue('10')
    down.unmount()

    renderWithProviders(<NumberInput label="Quantidade" />)
    await user.click(field())
    await user.keyboard('{ArrowUp}')
    expect(field()).toHaveValue('0')
  })

  it('takes a large step with Shift and with Page Up and Page Down', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<NumberInput label="Quantidade" defaultValue={50} />)

    await user.click(field())
    await user.keyboard('{Shift>}{ArrowUp}{/Shift}')
    expect(field()).toHaveValue('60')
    await user.keyboard('{PageDown}{PageDown}')
    expect(field()).toHaveValue('40')
    await user.keyboard('{PageUp}')
    expect(field()).toHaveValue('50')
    unmount()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={50} largeStep={25} />)
    await user.click(field())
    await user.keyboard('{PageUp}{Shift>}{ArrowDown}{/Shift}')
    expect(field()).toHaveValue('50')
  })

  it('jumps to the limits with Home and End only when they exist, and leaves the caret alone otherwise', () => {
    const { unmount } = renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} min={1} max={9} />)

    expect(fireEvent.keyDown(field(), { key: 'Home' })).toBe(false)
    expect(field()).toHaveValue('1')
    expect(fireEvent.keyDown(field(), { key: 'End' })).toBe(false)
    expect(field()).toHaveValue('9')
    unmount()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} />)

    expect(fireEvent.keyDown(field(), { key: 'Home' })).toBe(true)
    expect(fireEvent.keyDown(field(), { key: 'End' })).toBe(true)
    expect(field()).toHaveValue('5')
  })

  it('steps from what was typed, committing it on the way', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={1} onValueChange={onValueChange} />)
    await user.clear(field())
    await user.type(field(), '7')
    await user.keyboard('{ArrowUp}')

    expect(field()).toHaveValue('8')
    expect(onValueChange.mock.calls).toEqual([[8]])
  })

  it('stays on the grid of the step, counted from the minimum', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<NumberInput label="Quantidade" defaultValue={3} min={0} step={5} />)

    await user.click(field())
    await user.keyboard('{ArrowUp}')
    expect(field()).toHaveValue('5')
    unmount()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={3} min={0} step={5} />)
    await user.click(field())
    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveValue('0')
  })

  it('does not collect floating point error and shows as many digits as the step needs', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<NumberInput label="Nota" defaultValue={0.1} step={0.1} />)

    await user.click(field())
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(field()).toHaveValue('0,3')
    unmount()

    renderWithProviders(<NumberInput label="Medida" defaultValue={0} step={0.0001} />)
    await user.click(field())
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(field()).toHaveValue('0,0002')
    expect(field()).toHaveAttribute('aria-valuenow', '0.0002')
  })

  it('stops at the limits', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={9} min={0} max={10} />)
    await user.click(field())
    await user.keyboard('{ArrowUp}{ArrowUp}{PageUp}')

    expect(field()).toHaveValue('10')
    await user.keyboard('{PageDown}{PageDown}')
    expect(field()).toHaveValue('0')
  })

  it('does nothing when disabled or read only, and leaves the arrow keys to the caret', () => {
    const { unmount } = renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} readOnly />)

    expect(fireEvent.keyDown(field(), { key: 'ArrowUp' })).toBe(true)
    expect(field()).toHaveValue('5')
    unmount()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} disabled />)
    fireEvent.keyDown(field(), { key: 'ArrowUp' })

    expect(field()).toHaveValue('5')
  })

  it('ignores a key pressed with Control, Alt or Meta, and while composing', () => {
    renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} />)

    for (const init of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }]) {
      expect(fireEvent.keyDown(field(), { key: 'ArrowUp', ...init })).toBe(true)
    }

    expect(field()).toHaveValue('5')
  })

  it('falls back to a step of one when the step is not a positive number', async () => {
    const user = userEvent.setup()

    for (const step of [0, -2, Number.NaN, Infinity]) {
      const view = renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} step={step} />)

      await user.click(field())
      await user.keyboard('{ArrowUp}{PageUp}')
      expect(field(), String(step)).toHaveValue('10')
      view.unmount()
    }
  })

  it('does not report anything when Enter is pressed on a field nobody edited', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} onValueChange={onValueChange} />)
    await user.click(field())
    await user.keyboard('{Enter}')

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('lets the consumer handle a key first and stop the field from stepping', async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => event.preventDefault())

    renderWithProviders(<NumberInput label="Quantidade" defaultValue={5} onKeyDown={onKeyDown} />)
    await user.click(field())
    await user.keyboard('{ArrowUp}')

    expect(onKeyDown).toHaveBeenCalled()
    expect(field()).toHaveValue('5')
  })
})

const Controlled = ({ onValueChange }: { onValueChange?: (value: number | null) => void }) => {
  const [value, setValue] = useState<number | null>(10)

  return (
    <>
      <NumberInput
        label="Quantidade"
        value={value}
        onValueChange={(next) => {
          setValue(next)
          onValueChange?.(next)
        }}
      />
      <button type="button" onClick={() => setValue(42)}>
        definir
      </button>
    </>
  )
}

describe('NumberInput controlled', () => {
  it('follows the value it is given and reports what the user chooses', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<Controlled onValueChange={onValueChange} />)

    expect(field()).toHaveValue('10')

    await user.click(more())
    expect(field()).toHaveValue('11')
    expect(onValueChange).toHaveBeenLastCalledWith(11)
  })

  it('shows what the parent sets, even over a text that was being typed', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Controlled />)
    await user.clear(field())
    await user.type(field(), '99')
    await user.click(screen.getByRole('button', { name: 'definir' }))

    expect(field()).toHaveValue('42')
  })

  it('puts the given value back when the parent does not accept the change', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(<NumberInput label="Quantidade" value={10} onValueChange={onValueChange} />)
    await user.clear(field())
    await user.type(field(), '25')
    await user.tab()

    expect(onValueChange).toHaveBeenCalledWith(25)
    expect(field()).toHaveValue('10')

    await user.click(more())

    expect(onValueChange).toHaveBeenLastCalledWith(11)
    expect(field()).toHaveValue('10')
  })

  it('is empty for a null value, which is a controlled empty field', () => {
    renderWithProviders(<NumberInput label="Quantidade" value={null} onValueChange={() => undefined} />)

    expect(field()).toHaveValue('')
    expect(field()).not.toHaveAttribute('aria-valuenow')
  })
})

describe('NumberInput language and format', () => {
  it('formats again when the language of the provider changes', async () => {
    const { ptBR } = await import('@locales/ptBR.ts')
    const { UIProvider } = await import('@components/uiProvider/index.tsx')
    const { render } = await import('@testing-library/react')
    const view = render(
      <UIProvider locale={ptBR}>
        <NumberInput label="Preço" defaultValue={1234.5} />
      </UIProvider>
    )

    expect(field()).toHaveValue('1.234,5')

    view.rerender(
      <UIProvider locale={en}>
        <NumberInput label="Preço" defaultValue={1234.5} />
      </UIProvider>
    )

    expect(field()).toHaveValue('1,234.5')
    view.rerender(
      <UIProvider locale={{ ...en, locale: 'de-CH' }}>
        <NumberInput label="Preço" defaultValue={1234.5} />
      </UIProvider>
    )
    expect(field()).toHaveValue('1’234.5')
  })

  it('formats again when the format options change, without a new identity each time being a change', async () => {
    const { UIProvider } = await import('@components/uiProvider/index.tsx')
    const { render } = await import('@testing-library/react')
    const view = render(
      <UIProvider>
        <NumberInput label="Preço" defaultValue={1234.5} formatOptions={{ minimumFractionDigits: 2 }} />
      </UIProvider>
    )

    expect(field()).toHaveValue('1,234.50')

    view.rerender(
      <UIProvider>
        <NumberInput label="Preço" defaultValue={1234.5} formatOptions={{ minimumFractionDigits: 2 }} />
      </UIProvider>
    )
    expect(field()).toHaveValue('1,234.50')

    view.rerender(
      <UIProvider>
        <NumberInput label="Preço" defaultValue={1234.5} formatOptions={{ style: 'currency', currency: 'USD' }} />
      </UIProvider>
    )
    expect(field()).toHaveValue('$1,234.50')
  })

  it('does not throw away what was typed when the parent renders with the same format options', async () => {
    const user = userEvent.setup()
    const Parent = () => {
      const [count, setCount] = useState(0)

      return (
        <>
          <NumberInput label="Preço" formatOptions={{ style: 'currency', currency: 'BRL' }} />
          <button type="button" onClick={() => setCount(count + 1)}>
            renderizar {count}
          </button>
        </>
      )
    }

    renderWithProviders(<Parent />)
    await user.type(field(), '12')
    await user.click(screen.getByRole('button', { name: /renderizar/ }))

    expect(field()).toHaveValue('R$ 12,00')
  })
})

describe('NumberInput in a form', () => {
  it('submits the number, not the text on the screen, under the name of the field', async () => {
    const user = userEvent.setup()
    let data = new FormData()

    renderWithProviders(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          data = new FormData(event.currentTarget)
        }}
      >
        <NumberInput label="Preço" name="price" defaultValue={1234.5} />
        <NumberInput label="Vazio" name="empty" />
        <NumberInput label="Sem nome" />
        <button type="submit">Enviar</button>
      </form>
    )
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(data.get('price')).toBe('1234.5')
    expect(data.get('empty')).toBe('')
    expect([...data.keys()]).toEqual(['price', 'empty'])
    expect(screen.getAllByRole('spinbutton').every((input) => !input.hasAttribute('name'))).toBe(true)
  })

  it('submits the committed value when the form is sent right after typing', async () => {
    const user = userEvent.setup()
    let sent: FormDataEntryValue | null = null

    renderWithProviders(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sent = new FormData(event.currentTarget).get('price')
        }}
      >
        <NumberInput label="Preço" name="price" />
        <button type="submit">Enviar</button>
      </form>
    )
    await user.type(field(), '12,5')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(sent).toBe('12.5')
  })

  it('leaves a disabled field out of the form and takes the form attribute', () => {
    renderWithProviders(
      <>
        <NumberInput label="Preço" name="price" defaultValue={5} disabled form="other" />
        <form id="other" />
      </>
    )

    const hidden = document.querySelector('input[type="hidden"]') as HTMLInputElement

    expect(hidden).toBeDisabled()
    expect(hidden).toHaveAttribute('form', 'other')
    expect(hidden).toHaveValue('5')
  })

  it('has no hidden input without a name', () => {
    renderWithProviders(<NumberInput label="Preço" />)

    expect(document.querySelector('input[type="hidden"]')).toBeNull()
  })

  it('passes required to the visible input', () => {
    renderWithProviders(<NumberInput label="Preço" required />)

    expect(field()).toBeRequired()
  })
})

describe('NumberInput native attributes', () => {
  it('calls the handlers of the consumer for blur and focus', async () => {
    const user = userEvent.setup()
    const onFocus = vi.fn()
    const onBlur = vi.fn()

    renderWithProviders(<NumberInput label="Preço" onFocus={onFocus} onBlur={onBlur} />)
    await user.click(field())
    await user.type(field(), '5')
    await user.tab()

    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onBlur).toHaveBeenCalledTimes(1)
    expect(field()).toHaveValue('5')
  })

  it('lets the consumer replace the autocomplete and the keyboard hint, and keeps the placeholder', () => {
    const { unmount } = renderWithProviders(<NumberInput label="Preço" autoComplete="on" inputMode="text" placeholder="0,00" />)

    expect(field()).toHaveAttribute('autocomplete', 'on')
    expect(field()).toHaveAttribute('inputmode', 'text')
    expect(field()).toHaveAttribute('placeholder', '0,00')
    unmount()

    renderWithProviders(<NumberInput label="Preço" />)

    expect(field()).toHaveAttribute('placeholder', ' ')
  })

  it('marks the wrapper when disabled and disables the input', () => {
    renderWithProviders(<NumberInput label="Preço" disabled />)

    expect(field()).toBeDisabled()
    expect(field().closest('[data-slot="number-input"]')).toHaveAttribute('data-disabled')
  })

  it('works without a label, named by aria-label', () => {
    renderWithProviders(<NumberInput aria-label="Quantidade" />)

    expect(screen.getByRole('spinbutton', { name: 'Quantidade' })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="number-input-label"]')).toBeNull()
  })
})

describe('NumberInput accessibility', () => {
  it('has no axe violations in its states', async () => {
    const states = [
      <NumberInput key="a" label="Quantidade" />,
      <NumberInput key="b" label="Preço" defaultValue={1234.5} min={0} max={5000} helperText="Em reais" />,
      <NumberInput key="c" label="Preço" defaultValue={12} error="Valor inválido" />,
      <NumberInput key="d" label="Preço" defaultValue={12} disabled />,
      <NumberInput key="e" label="Preço" defaultValue={12} readOnly />,
      <NumberInput key="f" label="Preço" steppers={false} />,
      <NumberInput key="g" aria-label="Desconto" formatOptions={{ style: 'percent' }} step={0.01} defaultValue={0.15} />
    ]

    for (const state of states) {
      const { container, unmount } = renderWithProviders(state)

      expect(await axe(container), String(state.key)).toHaveNoViolations()
      unmount()
    }
  })
})
