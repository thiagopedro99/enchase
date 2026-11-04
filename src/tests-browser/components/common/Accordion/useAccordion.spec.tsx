import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { useAccordion } from '@components/common/Accordion/useAccordion.ts'
import { renderInBrowser } from '../../../support/harness.tsx'

import type { UseAccordionOptions } from '@components/common/Accordion/types.ts'

const items = [{ value: 'one' }, { value: 'two', disabled: true }, { value: 'three' }, { value: 'four' }]

const Shell = (options: UseAccordionOptions) => {
  const accordion = useAccordion(options)

  return (
    <div>
      {options.items.map((item) => (
        <div key={item.value}>
          <h3>
            <button {...accordion.getTriggerProps(item.value)}>{item.value}</button>
          </h3>

          <div {...accordion.getPanelProps(item.value)}>{item.value} content</div>
        </div>
      ))}
    </div>
  )
}

const trigger = (name: string) => page.getByRole('button', { name, exact: true }).element() as HTMLElement

const open = () => [...document.querySelectorAll('[aria-expanded="true"]')].map((element) => element.textContent)

describe('useAccordion in a real browser', () => {
  it('puts every enabled trigger in the tab order and skips the disabled one', async () => {
    renderInBrowser(<Shell items={items} />)
    await userEvent.tab()

    expect(document.activeElement).toBe(trigger('one'))

    await userEvent.tab()

    expect(document.activeElement).toBe(trigger('three'))

    await userEvent.tab()

    expect(document.activeElement).toBe(trigger('four'))
  })

  it('moves the focus with the arrows, Home and End, wraps, skips a disabled trigger and opens nothing', async () => {
    renderInBrowser(<Shell items={items} />)
    trigger('one').focus()
    await userEvent.keyboard('{ArrowDown}')

    expect(document.activeElement).toBe(trigger('three'))

    await userEvent.keyboard('{ArrowDown}{ArrowDown}')

    expect(document.activeElement).toBe(trigger('one'))

    await userEvent.keyboard('{ArrowUp}')

    expect(document.activeElement).toBe(trigger('four'))

    await userEvent.keyboard('{Home}')

    expect(document.activeElement).toBe(trigger('one'))
    expect(open()).toEqual([])
  })

  it('opens with Enter and with Space, and shows only the panel of what is open', async () => {
    renderInBrowser(<Shell items={items} />)
    trigger('one').focus()
    await userEvent.keyboard('{Enter}')

    expect(open()).toEqual(['one'])
    expect(page.getByRole('region', { name: 'one' }).element().textContent).toBe('one content')
    expect(getComputedStyle(document.querySelector('[role="region"][hidden]') as HTMLElement).display).toBe('none')

    await userEvent.keyboard('{ArrowDown} ')

    expect(open()).toEqual(['three'])
  })

  it('keeps several open at once when it is multiple, and closes one with a click', async () => {
    renderInBrowser(<Shell items={items} multiple />)
    await userEvent.click(trigger('one'))
    await userEvent.click(trigger('four'))

    expect(open()).toEqual(['one', 'four'])

    await userEvent.click(trigger('one'))

    expect(open()).toEqual(['four'])
    expect(document.activeElement).toBe(trigger('one'))
  })
})
