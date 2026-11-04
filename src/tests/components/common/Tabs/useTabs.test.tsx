import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { useTabs } from '@components/common/Tabs/useTabs.ts'

import type { UseTabsOptions } from '@components/common/Tabs/types.ts'
import type { RefObject } from 'react'

interface ShellProps extends UseTabsOptions {
  listProps?: Record<string, unknown>
  tabProps?: (value: string) => Record<string, unknown>
  panelProps?: (value: string) => Record<string, unknown>
}

const items = [{ value: 'one' }, { value: 'two' }, { value: 'three' }]

const withDisabledMiddle = [items[0], { ...items[1], disabled: true }, items[2]]

const Shell = ({ listProps, tabProps, panelProps, ...options }: ShellProps) => {
  const tabs = useTabs(options)

  return (
    <div>
      <div {...tabs.getListProps({ 'aria-label': 'Sections', ...listProps })}>
        {options.items.map((item) => (
          <button key={item.value} {...tabs.getTabProps(item.value, tabProps?.(item.value))}>
            {item.value}
          </button>
        ))}
      </div>

      {options.items.map((item) => (
        <div key={item.value} {...tabs.getPanelProps(item.value, panelProps?.(item.value))}>
          {item.value} panel
        </div>
      ))}
    </div>
  )
}

const selectedTab = () => screen.getByRole('tab', { selected: true })

describe('useTabs', () => {
  it('wires the tab list, the tabs and the panels with their roles, names and states', () => {
    render(<Shell items={items} />)

    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['one', 'two', 'three'])
    expect(selectedTab()).toHaveTextContent('one')
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('one panel')
  })

  it('links each tab to its panel in both directions', () => {
    render(<Shell items={items} />)

    const tab = screen.getByRole('tab', { name: 'one' })
    const panel = screen.getByRole('tabpanel')

    expect(tab).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', tab.id)
    expect(tab.id).not.toBe('')
    expect(panel).toHaveAttribute('tabindex', '0')
  })

  it('keeps one tab in the tab order, the selected one, and the first enabled one when the selected is disabled', () => {
    const { rerender } = render(<Shell items={items} defaultValue="two" />)

    expect(screen.getAllByRole('tab').map((tab) => tab.getAttribute('tabindex'))).toEqual(['-1', '0', '-1'])

    rerender(<Shell items={[{ value: 'one' }, { value: 'two', disabled: true }, { value: 'three' }]} value="two" />)

    expect(screen.getAllByRole('tab').map((tab) => tab.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])
  })

  it('starts on the first enabled tab, or on the default value', () => {
    const { unmount } = render(<Shell items={[{ value: 'one', disabled: true }, { value: 'two' }]} />)

    expect(selectedTab()).toHaveTextContent('two')

    unmount()
    render(<Shell items={items} defaultValue="three" />)

    expect(selectedTab()).toHaveTextContent('three')
  })

  it('moves with the arrows, Home and End, wraps, skips disabled tabs and selects what it focuses', async () => {
    const user = userEvent.setup()

    render(<Shell items={withDisabledMiddle} />)
    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(selectedTab()).toHaveTextContent('three')
    expect(screen.getByRole('tab', { name: 'three' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')

    expect(selectedTab()).toHaveTextContent('one')

    await user.keyboard('{End}')

    expect(selectedTab()).toHaveTextContent('three')

    await user.keyboard('{Home}')

    expect(selectedTab()).toHaveTextContent('one')

    await user.keyboard('{ArrowLeft}')

    expect(selectedTab()).toHaveTextContent('three')
  })

  it('swaps the arrows when the list runs from right to left', async () => {
    const user = userEvent.setup()

    render(<Shell items={items} />)
    await user.tab()

    const computed = vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration)

    await user.keyboard('{ArrowRight}')

    expect(selectedTab()).toHaveTextContent('three')

    computed.mockRestore()
  })

  it('only focuses with the arrows in manual activation, and selects with a click or Enter', async () => {
    const user = userEvent.setup()

    render(<Shell items={items} activation="manual" />)
    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: 'two' })).toHaveFocus()
    expect(selectedTab()).toHaveTextContent('one')

    await user.keyboard('{Enter}')

    expect(selectedTab()).toHaveTextContent('two')

    await user.click(screen.getByRole('tab', { name: 'three' }))

    expect(selectedTab()).toHaveTextContent('three')
  })

  it('ignores the arrows with a modifier key', async () => {
    const user = userEvent.setup()

    render(<Shell items={items} />)
    await user.tab()
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')

    expect(selectedTab()).toHaveTextContent('one')
  })

  it('reports the choice and waits for the parent when it is controlled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell items={items} value="one" onValueChange={onValueChange} />)
    await user.click(screen.getByRole('tab', { name: 'three' }))

    expect(onValueChange).toHaveBeenCalledWith('three')
    expect(selectedTab()).toHaveTextContent('one')
  })

  it('follows a parent that updates the value', async () => {
    const user = userEvent.setup()

    const Parent = () => {
      const [value, setValue] = useState('one')

      return <Shell items={items} value={value} onValueChange={setValue} />
    }

    render(<Parent />)
    await user.click(screen.getByRole('tab', { name: 'two' }))

    expect(selectedTab()).toHaveTextContent('two')
  })

  it('selects from outside with select, and exposes the indexes that the markup needs', () => {
    const { result } = renderHook(() => useTabs({ items: withDisabledMiddle }))

    expect(result.current).toMatchObject({ selected: 'one', activeIndex: 0, tabbableIndex: 0 })

    act(() => result.current.select('three'))

    expect(result.current).toMatchObject({ selected: 'three', activeIndex: 2, tabbableIndex: 2 })
  })

  it('treats a value that is not in the items as a tab that is neither selected nor in the tab order', () => {
    const { result } = renderHook(() => useTabs({ items: [{ value: 'one', disabled: true }], defaultValue: 'missing' }))

    expect(result.current.activeIndex).toBe(-1)
    expect(result.current.getTabProps('missing')).toMatchObject({ 'aria-selected': false, tabIndex: -1 })
    expect(result.current.getPanelProps('missing')).toMatchObject({ hidden: true })
  })

  it('passes the props of the consumer through, and chains its handlers before its own', async () => {
    const user = userEvent.setup()
    const clicked = vi.fn()
    const pressed = vi.fn()

    render(<Shell items={items} listProps={{ className: 'list', 'data-extra': 'yes', onKeyDown: pressed }} tabProps={() => ({ className: 'tab', onClick: clicked })} panelProps={() => ({ className: 'panel' })} />)

    expect(screen.getByRole('tablist')).toHaveClass('list')
    expect(screen.getByRole('tablist')).toHaveAttribute('data-extra', 'yes')
    expect(screen.getAllByRole('tab')[0]).toHaveClass('tab')
    expect(screen.getByRole('tabpanel')).toHaveClass('panel')

    await user.click(screen.getByRole('tab', { name: 'two' }))

    expect(clicked).toHaveBeenCalledTimes(1)
    expect(selectedTab()).toHaveTextContent('two')

    await user.keyboard('{ArrowRight}')

    expect(pressed).toHaveBeenCalled()
    expect(selectedTab()).toHaveTextContent('three')
  })

  it('still runs its own handler when the handler of the consumer prevents the default', async () => {
    const user = userEvent.setup()

    render(<Shell items={items} tabProps={() => ({ onClick: (event: { preventDefault: () => void }) => event.preventDefault() })} listProps={{ onKeyDown: (event: { preventDefault: () => void }) => event.preventDefault() }} />)
    await user.click(screen.getByRole('tab', { name: 'two' }))

    expect(selectedTab()).toHaveTextContent('two')

    await user.keyboard('{ArrowRight}')

    expect(selectedTab()).toHaveTextContent('three')
  })

  it('lets an id that comes from outside win without rewriting the reference on the other side', () => {
    const { rerender } = render(<Shell items={items} tabProps={(value) => ({ id: `mine-${value}` })} />)

    expect(screen.getAllByRole('tab').map((tab) => tab.id)).toEqual(['mine-one', 'mine-two', 'mine-three'])
    expect(screen.getByRole('tabpanel')).not.toHaveAttribute('aria-labelledby', 'mine-one')
    expect(screen.getByRole('tab', { name: 'one' })).toHaveAttribute('aria-controls', screen.getByRole('tabpanel').id)

    rerender(<Shell items={items} tabProps={(value) => ({ id: `mine-${value}` })} panelProps={(value) => ({ 'aria-labelledby': `mine-${value}` })} />)

    expect(screen.getByRole('tabpanel', { name: 'one' })).toHaveAttribute('aria-labelledby', 'mine-one')
  })

  it('keeps the ref of the consumer and its own, and focuses through them', async () => {
    const user = userEvent.setup()
    const refs: Record<string, RefObject<HTMLButtonElement | null>> = { one: createRef(), two: createRef(), three: createRef() }

    render(<Shell items={items} tabProps={(value) => ({ ref: refs[value] })} />)

    expect(Object.values(refs).map((ref) => ref.current?.textContent)).toEqual(['one', 'two', 'three'])

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(refs.two.current).toHaveFocus()
  })

  it('has no accessibility violations in a shell of its own', async () => {
    const { container } = render(<Shell items={withDisabledMiddle} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
