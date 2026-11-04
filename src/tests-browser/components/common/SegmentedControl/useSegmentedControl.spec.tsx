import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { useSegmentedControl } from '@components/common/SegmentedControl/useSegmentedControl.ts'
import { renderInBrowser } from '../../../support/harness.tsx'

import type { UseSegmentedControlOptions } from '@components/common/SegmentedControl/types.ts'

const items = [{ value: 'a' }, { value: 'b', disabled: true }, { value: 'c' }, { value: 'd' }]

const Shell = (options: UseSegmentedControlOptions) => {
  const segmented = useSegmentedControl(options)

  return (
    <>
      <button type="button">before</button>

      <div {...segmented.getGroupProps({ 'aria-label': 'View' })}>
        {options.items.map((item) => (
          <button key={item.value} {...segmented.getItemProps(item.value)}>
            {item.value}
          </button>
        ))}
      </div>

      <button type="button">after</button>
    </>
  )
}

const item = (name: string) => page.getByRole(document.querySelector('[role="radiogroup"]') ? 'radio' : 'button', { name, exact: true }).element() as HTMLElement

const checked = () => (document.querySelector('[role="radio"][aria-checked="true"]') as HTMLElement | null)?.textContent

describe('useSegmentedControl in a real browser', () => {
  it('enters the group on one stop and leaves it with the next Tab, as a radio group does', async () => {
    renderInBrowser(<Shell items={items} defaultValue="c" />)
    await userEvent.tab()
    await userEvent.tab()

    expect(document.activeElement).toBe(item('c'))

    await userEvent.tab()

    expect(document.activeElement).toBe(page.getByRole('button', { name: 'after' }).element())

    await userEvent.tab({ shift: true })

    expect(document.activeElement).toBe(item('c'))
  })

  it('moves the focus and the choice with the arrows, wraps and skips a disabled item', async () => {
    renderInBrowser(<Shell items={items} />)
    item('a').focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(item('c'))
    expect(checked()).toBe('c')

    await userEvent.keyboard('{ArrowDown}{ArrowDown}')

    expect(document.activeElement).toBe(item('a'))

    await userEvent.keyboard('{End}')

    expect(checked()).toBe('d')
  })

  it('swaps the arrows in a group that runs from right to left', async () => {
    renderInBrowser(
      <div dir="rtl">
        <Shell items={items} defaultValue="c" />
      </div>
    )
    item('c').focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(checked()).toBe('a')
  })

  it('checks an item with a click and keeps it checked when it is clicked again', async () => {
    renderInBrowser(<Shell items={items} />)
    await userEvent.click(item('d'))
    await userEvent.click(item('d'))

    expect(checked()).toBe('d')
    expect(document.activeElement).toBe(item('d'))
  })

  it('keeps every button in the tab order when it is multiple, toggles with Space and does not move with the arrows', async () => {
    renderInBrowser(<Shell items={items} multiple />)
    await userEvent.tab()
    await userEvent.tab()

    expect(document.activeElement).toBe(item('a'))

    await userEvent.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(item('a'))

    await userEvent.keyboard(' ')

    expect(item('a').getAttribute('aria-pressed')).toBe('true')

    await userEvent.tab()

    expect(document.activeElement).toBe(item('c'))

    await userEvent.keyboard(' ')
    await userEvent.keyboard(' ')

    expect(item('c').getAttribute('aria-pressed')).toBe('false')
    expect(item('a').getAttribute('aria-pressed')).toBe('true')
  })
})
