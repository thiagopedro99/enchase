import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { useSegmentedControl } from '@components/common/SegmentedControl/useSegmentedControl.ts'

import type { UseSegmentedControlOptions } from '@components/common/SegmentedControl/types.ts'
import type { RefObject } from 'react'

type ShellProps = UseSegmentedControlOptions & {
  groupProps?: Record<string, unknown>
  itemProps?: (value: string) => Record<string, unknown>
}

const items = [{ value: 'a' }, { value: 'b' }, { value: 'c' }]

const withDisabledMiddle = [items[0], { ...items[1], disabled: true }, items[2]]

const Shell = ({ groupProps, itemProps, ...options }: ShellProps) => {
  const segmented = useSegmentedControl(options as UseSegmentedControlOptions)

  return (
    <div {...segmented.getGroupProps({ 'aria-label': 'View', ...groupProps })}>
      {options.items.map((item) => (
        <button key={item.value} {...segmented.getItemProps(item.value, itemProps?.(item.value))}>
          {item.value}
        </button>
      ))}
    </div>
  )
}

const Controlled = ({ onValueChange }: { onValueChange: (value: string) => void }) => {
  const [value, setValue] = useState('a')

  return (
    <>
      <button type="button" onClick={() => setValue('c')}>
        jump
      </button>

      <Shell items={items} value={value} onValueChange={onValueChange} />
    </>
  )
}

const checked = () => screen.getByRole('radio', { checked: true })

const radio = (name: string) => screen.getByRole('radio', { name })

describe('useSegmentedControl', () => {
  it('wires a radio group of radios, checked one at a time', () => {
    render(<Shell items={items} defaultValue="b" />)

    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio').map((item) => item.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false'])
    expect(screen.getAllByRole('radio').map((item) => item.getAttribute('type'))).toEqual(['button', 'button', 'button'])
  })

  it('wires a group of toggle buttons when it is multiple', () => {
    render(<Shell items={items} multiple defaultValue={['a', 'c']} />)

    expect(screen.getByRole('group', { name: 'View' })).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button').map((item) => item.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'true'])
    expect(screen.getAllByRole('button').every((item) => !item.hasAttribute('tabindex') && !item.hasAttribute('aria-checked'))).toBe(true)
  })

  it('keeps one radio in the tab order, the checked one, and the first enabled one when the checked is disabled', () => {
    const { unmount } = render(<Shell items={withDisabledMiddle} />)

    expect(screen.getAllByRole('radio').map((item) => item.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])
    unmount()

    const second = render(<Shell items={items} defaultValue="c" />)

    expect(screen.getAllByRole('radio').map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '-1', '0'])
    second.unmount()

    render(<Shell items={[{ value: 'a', disabled: true }, { value: 'b' }]} defaultValue="a" />)

    expect(screen.getAllByRole('radio').map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0'])
  })

  it('checks a radio when it is clicked, reports it once and keeps it when it is clicked again', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell items={items} onValueChange={onValueChange} />)
    await user.click(radio('b'))
    await user.click(radio('b'))

    expect(checked()).toHaveTextContent('b')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('b')
  })

  it('presses and releases each button on its own and reports the list in the order of the items', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell items={items} multiple onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: 'c' }))
    await user.click(screen.getByRole('button', { name: 'a' }))

    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'c'])

    await user.click(screen.getByRole('button', { name: 'c' }))

    expect(onValueChange).toHaveBeenLastCalledWith(['a'])
    expect(screen.getByRole('button', { name: 'a' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('reports an empty string when nothing is left checked, and reads an empty string as nothing checked', () => {
    render(<Shell items={items} value="" />)

    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument()
  })

  it('reports the choice and waits for the parent when it is controlled, then follows the parent', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Controlled onValueChange={onValueChange} />)
    await user.click(radio('b'))

    expect(onValueChange).toHaveBeenCalledWith('b')
    expect(checked()).toHaveTextContent('a')

    await user.click(screen.getByRole('button', { name: 'jump' }))

    expect(checked()).toHaveTextContent('c')
  })

  it('moves with the arrows, Home and End, wraps, skips a disabled radio and checks what it focuses', async () => {
    const user = userEvent.setup()

    render(<Shell items={withDisabledMiddle} />)
    await user.tab()

    expect(radio('a')).toHaveFocus()

    await user.keyboard('{ArrowRight}')

    expect(radio('c')).toHaveFocus()
    expect(checked()).toHaveTextContent('c')

    await user.keyboard('{ArrowDown}')

    expect(radio('a')).toHaveFocus()
    expect(checked()).toHaveTextContent('a')

    await user.keyboard('{ArrowLeft}')

    expect(checked()).toHaveTextContent('c')

    await user.keyboard('{Home}')

    expect(checked()).toHaveTextContent('a')

    await user.keyboard('{End}')

    expect(checked()).toHaveTextContent('c')
  })

  it('swaps the arrows when the group runs from right to left', async () => {
    const user = userEvent.setup()

    render(<Shell items={items} defaultValue="b" />)
    await user.tab()

    const computed = vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration)

    await user.keyboard('{ArrowRight}')

    expect(checked()).toHaveTextContent('a')

    computed.mockRestore()
  })

  it('does not move with the arrows when it is multiple', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell items={items} multiple onValueChange={onValueChange} />)
    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('button', { name: 'a' })).toHaveFocus()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('disables every item when it is disabled, and ignores the keys', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Shell items={items} disabled onValueChange={onValueChange} />)

    expect(screen.getAllByRole('radio').every((item) => item.hasAttribute('disabled'))).toBe(true)

    await user.click(radio('a'))
    await user.keyboard('{ArrowRight}')

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('chooses from outside with choose, in single and in multiple', () => {
    const single = renderHook(() => useSegmentedControl({ items }))

    act(() => single.result.current.choose('c'))

    expect(single.result.current.selected).toEqual(['c'])

    const many = renderHook(() => useSegmentedControl({ items, multiple: true }))

    act(() => many.result.current.choose('b'))
    act(() => many.result.current.choose('a'))

    expect(many.result.current.selected).toEqual(['a', 'b'])
  })

  it('treats a value that is not in the items as a disabled item that is not checked or in the tab order', () => {
    const { result } = renderHook(() => useSegmentedControl({ items, defaultValue: 'a' }))

    expect(result.current.getItemProps('missing')).toMatchObject({ disabled: true, tabIndex: -1, 'aria-checked': false })
  })

  it('passes the props of the consumer through, and chains its handlers before its own', async () => {
    const user = userEvent.setup()
    const clicked = vi.fn()
    const pressed = vi.fn()

    render(<Shell items={items} groupProps={{ className: 'group', onKeyDown: pressed }} itemProps={(value) => ({ className: 'item', 'aria-label': `option ${value}`, onClick: clicked })} />)

    expect(screen.getByRole('radiogroup')).toHaveClass('group')
    expect(screen.getAllByRole('radio')[0]).toHaveClass('item')
    expect(screen.getByRole('radio', { name: 'option b' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'option b' }))

    expect(clicked).toHaveBeenCalledTimes(1)
    expect(checked()).toHaveTextContent('b')

    await user.keyboard('{ArrowRight}')

    expect(pressed).toHaveBeenCalled()
    expect(checked()).toHaveTextContent('c')
  })

  it('still runs its own handler when the handler of the consumer prevents the default', async () => {
    const user = userEvent.setup()

    render(<Shell items={items} itemProps={() => ({ onClick: (event: { preventDefault: () => void }) => event.preventDefault() })} groupProps={{ onKeyDown: (event: { preventDefault: () => void }) => event.preventDefault() }} />)
    await user.click(radio('b'))

    expect(checked()).toHaveTextContent('b')

    await user.keyboard('{ArrowRight}')

    expect(checked()).toHaveTextContent('c')
  })

  it('keeps the ref of the consumer and its own, and focuses through them', async () => {
    const user = userEvent.setup()
    const refs: Record<string, RefObject<HTMLButtonElement | null>> = { a: createRef(), b: createRef(), c: createRef() }

    render(<Shell items={items} itemProps={(value) => ({ ref: refs[value] })} />)

    expect(Object.values(refs).map((ref) => ref.current?.textContent)).toEqual(['a', 'b', 'c'])

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(refs.b.current).toHaveFocus()
  })

  it('has no accessibility violations in a shell of its own, single or multiple', async () => {
    const single = render(<Shell items={withDisabledMiddle} defaultValue="a" />)

    expect(await axe(single.container)).toHaveNoViolations()
    single.unmount()

    const many = render(<Shell items={withDisabledMiddle} multiple defaultValue={['a']} />)

    expect(await axe(many.container)).toHaveNoViolations()
  })
})
