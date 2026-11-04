import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { useAccordion } from '@components/common/Accordion/useAccordion.ts'

import type { UseAccordionOptions } from '@components/common/Accordion/types.ts'
import type { RefObject } from 'react'

interface ShellProps extends UseAccordionOptions {
  triggerProps?: (value: string) => Record<string, unknown>
  panelProps?: (value: string) => Record<string, unknown>
}

const items = [{ value: 'a' }, { value: 'b' }, { value: 'c' }]

const withDisabledMiddle = [items[0], { ...items[1], disabled: true }, items[2]]

const Shell = ({ triggerProps, panelProps, ...options }: ShellProps) => {
  const accordion = useAccordion(options)

  return (
    <div>
      {options.items.map((item) => (
        <div key={item.value}>
          <h3>
            <button {...accordion.getTriggerProps(item.value, triggerProps?.(item.value))}>{item.value}</button>
          </h3>

          <div {...accordion.getPanelProps(item.value, panelProps?.(item.value))}>{item.value} panel</div>
        </div>
      ))}
    </div>
  )
}

const Controlled = ({ onValueChange }: { onValueChange: (value: string[]) => void }) => {
  const [value, setValue] = useState<string[]>([])

  return (
    <>
      <button type="button" onClick={() => setValue(['c'])}>
        open c
      </button>

      <Shell items={items} value={value} onValueChange={onValueChange} />
    </>
  )
}

const trigger = (name: string) => screen.getByRole('button', { name })

const expanded = () => screen.getAllByRole('button', { expanded: true }).map((button) => button.textContent)

describe('useAccordion', () => {
  it('wires each trigger to its panel in both directions, with roles and states', () => {
    render(<Shell items={items} defaultValue={['b']} />)

    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-expanded'))).toEqual(['false', 'true', 'false'])
    expect(screen.getAllByRole('button').map((button) => button.getAttribute('type'))).toEqual(['button', 'button', 'button'])
    expect(screen.getAllByRole('region')).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'b' })).toHaveTextContent('b panel')
    expect(trigger('b').getAttribute('aria-controls')).toBe(screen.getByRole('region', { name: 'b' }).id)
  })

  it('starts closed, or with the default values open', () => {
    const { unmount } = render(<Shell items={items} />)

    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0)
    unmount()

    render(<Shell items={items} multiple defaultValue={['a', 'c']} />)

    expect(expanded()).toEqual(['a', 'c'])
  })

  it('keeps one open at a time unless it is multiple', () => {
    render(<Shell items={items} defaultValue={['b', 'c']} />)

    expect(expanded()).toEqual(['b'])
  })

  it('opens on click, closes the other one, reports each change and closes on a second click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell items={items} onValueChange={onValueChange} />)
    await user.click(trigger('a'))

    expect(expanded()).toEqual(['a'])
    expect(onValueChange).toHaveBeenLastCalledWith(['a'])

    await user.click(trigger('c'))

    expect(expanded()).toEqual(['c'])
    expect(onValueChange).toHaveBeenLastCalledWith(['c'])

    await user.click(trigger('c'))

    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0)
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it('opens several at once when it is multiple, in the order they were opened', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell items={items} multiple onValueChange={onValueChange} />)
    await user.click(trigger('c'))
    await user.click(trigger('a'))

    expect(expanded()).toEqual(['a', 'c'])
    expect(onValueChange).toHaveBeenLastCalledWith(['c', 'a'])

    await user.click(trigger('c'))

    expect(onValueChange).toHaveBeenLastCalledWith(['a'])
  })

  it('reports the choice and waits for the parent when it is controlled, then follows the parent', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Controlled onValueChange={onValueChange} />)
    await user.click(trigger('a'))

    expect(onValueChange).toHaveBeenCalledWith(['a'])
    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0)

    await user.click(trigger('open c'))

    expect(expanded()).toEqual(['c'])
  })

  it('does not open a disabled item', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell items={withDisabledMiddle} onValueChange={onValueChange} />)

    expect(trigger('b')).toBeDisabled()

    await user.click(trigger('b'))

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('moves the focus with the arrows, Home and End, wraps and skips a disabled trigger, without opening anything', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell items={withDisabledMiddle} onValueChange={onValueChange} />)
    await user.tab()

    expect(trigger('a')).toHaveFocus()

    await user.keyboard('{ArrowDown}')

    expect(trigger('c')).toHaveFocus()

    await user.keyboard('{ArrowDown}')

    expect(trigger('a')).toHaveFocus()

    await user.keyboard('{ArrowUp}')

    expect(trigger('c')).toHaveFocus()

    await user.keyboard('{Home}')

    expect(trigger('a')).toHaveFocus()

    await user.keyboard('{End}')

    expect(trigger('c')).toHaveFocus()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('ignores the arrows with a modifier key', async () => {
    const user = userEvent.setup()

    render(<Shell items={items} />)
    await user.tab()
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}')

    expect(trigger('a')).toHaveFocus()
  })

  it('toggles from outside with toggle', () => {
    const { result } = renderHook(() => useAccordion({ items, multiple: true }))

    act(() => result.current.toggle('b'))
    act(() => result.current.toggle('c'))

    expect(result.current.expanded).toEqual(['b', 'c'])

    act(() => result.current.toggle('b'))

    expect(result.current.expanded).toEqual(['c'])
  })

  it('treats a value that is not in the items as a closed item', () => {
    const { result } = renderHook(() => useAccordion({ items, defaultValue: ['a'] }))

    expect(result.current.getTriggerProps('missing')).toMatchObject({ 'aria-expanded': false })
    expect(result.current.getPanelProps('missing')).toMatchObject({ hidden: true })
  })

  it('passes the props of the consumer through, and chains its handlers before its own', async () => {
    const user = userEvent.setup()
    const clicked = vi.fn()
    const pressed = vi.fn()

    render(<Shell items={items} triggerProps={() => ({ className: 'trigger', onClick: clicked, onKeyDown: pressed })} panelProps={() => ({ className: 'panel', 'data-extra': 'yes' })} />)

    expect(screen.getAllByRole('button')[0]).toHaveClass('trigger')
    expect(document.querySelector('.panel')).toHaveAttribute('data-extra', 'yes')

    await user.click(trigger('b'))

    expect(clicked).toHaveBeenCalledTimes(1)
    expect(expanded()).toEqual(['b'])

    await user.keyboard('{ArrowDown}')

    expect(pressed).toHaveBeenCalled()
    expect(trigger('c')).toHaveFocus()
  })

  it('still runs its own handler when the handler of the consumer prevents the default', async () => {
    const user = userEvent.setup()

    render(<Shell items={items} triggerProps={() => ({ onClick: (event: { preventDefault: () => void }) => event.preventDefault(), onKeyDown: (event: { preventDefault: () => void }) => event.preventDefault() })} />)
    await user.click(trigger('b'))

    expect(expanded()).toEqual(['b'])

    await user.keyboard('{ArrowDown}')

    expect(trigger('c')).toHaveFocus()
  })

  it('lets an id that comes from outside win without rewriting the reference on the other side', () => {
    const { rerender } = render(<Shell items={items} defaultValue={['a']} triggerProps={(value) => ({ id: `mine-${value}` })} />)

    expect(screen.getAllByRole('button').map((button) => button.id)).toEqual(['mine-a', 'mine-b', 'mine-c'])
    expect(document.querySelector('[role="region"]')).not.toHaveAttribute('aria-labelledby', 'mine-a')

    rerender(<Shell items={items} defaultValue={['a']} triggerProps={(value) => ({ id: `mine-${value}` })} panelProps={(value) => ({ 'aria-labelledby': `mine-${value}` })} />)

    expect(screen.getByRole('region', { name: 'a' })).toHaveAttribute('aria-labelledby', 'mine-a')
  })

  it('keeps the ref of the consumer and its own, and focuses through them', async () => {
    const user = userEvent.setup()
    const refs: Record<string, RefObject<HTMLButtonElement | null>> = { a: createRef(), b: createRef(), c: createRef() }

    render(<Shell items={items} triggerProps={(value) => ({ ref: refs[value] })} />)

    expect(Object.values(refs).map((ref) => ref.current?.textContent)).toEqual(['a', 'b', 'c'])

    await user.tab()
    await user.keyboard('{ArrowDown}')

    expect(refs.b.current).toHaveFocus()
  })

  it('has no accessibility violations in a shell of its own', async () => {
    const { container } = render(<Shell items={withDisabledMiddle} defaultValue={['a']} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
