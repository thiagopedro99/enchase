import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { createRef, useState } from 'react'

import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { axe } from '@tests/axe.ts'

import type { Ref } from 'react'

const items = ['Email', 'Phone', 'Post']

const failure = 'Accept the terms to continue'

const shapeOf = (element: Element): unknown => ({ tag: element.tagName.toLowerCase(), attributes: element.getAttributeNames().sort(), children: [...element.children].map(shapeOf) })

const bareCheckbox = {
  tag: 'label',
  attributes: ['class', 'data-slot', 'style'],
  children: [
    { tag: 'input', attributes: ['class', 'data-slot', 'type'], children: [] },
    { tag: 'span', attributes: ['aria-hidden', 'class', 'data-slot'], children: [{ tag: 'span', attributes: ['class'], children: [] }] },
    { tag: 'span', attributes: ['class', 'data-slot'], children: [] }
  ]
}

const Failing = ({ inputRef }: { inputRef?: Ref<HTMLInputElement> }) => {
  const [error, setError] = useState<string | undefined>(undefined)

  return (
    <>
      <button type="button" onClick={() => setError(failure)}>
        Fail
      </button>
      <button type="button" onClick={() => setError(undefined)}>
        Clear
      </button>
      <Checkbox label="Accept the terms" error={error} ref={inputRef} />
    </>
  )
}

const ValidatingOnChange = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  return <Checkbox label="Accept the terms" defaultChecked error={error} onChange={(event) => setError(event.target.checked ? undefined : failure)} />
}

const MixedAndFailing = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  return (
    <>
      <button type="button" onClick={() => setError('Required')}>
        Fail
      </button>
      <button type="button" onClick={() => setError(undefined)}>
        Clear
      </button>
      <Checkbox label="Mixed" indeterminate error={error} />
    </>
  )
}

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

describe('Checkbox field', () => {
  it('always wraps the label in a field, which is flagged only while a message shows', () => {
    const { container } = renderWithProviders(
      <>
        <Checkbox label="Plain" />
        <Checkbox label="With helper" helperText="Help" />
        <Checkbox label="With error" error="Required" />
      </>
    )
    const fields = [...container.querySelectorAll('[data-slot="checkbox-field"]')]

    expect(fields).toHaveLength(3)
    expect(fields.map((field) => field.hasAttribute('data-has-message'))).toEqual([false, true, true])

    for (const field of fields) {
      expect(field.parentElement).toBe(container)
      expect(field.firstElementChild).toHaveAttribute('data-slot', 'checkbox')
    }
  })

  it('gives the field nothing but the slot and the flag, with and without a message', () => {
    const { container } = renderWithProviders(
      <>
        <Checkbox label="Plain" />
        <Checkbox label="With error" error="Required" wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />
      </>
    )
    const [plain, described] = [...container.querySelectorAll('[data-slot="checkbox-field"]')]

    expect(plain.getAttributeNames().sort()).toEqual(['class', 'data-slot'])
    expect(described.getAttributeNames().sort()).toEqual(['class', 'data-has-message', 'data-slot'])
    expect(described.className).not.toContain('outer')
  })

  it('keeps the nodes and the attributes of the label as they always were', () => {
    const { container } = renderWithProviders(<Checkbox label="Accept" />)

    expect(shapeOf(container.querySelector('[data-slot="checkbox"]') as Element)).toEqual(bareCheckbox)
  })

  it('does not flag the field or render a message when the messages are undefined or empty', () => {
    const { container } = renderWithProviders(
      <>
        <Checkbox label="Accept" error={undefined} helperText={undefined} />
        <Checkbox label="Accept" error="" helperText="" />
      </>
    )

    expect(container.querySelectorAll('[data-slot="checkbox-field"]')).toHaveLength(2)
    expect(container.querySelector('[data-has-message]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="checkbox-error"]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="checkbox-helper"]')).not.toBeInTheDocument()

    for (const root of container.querySelectorAll('[data-slot="checkbox"]')) expect(shapeOf(root)).toEqual(bareCheckbox)
  })

  it('leaves the aria attributes of the caller as they are', () => {
    renderWithProviders(
      <>
        <Checkbox label="Described" aria-describedby="hint" aria-invalid="true" />
        <Checkbox label="Valid" aria-invalid={false} />
      </>
    )

    expect(screen.getByRole('checkbox', { name: 'Described' })).toHaveAttribute('aria-describedby', 'hint')
    expect(screen.getByRole('checkbox', { name: 'Described' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('checkbox', { name: 'Valid' })).toHaveAttribute('aria-invalid', 'false')
  })
})

describe('Checkbox input', () => {
  it('is the very same element, and so is its label, before, while and after an error', async () => {
    const user = userEvent.setup()
    const ref = vi.fn()
    renderWithProviders(<Failing inputRef={ref} />)
    const input = screen.getByRole('checkbox')
    const label = input.closest('label')

    await user.click(screen.getByRole('button', { name: 'Fail' }))

    expect(screen.getByRole('alert')).toHaveTextContent(failure)
    expect(screen.getByRole('checkbox')).toBe(input)
    expect(input.closest('label')).toBe(label)

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBe(input)
    expect(input.closest('label')).toBe(label)
    expect(ref.mock.calls).toEqual([[input]])
  })

  it('keeps the focus when the error appears and when it goes away', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ValidatingOnChange />)
    const input = screen.getByRole('checkbox')

    await user.tab()
    expect(input).toHaveFocus()

    await user.keyboard(' ')

    expect(screen.getByRole('alert')).toHaveTextContent(failure)
    expect(screen.getByRole('checkbox')).toBe(input)
    expect(input).toHaveFocus()

    await user.keyboard(' ')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(input).toHaveFocus()
  })

  it('keeps the checked state of an uncontrolled checkbox when the error arrives and when it goes away', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Failing />)

    await user.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('checkbox')).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Fail' }))

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('keeps the mixed state when a message appears and goes away', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MixedAndFailing />)

    expect(screen.getByRole('checkbox')).toBePartiallyChecked()
    await user.click(screen.getByRole('button', { name: 'Fail' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    expect(screen.getByRole('checkbox')).toBePartiallyChecked()

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBePartiallyChecked()
  })
})

describe('Checkbox messages', () => {
  it('shows the error as an alert and marks the checkbox as invalid and described by it', () => {
    renderWithProviders(<Checkbox label="Accept the terms" error="Accept the terms to continue" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Accept the terms' })

    expect(screen.getByRole('alert')).toHaveTextContent('Accept the terms to continue')
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    expect(checkbox).toHaveAccessibleDescription('Accept the terms to continue')
  })

  it('describes the checkbox with the helper text, which is not an alert, and does not mark it as invalid', () => {
    renderWithProviders(<Checkbox label="Accept the terms" helperText="You can read them first" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Accept the terms' })

    expect(checkbox).toHaveAccessibleDescription('You can read them first')
    expect(checkbox).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('drops the helper text while there is an error and brings it back when the error goes away', async () => {
    const user = userEvent.setup()
    const Toggling = () => {
      const [error, setError] = useState<string | undefined>('Accept the terms to continue')

      return (
        <>
          <button type="button" onClick={() => setError(undefined)}>
            Clear
          </button>
          <Checkbox label="Accept the terms" helperText="You can read them first" error={error} />
        </>
      )
    }
    renderWithProviders(<Toggling />)
    const checkbox = screen.getByRole('checkbox')

    expect(screen.queryByText('You can read them first')).not.toBeInTheDocument()
    expect(checkbox).toHaveAccessibleDescription('Accept the terms to continue')

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.getByText('You can read them first')).toBeInTheDocument()
    expect(checkbox).toHaveAccessibleDescription('You can read them first')
    expect(checkbox).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('puts the aria-describedby of the caller before the message', () => {
    renderWithProviders(
      <>
        <p id="hint">Extra</p>
        <Checkbox label="Accept the terms" helperText="Help" aria-describedby="hint" />
      </>
    )
    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toHaveAccessibleDescription('Extra Help')
    expect(checkbox.getAttribute('aria-describedby')?.split(' ')[0]).toBe('hint')
  })

  it('keeps the aria-invalid of the caller without an error, and an error wins over aria-invalid false', () => {
    renderWithProviders(
      <>
        <Checkbox label="Invalid by hand" aria-invalid="true" />
        <Checkbox label="Wrong" aria-invalid="false" error="Required" />
      </>
    )

    expect(screen.getByRole('checkbox', { name: 'Invalid by hand' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('checkbox', { name: 'Wrong' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('takes the ids of the messages from the id of the checkbox', () => {
    renderWithProviders(
      <>
        <Checkbox label="With error" id="terms" error="Required" />
        <Checkbox label="With helper" id="news" helperText="Help" />
      </>
    )

    expect(screen.getByRole('checkbox', { name: 'With error' })).toHaveAttribute('id', 'terms')
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'terms-error')
    expect(screen.getByRole('checkbox', { name: 'With error' })).toHaveAttribute('aria-describedby', 'terms-error')
    expect(screen.getByText('Help')).toHaveAttribute('id', 'news-helper')
    expect(screen.getByRole('checkbox', { name: 'With helper' })).toHaveAttribute('aria-describedby', 'news-helper')
  })

  it('generates the ids of the messages of each checkbox without an id, and does not give the input an id', () => {
    renderWithProviders(
      <>
        <Checkbox label="First" error="One" />
        <Checkbox label="Second" error="Two" />
      </>
    )
    const [first, second] = screen.getAllByRole('checkbox')

    expect(first).not.toHaveAttribute('id')
    expect(second).not.toHaveAttribute('id')
    expect(first.getAttribute('aria-describedby')).not.toBe(second.getAttribute('aria-describedby'))
    expect(first).toHaveAccessibleDescription('One')
    expect(second).toHaveAccessibleDescription('Two')
  })

  it('keeps the message out of the label, so the accessible name is the label text and a click on the message does not check the box', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Accept the terms" error="Accept the terms to continue" />)
    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toHaveAccessibleName('Accept the terms')
    expect(checkbox.closest('label')).not.toContainElement(screen.getByRole('alert'))

    await user.click(screen.getByRole('alert'))
    expect(checkbox).not.toBeChecked()

    await user.click(screen.getByText('Accept the terms'))
    expect(checkbox).toBeChecked()
  })

  it('puts the message right after the label, inside one field', () => {
    const { container } = renderWithProviders(<Checkbox label="Accept the terms" error="Required" />)
    const field = container.querySelector('[data-slot="checkbox-field"]') as HTMLElement

    expect(field.parentElement).toBe(container)
    expect([...field.children].map((child) => child.getAttribute('data-slot'))).toEqual(['checkbox', 'checkbox-error'])
  })

  it('marks the field and each message with a data-slot', () => {
    const { container } = renderWithProviders(
      <>
        <Checkbox label="With error" error="Required" />
        <Checkbox label="With helper" helperText="Help" />
      </>
    )

    expect(container.querySelectorAll('[data-slot="checkbox-field"]')).toHaveLength(2)
    expect(container.querySelector('[data-slot="checkbox-error"]')).toHaveTextContent('Required')
    expect(container.querySelector('[data-slot="checkbox-helper"]')).toHaveTextContent('Help')
  })

  it('keeps the wrapper className, the wrapper style and the data-slot of the root on the label', () => {
    const { container } = renderWithProviders(<Checkbox label="Accept" error="Required" wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />)
    const root = container.querySelector('[data-slot="checkbox"]') as HTMLElement
    const field = container.querySelector('[data-slot="checkbox-field"]') as HTMLElement

    expect(root.tagName).toBe('LABEL')
    expect(root.className.split(' ').at(-1)).toBe('outer')
    expect(root.style.margin).toBe('3px')
    expect(field.className).not.toContain('outer')
  })

  it('shows the message of a disabled checkbox and flags the label as disabled', () => {
    const { container } = renderWithProviders(<Checkbox label="Locked" disabled error="Required" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    expect(screen.getByRole('checkbox')).toBeDisabled()
    expect(container.querySelector('[data-slot="checkbox"]')).toHaveAttribute('data-disabled')
  })

  it('does not pass its own props to the page', () => {
    renderWithProviders(<Checkbox label="Accept" error="Required" helperText="Help" />)

    for (const name of ['error', 'helpertext']) expect(screen.getByRole('checkbox'), name).not.toHaveAttribute(name)
  })

  it('hands the input to the ref when there is a message', () => {
    const ref = createRef<HTMLInputElement>()
    renderWithProviders(<Checkbox label="Accept" error="Required" ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('checkbox'))
  })

  it('has no axe violations with a helper text and with an error, in every state', async () => {
    const { container } = renderWithProviders(
      <>
        <Checkbox label="Helper" helperText="You can read them first" />
        <Checkbox label="Error" error="Accept the terms to continue" />
        <Checkbox label="Checked" error="Required" defaultChecked />
        <Checkbox label="Mixed" error="Required" indeterminate />
        <Checkbox label="Disabled" error="Required" disabled />
        <Checkbox aria-label="Without a visible label" error="Required" />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
