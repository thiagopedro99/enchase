import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'

const views = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' }
]

const withLockedBoard = [views[0], { ...views[1], disabled: true }, views[2]]

const radios = () => screen.getAllByRole('radio')

const checked = () => radios().flatMap((radio) => (radio.getAttribute('aria-checked') === 'true' ? [radio.textContent] : []))

const pressed = () => screen.getAllByRole('button').flatMap((button) => (button.getAttribute('aria-pressed') === 'true' ? [button.textContent] : []))

describe('SegmentedControl that chooses one', () => {
  it('exposes a radio group named by ariaLabel with one radio per item', () => {
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} />)

    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
    expect(radios().map((radio) => radio.textContent)).toEqual(['List', 'Board', 'Calendar'])
    expect(screen.getByRole('radio', { name: 'Board' }).tagName).toBe('BUTTON')
  })

  it('takes its name from aria-labelledby when there is no ariaLabel', () => {
    renderWithProviders(
      <>
        <h2 id="title">Layout</h2>
        <SegmentedControl aria-labelledby="title" items={views} />
      </>
    )

    expect(screen.getByRole('radiogroup', { name: 'Layout' })).toBeInTheDocument()
  })

  it('starts with nothing checked and makes the first option the only tab stop', () => {
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} />)

    expect(checked()).toEqual([])
    expect(radios().map((radio) => radio.tabIndex)).toEqual([0, -1, -1])
  })

  it('starts with the defaultValue checked and as the only tab stop', () => {
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} defaultValue="board" />)

    expect(checked()).toEqual(['Board'])
    expect(radios().map((radio) => radio.tabIndex)).toEqual([-1, 0, -1])
  })

  it('checks an option when it is clicked and reports its value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('radio', { name: 'Calendar' }))

    expect(checked()).toEqual(['Calendar'])
    expect(onValueChange.mock.calls).toEqual([['calendar']])
  })

  it('keeps the checked option when it is clicked again and does not report it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} defaultValue="list" onValueChange={onValueChange} />)

    await user.click(screen.getByRole('radio', { name: 'List' }))

    expect(checked()).toEqual(['List'])
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('follows the value prop when controlled and reports each change', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    const Controlled = () => {
      const [view, setView] = useState('list')

      return (
        <SegmentedControl
          ariaLabel="View"
          items={views}
          value={view}
          onValueChange={(next) => {
            onValueChange(next)
            setView(next)
          }}
        />
      )
    }

    renderWithProviders(<Controlled />)

    expect(checked()).toEqual(['List'])
    await user.click(screen.getByRole('radio', { name: 'Board' }))

    expect(checked()).toEqual(['Board'])
    expect(onValueChange.mock.calls).toEqual([['board']])
  })

  it('stays put when controlled and the owner refuses the change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} value="list" onValueChange={() => undefined} />)

    await user.click(screen.getByRole('radio', { name: 'Board' }))

    expect(checked()).toEqual(['List'])
  })

  it('can be controlled with nothing checked by passing an empty string', () => {
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} value="" onValueChange={() => undefined} />)

    expect(checked()).toEqual([])
  })

  it('enters on the checked option, moves and checks with the arrow keys, and wraps around', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderWithProviders(
      <>
        <SegmentedControl ariaLabel="View" items={views} defaultValue="list" onValueChange={onValueChange} />
        <button>After</button>
      </>
    )

    await user.tab()
    expect(screen.getByRole('radio', { name: 'List' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Board' })).toHaveFocus()
    expect(checked()).toEqual(['Board'])

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Calendar' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'List' })).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'Calendar' })).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(checked()).toEqual(['Board'])
    expect(onValueChange.mock.calls).toEqual([['board'], ['calendar'], ['list'], ['calendar'], ['board']])

    await user.tab()
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  it('goes to the first and to the last option with Home and End', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} defaultValue="board" />)

    await user.tab()
    await user.keyboard('{End}')
    expect(checked()).toEqual(['Calendar'])

    await user.keyboard('{Home}')
    expect(checked()).toEqual(['List'])
  })

  it('inverts the left and right arrows in a right-to-left control', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} defaultValue="board" style={{ direction: 'rtl' }} />)

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(checked()).toEqual(['List'])

    await user.keyboard('{ArrowLeft}')
    expect(checked()).toEqual(['Board'])
  })

  it('checks the focused option with Space and Enter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} />)

    await user.tab()
    await user.keyboard(' ')
    expect(checked()).toEqual(['List'])

    screen.getByRole('radio', { name: 'Calendar' }).focus()
    await user.keyboard('{Enter}')
    expect(checked()).toEqual(['Calendar'])
  })

  it('skips a disabled option with the arrow keys and cannot check it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SegmentedControl ariaLabel="View" items={withLockedBoard} defaultValue="list" />)

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Calendar' })).toHaveFocus()

    await user.click(screen.getByRole('radio', { name: 'Board' }))

    expect(screen.getByRole('radio', { name: 'Board' })).toBeDisabled()
    expect(checked()).toEqual(['Calendar'])
  })

  it('moves the tab stop to the first enabled option when the checked one is disabled', () => {
    renderWithProviders(<SegmentedControl ariaLabel="View" items={withLockedBoard} defaultValue="board" />)

    expect(radios().map((radio) => radio.tabIndex)).toEqual([0, -1, -1])
  })

  it('disables every option when the control is disabled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} defaultValue="list" disabled />)

    await user.click(screen.getByRole('radio', { name: 'Board' }))

    for (const radio of radios()) expect(radio).toBeDisabled()
    expect(checked()).toEqual(['List'])
  })

  it('names an option that has no text with its ariaLabel', () => {
    renderWithProviders(<SegmentedControl ariaLabel="View" items={[{ value: 'list', label: <svg data-testid="icon" />, ariaLabel: 'List view' }]} />)

    expect(screen.getByRole('radio', { name: 'List view' })).toBeInTheDocument()
  })
})

describe('SegmentedControl that chooses several', () => {
  it('exposes a group named by ariaLabel with a toggle button per item', () => {
    renderWithProviders(<SegmentedControl multiple ariaLabel="Days" items={views} />)

    expect(screen.getByRole('group', { name: 'Days' })).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'false'])
  })

  it('starts with the options of the defaultValue pressed', () => {
    renderWithProviders(<SegmentedControl multiple ariaLabel="Days" items={views} defaultValue={['list', 'calendar']} />)

    expect(pressed()).toEqual(['List', 'Calendar'])
  })

  it('presses and releases each option on its own and reports the list in the order of the items', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<SegmentedControl multiple ariaLabel="Days" items={views} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Calendar' }))
    await user.click(screen.getByRole('button', { name: 'List' }))
    await user.click(screen.getByRole('button', { name: 'Calendar' }))

    expect(pressed()).toEqual(['List'])
    expect(onValueChange.mock.calls).toEqual([[['calendar']], [['list', 'calendar']], [['list']]])
  })

  it('follows the value prop when controlled and stays put when the owner refuses', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SegmentedControl multiple ariaLabel="Days" items={views} value={['board']} onValueChange={() => undefined} />)

    await user.click(screen.getByRole('button', { name: 'List' }))

    expect(pressed()).toEqual(['Board'])
  })

  it('is controlled with an empty list', () => {
    renderWithProviders(<SegmentedControl multiple ariaLabel="Days" items={views} value={[]} onValueChange={() => undefined} />)

    expect(pressed()).toEqual([])
  })

  it('keeps every button in the tab order and does not move with the arrow keys', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SegmentedControl multiple ariaLabel="Days" items={views} />)

    expect(screen.getAllByRole('button').map((button) => button.tabIndex)).toEqual([0, 0, 0])

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'List' })).toHaveFocus()

    await user.tab()
    await user.keyboard(' ')

    expect(screen.getByRole('button', { name: 'Board' })).toHaveFocus()
    expect(pressed()).toEqual(['Board'])
  })

  it('does not press a disabled option and keeps a pressed disabled option in the list it reports', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<SegmentedControl multiple ariaLabel="Days" items={withLockedBoard} defaultValue={['board']} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Board' }))
    expect(onValueChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'List' }))

    expect(onValueChange).toHaveBeenCalledWith(['list', 'board'])
  })

  it('disables every button when the control is disabled', () => {
    renderWithProviders(<SegmentedControl multiple ariaLabel="Days" items={views} disabled />)

    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
  })
})

describe('SegmentedControl contract', () => {
  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <SegmentedControl ariaLabel="Plain" items={views} />
        <SegmentedControl ariaLabel="Chosen" items={views} defaultValue="board" />
        <SegmentedControl ariaLabel="One locked" items={withLockedBoard} defaultValue="list" size="sm" />
        <SegmentedControl ariaLabel="Disabled" items={views} defaultValue="list" disabled size="lg" fullWidth />
        <SegmentedControl multiple ariaLabel="Several" items={views} defaultValue={['list', 'calendar']} />
        <SegmentedControl multiple ariaLabel="Several disabled" items={withLockedBoard} disabled />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('marks the root and every item with a data-slot and the state of each item', () => {
    const { container } = renderWithProviders(<SegmentedControl ariaLabel="View" items={views} defaultValue="board" />)

    expect(container.querySelector('[data-slot="segmented-control"]')).toBe(screen.getByRole('radiogroup'))
    expect([...container.querySelectorAll('[data-slot="segmented-control-item"]')].map((item) => item.getAttribute('data-state'))).toEqual(['off', 'on', 'off'])
  })

  it('is medium by default and takes the size, the full width and the disabled flag', () => {
    const { unmount } = renderWithProviders(<SegmentedControl ariaLabel="View" items={views} />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-size', 'md')
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('data-full-width')
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('data-disabled')
    unmount()

    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} size="lg" fullWidth disabled />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-size', 'lg')
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-full-width')
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled')
  })

  it('forwards the ref to the root and keeps className and style with the caller last', () => {
    const ref = createRef<HTMLDivElement>()
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} ref={ref} className="mine" style={{ margin: '3px' }} />)
    const root = screen.getByRole('radiogroup')

    expect(ref.current).toBe(root)
    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.style.margin).toBe('3px')
  })

  it('passes other attributes and handlers to the root and lets a key handler of the caller stop the navigation', async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} defaultValue="list" data-testid="control" onKeyDown={onKeyDown} />)

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByTestId('control')).toBe(screen.getByRole('radiogroup'))
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(checked()).toEqual(['List'])
  })

  it('does not pass its own props to the page', () => {
    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} defaultValue="list" onValueChange={() => undefined} size="sm" fullWidth animation={false} />)
    const root = screen.getByRole('radiogroup')

    for (const name of ['items', 'arialabel', 'multiple', 'value', 'defaultvalue', 'onvaluechange', 'size', 'fullwidth', 'animation']) {
      expect(root, name).not.toHaveAttribute(name)
    }
  })

  it('sets the motion variables on the root and drops them for animation={false}', () => {
    const { unmount } = renderWithProviders(<SegmentedControl ariaLabel="View" items={views} />)

    expect(screen.getByRole('radiogroup').style.getPropertyValue('--enchase-segmented-control-duration')).not.toBe('0ms')
    expect(screen.getByRole('radiogroup').style.getPropertyValue('--enchase-segmented-control-duration')).not.toBe('')
    unmount()

    renderWithProviders(<SegmentedControl ariaLabel="View" items={views} animation={false} />)

    expect(screen.getByRole('radiogroup').style.getPropertyValue('--enchase-segmented-control-duration')).toBe('0ms')
  })
})
