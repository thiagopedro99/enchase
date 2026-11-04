import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { useTabs } from '@components/common/Tabs/useTabs.ts'
import { renderInBrowser } from '../../../support/harness.tsx'

import type { UseTabsOptions } from '@components/common/Tabs/types.ts'

const items = [{ value: 'one' }, { value: 'two' }, { value: 'three', disabled: true }, { value: 'four' }]

const Shell = (options: UseTabsOptions) => {
  const tabs = useTabs(options)

  return (
    <>
      <button type="button">before</button>

      <div {...tabs.getListProps({ 'aria-label': 'Sections' })}>
        {options.items.map((item) => (
          <button key={item.value} {...tabs.getTabProps(item.value)}>
            {item.value}
          </button>
        ))}
      </div>

      {options.items.map((item) => (
        <div key={item.value} {...tabs.getPanelProps(item.value)}>
          {item.value} panel
        </div>
      ))}
    </>
  )
}

const tab = (name: string) => page.getByRole('tab', { name }).element() as HTMLElement

const selected = () => (document.querySelector('[role="tab"][aria-selected="true"]') as HTMLElement).textContent

describe('useTabs in a real browser', () => {
  it('puts only the selected tab in the tab order, and the next stop is its panel', async () => {
    renderInBrowser(<Shell items={items} defaultValue="two" />)
    await userEvent.tab()

    expect(document.activeElement).toBe(page.getByRole('button', { name: 'before' }).element())

    await userEvent.tab()

    expect(document.activeElement).toBe(tab('two'))

    await userEvent.tab()

    expect(document.activeElement).toBe(page.getByRole('tabpanel').element())

    await userEvent.tab({ shift: true })

    expect(document.activeElement).toBe(tab('two'))
  })

  it('moves the focus and the selection with the arrows, wraps and skips a disabled tab', async () => {
    renderInBrowser(<Shell items={items} />)
    tab('one').focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(tab('two'))
    expect(selected()).toBe('two')

    await userEvent.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(tab('four'))

    await userEvent.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(tab('one'))

    await userEvent.keyboard('{End}')

    expect(document.activeElement).toBe(tab('four'))

    await userEvent.keyboard('{Home}')

    expect(selected()).toBe('one')
  })

  it('only moves the focus in manual activation, and selects with Enter', async () => {
    renderInBrowser(<Shell items={items} activation="manual" />)
    tab('one').focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(tab('two'))
    expect(selected()).toBe('one')

    await userEvent.keyboard('{Enter}')

    expect(selected()).toBe('two')
  })

  it('swaps the arrows in a list that runs from right to left', async () => {
    renderInBrowser(
      <div dir="rtl">
        <Shell items={items} defaultValue="two" />
      </div>
    )
    tab('two').focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(tab('one'))
    expect(selected()).toBe('one')
  })

  it('selects a tab with a click and shows only its panel', async () => {
    renderInBrowser(<Shell items={items} />)
    await userEvent.click(tab('four'))

    expect(document.activeElement).toBe(tab('four'))
    expect(selected()).toBe('four')
    expect(page.getByRole('tabpanel').element().textContent).toBe('four panel')
    expect(document.querySelectorAll('[role="tabpanel"]:not([hidden])')).toHaveLength(1)
    expect(getComputedStyle(document.querySelector('[role="tabpanel"][hidden]') as HTMLElement).display).toBe('none')
  })
})
