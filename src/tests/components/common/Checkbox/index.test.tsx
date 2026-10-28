import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Checkbox } from '@components/common/Checkbox/index.tsx'

const items = ['Email', 'Phone', 'Post']

const SelectAll = () => {
  const [selected, setSelected] = useState<string[]>([])
  const all = selected.length === items.length

  return (
    <fieldset>
      <legend>Channels</legend>
      <Checkbox label="All channels" checked={all} indeterminate={selected.length > 0 && !all} onChange={() => setSelected(all ? [] : items)} />
      {items.map((item) => (
        <Checkbox key={item} label={item} checked={selected.includes(item)} onChange={() => setSelected(selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item])} />
      ))}
    </fieldset>
  )
}

const Switching = () => {
  const [mixed, setMixed] = useState(true)

  return (
    <>
      <Checkbox label="Mixed" indeterminate={mixed} />
      <button type="button" onClick={() => setMixed(!mixed)}>
        Toggle mixed
      </button>
    </>
  )
}

describe('Checkbox', () => {
  it('toggles uncontrolled and exposes the checked state to assistive technology', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Accept terms" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' })

    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
  })

  it('toggles by clicking the label text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Accept terms" />)

    await user.click(screen.getByText('Accept terms'))

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('is reachable by keyboard and toggles with Space', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Accept terms" />)

    await user.tab()
    expect(screen.getByRole('checkbox')).toHaveFocus()
    await user.keyboard(' ')

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Locked" disabled />)

    await user.click(screen.getByText('Locked'))

    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Checkbox label="Accept terms" />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Checkbox contract', () => {
  it('marks the wrapper and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Checkbox label="Aceito" />)

    for (const part of ['checkbox', 'checkbox-input', 'checkbox-box', 'checkbox-label']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('keeps className on the native input and the wrapper ones on the root', () => {
    const { container } = renderWithProviders(<Checkbox label="Aceito" className="mine" wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />)
    const root = container.querySelector('[data-slot="checkbox"]') as HTMLElement

    expect(screen.getByRole('checkbox').className.split(' ').at(-1)).toBe('mine')
    expect(root.className.split(' ').at(-1)).toBe('outer')
    expect(root.style.margin).toBe('3px')
  })

  it('flags the wrapper as disabled', () => {
    const { container } = renderWithProviders(<Checkbox label="Aceito" disabled />)

    expect(container.querySelector('[data-slot="checkbox"]')).toHaveAttribute('data-disabled')
  })
})

describe('Checkbox indeterminate', () => {
  it('is mixed for assistive technology through the native property', () => {
    renderWithProviders(<Checkbox label="Select all" indeterminate />)
    const checkbox = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select all' })

    expect(checkbox).toBePartiallyChecked()
    expect(checkbox.indeterminate).toBe(true)
  })

  it('is not mixed by default, with false or with undefined', () => {
    renderWithProviders(
      <>
        <Checkbox label="Default" />
        <Checkbox label="False" indeterminate={false} />
        <Checkbox label="Undefined" indeterminate={undefined} />
      </>
    )

    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).not.toBePartiallyChecked()
  })

  it('keeps the checked value apart from the mixed state', () => {
    renderWithProviders(<Checkbox label="Both" indeterminate defaultChecked />)
    const checkbox = screen.getByRole<HTMLInputElement>('checkbox')

    expect(checkbox).toBePartiallyChecked()
    expect(checkbox.checked).toBe(true)
  })

  it('follows the prop when it changes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Switching />)
    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toBePartiallyChecked()
    await user.click(screen.getByRole('button', { name: 'Toggle mixed' }))
    expect(checkbox).not.toBePartiallyChecked()
    await user.click(screen.getByRole('button', { name: 'Toggle mixed' }))

    expect(checkbox).toBePartiallyChecked()
  })

  it('stays mixed after a click when the prop does not change, and still toggles the value', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Mixed" indeterminate />)
    const checkbox = screen.getByRole('checkbox')

    await user.click(checkbox)

    expect(checkbox).toBePartiallyChecked()
    expect(checkbox).toBeChecked()
  })

  it('stays mixed after Space and after a click on the label', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Mixed" indeterminate />)
    const checkbox = screen.getByRole('checkbox')

    await user.tab()
    await user.keyboard(' ')
    expect(checkbox).toBePartiallyChecked()

    await user.click(screen.getByText('Mixed'))
    expect(checkbox).toBePartiallyChecked()
  })

  it('lets the app clear the mixed state from onChange', async () => {
    const user = userEvent.setup()
    const Harness = () => {
      const [state, setState] = useState<'some' | 'all'>('some')

      return <Checkbox label="Some" checked={state === 'all'} indeterminate={state === 'some'} onChange={() => setState('all')} />
    }

    renderWithProviders(<Harness />)
    await user.click(screen.getByRole('checkbox'))

    expect(screen.getByRole('checkbox')).not.toBePartiallyChecked()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('drives a select-all box from the boxes it summarizes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SelectAll />)
    const all = screen.getByRole('checkbox', { name: 'All channels' })

    expect(all).not.toBeChecked()
    expect(all).not.toBePartiallyChecked()

    await user.click(screen.getByRole('checkbox', { name: 'Email' }))
    expect(all).toBePartiallyChecked()

    await user.click(screen.getByRole('checkbox', { name: 'Phone' }))
    await user.click(screen.getByRole('checkbox', { name: 'Post' }))
    expect(all).toBeChecked()
    expect(all).not.toBePartiallyChecked()

    await user.click(screen.getByRole('checkbox', { name: 'Phone' }))
    expect(all).toBePartiallyChecked()

    await user.click(all)
    expect(screen.getAllByRole('checkbox').every((box) => (box as HTMLInputElement).checked)).toBe(true)
    expect(all).not.toBePartiallyChecked()

    await user.click(all)
    expect(screen.getAllByRole('checkbox').every((box) => !(box as HTMLInputElement).checked)).toBe(true)
  })

  it('runs the onClick and the onChange of the caller', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onChange = vi.fn()
    renderWithProviders(<Checkbox label="Mixed" indeterminate onClick={onClick} onChange={onChange} />)

    await user.click(screen.getByRole('checkbox'))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('does not restore the mixed state when the caller prevents the click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Mixed" indeterminate onClick={(event) => event.preventDefault()} />)
    const checkbox = screen.getByRole('checkbox')

    await user.click(checkbox)

    expect(checkbox).not.toBeChecked()
    expect(checkbox).toBePartiallyChecked()
  })

  it('hands the input to an object ref and to a callback ref', () => {
    const objectRef = createRef<HTMLInputElement>()
    const callbackRef = vi.fn()
    const { unmount } = renderWithProviders(
      <>
        <Checkbox label="Object" ref={objectRef} indeterminate />
        <Checkbox label="Callback" ref={callbackRef} />
      </>
    )

    expect(objectRef.current).toBe(screen.getByRole('checkbox', { name: 'Object' }))
    expect(callbackRef).toHaveBeenCalledWith(screen.getByRole('checkbox', { name: 'Callback' }))

    unmount()

    expect(objectRef.current).toBeNull()
  })

  it('has no axe violations when mixed', async () => {
    const { container } = renderWithProviders(<SelectAll />)

    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'Email' }))

    expect(await axe(container)).toHaveNoViolations()
  })
})
