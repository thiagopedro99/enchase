import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Combobox } from '@components/common/Combobox/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { parts } from '../../../support/hookProbes.ts'

import type { ComboboxOption } from '@components/common/Combobox/types.ts'

const runtimes: ComboboxOption[] = [
  { value: 'node', label: 'Node.js' },
  { value: 'deno', label: 'Deno' },
  { value: 'bun', label: 'Bun' },
  { value: 'angular', label: 'Angular' }
]

const field = () => document.querySelector<HTMLInputElement>('[data-slot="combobox-input"]') as HTMLInputElement

const listbox = () => document.body.querySelector<HTMLElement>('[data-slot="combobox-listbox"]')

const options = () => parts('combobox-option')

const opened = () => expect.poll(() => listbox()?.getAttribute('data-state')).toBe('open')

const closed = () => expect.poll(listbox).toBeNull()

const transparent = 'rgba(0, 0, 0, 0)'

const lit = (option: Element) => getComputedStyle(option).backgroundColor !== transparent

const active = () => options().flatMap((option, index) => (option.hasAttribute('data-active') ? [index] : []))

const Runtimes = ({ onSubmit }: { onSubmit: () => void }) => (
  <form
    style={{ position: 'absolute', top: 120, left: 300, width: 320 }}
    onSubmit={(event) => {
      event.preventDefault()
      onSubmit()
    }}
  >
    <Combobox label="Runtime" options={runtimes} />
    <button type="submit">Send</button>
  </form>
)

describe('the first match of the Combobox in a real browser', () => {
  it('highlights the only option left after typing nod, announces it, and chooses it with Enter without submitting the form', async () => {
    let submits = 0
    renderInBrowser(<Runtimes onSubmit={() => (submits += 1)} />)

    await userEvent.click(field())
    await userEvent.keyboard('nod')
    await opened()

    expect(options().map((option) => option.textContent)).toEqual(['Node.js'])
    expect(field().getAttribute('aria-activedescendant')).toBe(options()[0].id)
    expect(active()).toEqual([0])
    expect(lit(options()[0])).toBe(true)

    await userEvent.keyboard('{Enter}')
    await closed()

    expect(field().value).toBe('Node.js')
    expect(submits).toBe(0)

    await userEvent.keyboard('{Enter}')

    expect(submits).toBe(1)
  })

  it('starts the arrows from the first of two options left, and the highlight follows them', async () => {
    renderInBrowser(<Runtimes onSubmit={() => undefined} />)

    await userEvent.click(field())
    await userEvent.keyboard('no')
    await opened()

    expect(options().map((option) => option.textContent)).toEqual(['Node.js', 'Deno'])
    expect(active()).toEqual([0])
    expect(options().map(lit)).toEqual([true, false])

    await userEvent.keyboard('{ArrowDown}')

    expect(active()).toEqual([1])
    expect(options().map(lit)).toEqual([false, true])
    expect(field().getAttribute('aria-activedescendant')).toBe(options()[1].id)

    await userEvent.keyboard('{Enter}')
    await closed()

    expect(field().value).toBe('Deno')
  })

  it('keeps the first match active while more text narrows the list, and drops it when the text is emptied', async () => {
    renderInBrowser(<Runtimes onSubmit={() => undefined} />)

    await userEvent.click(field())
    await userEvent.keyboard('n')
    await opened()

    expect(options().map((option) => option.textContent)).toEqual(['Node.js', 'Deno', 'Bun', 'Angular'])
    expect(active()).toEqual([0])

    await userEvent.keyboard('o')

    expect(options().map((option) => option.textContent)).toEqual(['Node.js', 'Deno'])
    expect(active()).toEqual([0])

    await userEvent.keyboard('{Backspace}{Backspace}')

    expect(field().value).toBe('')
    expect(options()).toHaveLength(4)
    expect(active()).toEqual([])
    expect(field().hasAttribute('aria-activedescendant')).toBe(false)
  })

  it('highlights nothing when the list opens without typing, and leaves Enter to the form', async () => {
    let submits = 0
    renderInBrowser(<Runtimes onSubmit={() => (submits += 1)} />)

    await userEvent.click(field())
    await opened()

    expect(options()).toHaveLength(4)
    expect(active()).toEqual([])
    expect(options().map(lit)).toEqual([false, false, false, false])
    expect(field().hasAttribute('aria-activedescendant')).toBe(false)

    await userEvent.keyboard('{Enter}')

    expect(submits).toBe(1)
    expect(field().value).toBe('')
  })
})
