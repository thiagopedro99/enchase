import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { createRef, useState } from 'react'

import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { axe } from '@tests/axe.ts'

import type { Ref } from 'react'

const failure = 'Could not save the setting'

const shapeOf = (element: Element): unknown => ({ tag: element.tagName.toLowerCase(), attributes: element.getAttributeNames().sort(), children: [...element.children].map(shapeOf) })

const bareSwitch = {
  tag: 'label',
  attributes: ['class', 'data-slot', 'style'],
  children: [
    { tag: 'input', attributes: ['class', 'data-slot', 'role', 'type'], children: [] },
    { tag: 'span', attributes: ['aria-hidden', 'class', 'data-slot'], children: [{ tag: 'span', attributes: ['class', 'data-slot'], children: [] }] },
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
      <Switch label="Notifications" error={error} ref={inputRef} />
    </>
  )
}

const ValidatingOnChange = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  return <Switch label="Notifications" defaultChecked error={error} onChange={(event) => setError(event.target.checked ? undefined : failure)} />
}

describe('Switch', () => {
  it('exposes a switch named by its label, off by default', () => {
    renderWithProviders(<Switch label="Notificações" />)
    const control = screen.getByRole('switch', { name: 'Notificações' })

    expect(control.tagName).toBe('INPUT')
    expect(control).toHaveAttribute('type', 'checkbox')
    expect(control).not.toBeChecked()
  })

  it('toggles uncontrolled by click and exposes the state as aria-checked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Switch label="Notificações" />)
    const control = screen.getByRole('switch', { name: 'Notificações' })

    await user.click(control)
    expect(control).toBeChecked()
    expect(control).toHaveAccessibleName('Notificações')

    await user.click(control)
    expect(control).not.toBeChecked()
  })

  it('toggles by clicking the label text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Switch label="Notificações" />)

    await user.click(screen.getByText('Notificações'))

    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('is reachable by keyboard and toggles with Space', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Switch label="Notificações" />)

    await user.tab()
    expect(screen.getByRole('switch')).toHaveFocus()
    await user.keyboard(' ')

    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('starts on with defaultChecked', () => {
    renderWithProviders(<Switch label="Notificações" defaultChecked />)

    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('follows the checked prop when controlled and reports each change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const Controlled = () => {
      const [on, setOn] = useState(false)

      return (
        <Switch
          label="Notificações"
          checked={on}
          onChange={(event) => {
            onChange(event.target.checked)
            setOn(event.target.checked)
          }}
        />
      )
    }
    renderWithProviders(<Controlled />)

    await user.click(screen.getByRole('switch'))
    expect(screen.getByRole('switch')).toBeChecked()
    await user.click(screen.getByRole('switch'))

    expect(screen.getByRole('switch')).not.toBeChecked()
    expect(onChange.mock.calls).toEqual([[true], [false]])
  })

  it('stays put when controlled and the owner refuses the change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Switch label="Notificações" checked={false} onChange={() => undefined} />)

    await user.click(screen.getByRole('switch'))

    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Switch label="Bloqueado" disabled />)

    await user.click(screen.getByText('Bloqueado'))

    expect(screen.getByRole('switch')).toBeDisabled()
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('is skipped by the keyboard when disabled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Switch label="Bloqueado" disabled />)

    await user.tab()

    expect(screen.getByRole('switch')).not.toHaveFocus()
  })

  it('takes its name from aria-label when there is no visible label', () => {
    renderWithProviders(<Switch aria-label="Modo escuro" />)

    expect(screen.getByRole('switch', { name: 'Modo escuro' })).toBeInTheDocument()
  })

  it('takes a description and a form name and value', () => {
    renderWithProviders(
      <>
        <p id="hint">Avisos por e-mail</p>
        <Switch label="Notificações" aria-describedby="hint" name="alerts" value="on" defaultChecked />
      </>
    )
    const control = screen.getByRole('switch', { name: 'Notificações' })

    expect(control).toHaveAccessibleDescription('Avisos por e-mail')
    expect(control).toHaveAttribute('name', 'alerts')
    expect(control).toHaveAttribute('value', 'on')
  })

  it('submits its value with the form only while on', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <form aria-label="Preferências">
        <Switch label="Notificações" name="alerts" />
      </form>
    )
    const data = () => new FormData(screen.getByRole('form') as HTMLFormElement).get('alerts')

    expect(data()).toBeNull()
    await user.click(screen.getByRole('switch'))

    expect(data()).toBe('on')
  })

  it('forwards the ref to the native input', () => {
    const ref = createRef<HTMLInputElement>()
    renderWithProviders(<Switch label="Notificações" ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('switch'))
  })

  it('does not pass its own props to the page', () => {
    renderWithProviders(<Switch label="Notificações" wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} animation={false} />)
    const control = screen.getByRole('switch')

    for (const name of ['label', 'wrapperclassname', 'wrapperstyle', 'animation']) {
      expect(control, name).not.toHaveAttribute(name)
    }
  })

  it('keeps the switch role and the checkbox type whatever the caller passes', () => {
    renderWithProviders(<Switch label="Notificações" {...({ role: 'checkbox', type: 'text' } as object)} />)
    const control = screen.getByRole('switch')

    expect(control).toHaveAttribute('type', 'checkbox')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('keeps ids and names unique across switches', () => {
    renderWithProviders(
      <>
        <Switch label="Primeiro" />
        <Switch label="Segundo" />
      </>
    )

    expect(screen.getAllByRole('switch')).toHaveLength(2)
    expect(screen.getByRole('switch', { name: 'Primeiro' })).not.toBe(screen.getByRole('switch', { name: 'Segundo' }))
  })

  it('hides the decorative track from assistive technology', () => {
    const { container } = renderWithProviders(<Switch label="Notificações" />)

    expect(container.querySelector('[data-slot="switch-track"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <Switch label="Desligado" />
        <Switch label="Ligado" defaultChecked />
        <Switch label="Bloqueado" disabled />
        <Switch aria-label="Sem texto visível" />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Switch contract', () => {
  it('marks the wrapper and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Switch label="Ligado" />)

    for (const part of ['switch', 'switch-input', 'switch-track', 'switch-thumb', 'switch-label']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('omits the label part when there is no label', () => {
    const { container } = renderWithProviders(<Switch aria-label="Modo escuro" />)

    expect(container.querySelector('[data-slot="switch-label"]')).not.toBeInTheDocument()
  })

  it('keeps className on the native input and the wrapper ones on the root', () => {
    const { container } = renderWithProviders(<Switch label="Ligado" className="mine" wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />)
    const root = container.querySelector('[data-slot="switch"]') as HTMLElement

    expect(screen.getByRole('switch').className.split(' ').at(-1)).toBe('mine')
    expect(root.className.split(' ').at(-1)).toBe('outer')
    expect(root.style.margin).toBe('3px')
  })

  it('keeps the caller style on the native input', () => {
    renderWithProviders(<Switch label="Ligado" style={{ margin: '5px' }} />)

    expect(screen.getByRole('switch').style.margin).toBe('5px')
  })

  it('flags the wrapper as disabled', () => {
    const { container } = renderWithProviders(<Switch label="Ligado" disabled />)

    expect(container.querySelector('[data-slot="switch"]')).toHaveAttribute('data-disabled')
  })

  it('does not flag the wrapper as disabled otherwise', () => {
    const { container } = renderWithProviders(<Switch label="Ligado" />)

    expect(container.querySelector('[data-slot="switch"]')).not.toHaveAttribute('data-disabled')
  })

  it('sets the motion variables on the root and drops them for animation={false}', () => {
    const { container, unmount } = renderWithProviders(<Switch label="Ligado" />)
    const root = () => container.querySelector('[data-slot="switch"]') as HTMLElement

    expect(root().style.getPropertyValue('--enchase-switch-duration')).toBe('150ms')
    unmount()

    const off = renderWithProviders(<Switch label="Ligado" animation={false} />)

    expect(off.container.querySelector<HTMLElement>('[data-slot="switch"]')?.style.getPropertyValue('--enchase-switch-duration')).toBe('0ms')
  })

  it('takes a custom duration through the animation tuning', () => {
    const { container } = renderWithProviders(<Switch label="Ligado" animation={{ tuning: { duration: 0.4 } }} />)

    expect((container.querySelector('[data-slot="switch"]') as HTMLElement).style.getPropertyValue('--enchase-switch-duration')).toBe('400ms')
  })
})

describe('Switch field', () => {
  it('always wraps the label in a field, which is flagged only while a message shows', () => {
    const { container } = renderWithProviders(
      <>
        <Switch label="Plain" />
        <Switch label="With helper" helperText="Help" />
        <Switch label="With error" error="Required" />
      </>
    )
    const fields = [...container.querySelectorAll('[data-slot="switch-field"]')]

    expect(fields).toHaveLength(3)
    expect(fields.map((field) => field.hasAttribute('data-has-message'))).toEqual([false, true, true])

    for (const field of fields) {
      expect(field.parentElement).toBe(container)
      expect(field.firstElementChild).toHaveAttribute('data-slot', 'switch')
    }
  })

  it('gives the field nothing but the slot and the flag, with and without a message', () => {
    const { container } = renderWithProviders(
      <>
        <Switch label="Plain" />
        <Switch label="With error" error="Required" wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />
      </>
    )
    const [plain, described] = [...container.querySelectorAll('[data-slot="switch-field"]')]

    expect(plain.getAttributeNames().sort()).toEqual(['class', 'data-slot'])
    expect(described.getAttributeNames().sort()).toEqual(['class', 'data-has-message', 'data-slot'])
    expect(described.className).not.toContain('outer')
  })

  it('keeps the nodes and the attributes of the label as they always were', () => {
    const { container } = renderWithProviders(<Switch label="Notifications" />)

    expect(shapeOf(container.querySelector('[data-slot="switch"]') as Element)).toEqual(bareSwitch)
  })

  it('does not flag the field or render a message when the messages are undefined or empty', () => {
    const { container } = renderWithProviders(
      <>
        <Switch label="Notifications" error={undefined} helperText={undefined} />
        <Switch label="Notifications" error="" helperText="" />
      </>
    )

    expect(container.querySelectorAll('[data-slot="switch-field"]')).toHaveLength(2)
    expect(container.querySelector('[data-has-message]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="switch-error"]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="switch-helper"]')).not.toBeInTheDocument()

    for (const root of container.querySelectorAll('[data-slot="switch"]')) expect(shapeOf(root)).toEqual(bareSwitch)
  })

  it('leaves the aria attributes of the caller as they are', () => {
    renderWithProviders(
      <>
        <Switch label="Described" aria-describedby="hint" aria-invalid="true" />
        <Switch label="Valid" aria-invalid={false} />
      </>
    )

    expect(screen.getByRole('switch', { name: 'Described' })).toHaveAttribute('aria-describedby', 'hint')
    expect(screen.getByRole('switch', { name: 'Described' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('switch', { name: 'Valid' })).toHaveAttribute('aria-invalid', 'false')
  })
})

describe('Switch input', () => {
  it('is the very same element, and so is its label, before, while and after an error', async () => {
    const user = userEvent.setup()
    const ref = vi.fn()
    renderWithProviders(<Failing inputRef={ref} />)
    const input = screen.getByRole('switch')
    const label = input.closest('label')

    await user.click(screen.getByRole('button', { name: 'Fail' }))

    expect(screen.getByRole('alert')).toHaveTextContent(failure)
    expect(screen.getByRole('switch')).toBe(input)
    expect(input.closest('label')).toBe(label)

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('switch')).toBe(input)
    expect(input.closest('label')).toBe(label)
    expect(ref.mock.calls).toEqual([[input]])
  })

  it('keeps the focus when the error appears and when it goes away', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ValidatingOnChange />)
    const input = screen.getByRole('switch')

    await user.tab()
    expect(input).toHaveFocus()

    await user.keyboard(' ')

    expect(screen.getByRole('alert')).toHaveTextContent(failure)
    expect(screen.getByRole('switch')).toBe(input)
    expect(input).toHaveFocus()

    await user.keyboard(' ')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(input).toHaveFocus()
  })

  it('keeps the on state of an uncontrolled switch when the error arrives and when it goes away', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Failing />)

    await user.click(screen.getByRole('switch'))
    expect(screen.getByRole('switch')).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Fail' }))

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeChecked()
  })
})

describe('Switch messages', () => {
  it('shows the error as an alert and marks the switch as invalid and described by it', () => {
    renderWithProviders(<Switch label="Receive notifications" error="Turn notifications on to continue" />)
    const control = screen.getByRole('switch', { name: 'Receive notifications' })

    expect(screen.getByRole('alert')).toHaveTextContent('Turn notifications on to continue')
    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(control).toHaveAccessibleDescription('Turn notifications on to continue')
  })

  it('describes the switch with the helper text, which is not an alert, and does not mark it as invalid', () => {
    renderWithProviders(<Switch label="Receive notifications" helperText="One summary a day" />)
    const control = screen.getByRole('switch', { name: 'Receive notifications' })

    expect(control).toHaveAccessibleDescription('One summary a day')
    expect(control).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('drops the helper text while there is an error and brings it back when the error goes away', async () => {
    const user = userEvent.setup()
    const Toggling = () => {
      const [error, setError] = useState<string | undefined>('Turn notifications on to continue')

      return (
        <>
          <button type="button" onClick={() => setError(undefined)}>
            Clear
          </button>
          <Switch label="Receive notifications" helperText="One summary a day" error={error} />
        </>
      )
    }
    renderWithProviders(<Toggling />)
    const control = screen.getByRole('switch')

    expect(screen.queryByText('One summary a day')).not.toBeInTheDocument()
    expect(control).toHaveAccessibleDescription('Turn notifications on to continue')

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.getByText('One summary a day')).toBeInTheDocument()
    expect(control).toHaveAccessibleDescription('One summary a day')
    expect(control).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('puts the aria-describedby of the caller before the message', () => {
    renderWithProviders(
      <>
        <p id="hint">Extra</p>
        <Switch label="Receive notifications" helperText="Help" aria-describedby="hint" />
      </>
    )
    const control = screen.getByRole('switch')

    expect(control).toHaveAccessibleDescription('Extra Help')
    expect(control.getAttribute('aria-describedby')?.split(' ')[0]).toBe('hint')
  })

  it('keeps the aria-invalid of the caller without an error, and an error wins over aria-invalid false', () => {
    renderWithProviders(
      <>
        <Switch label="Invalid by hand" aria-invalid="true" />
        <Switch label="Wrong" aria-invalid="false" error="Required" />
      </>
    )

    expect(screen.getByRole('switch', { name: 'Invalid by hand' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('switch', { name: 'Wrong' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('takes the ids of the messages from the id of the switch', () => {
    renderWithProviders(
      <>
        <Switch label="With error" id="alerts" error="Required" />
        <Switch label="With helper" id="news" helperText="Help" />
      </>
    )

    expect(screen.getByRole('switch', { name: 'With error' })).toHaveAttribute('id', 'alerts')
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'alerts-error')
    expect(screen.getByRole('switch', { name: 'With error' })).toHaveAttribute('aria-describedby', 'alerts-error')
    expect(screen.getByText('Help')).toHaveAttribute('id', 'news-helper')
    expect(screen.getByRole('switch', { name: 'With helper' })).toHaveAttribute('aria-describedby', 'news-helper')
  })

  it('generates the ids of the messages of each switch without an id, and does not give the input an id', () => {
    renderWithProviders(
      <>
        <Switch label="First" error="One" />
        <Switch label="Second" error="Two" />
      </>
    )
    const [first, second] = screen.getAllByRole('switch')

    expect(first).not.toHaveAttribute('id')
    expect(second).not.toHaveAttribute('id')
    expect(first.getAttribute('aria-describedby')).not.toBe(second.getAttribute('aria-describedby'))
    expect(first).toHaveAccessibleDescription('One')
    expect(second).toHaveAccessibleDescription('Two')
  })

  it('keeps the message out of the label, so the accessible name is the label text and a click on the message does not toggle the switch', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Switch label="Receive notifications" error="Turn notifications on to continue" />)
    const control = screen.getByRole('switch')

    expect(control).toHaveAccessibleName('Receive notifications')
    expect(control.closest('label')).not.toContainElement(screen.getByRole('alert'))

    await user.click(screen.getByRole('alert'))
    expect(control).not.toBeChecked()

    await user.click(screen.getByText('Receive notifications'))
    expect(control).toBeChecked()
  })

  it('puts the message right after the label, inside one field', () => {
    const { container } = renderWithProviders(<Switch label="Receive notifications" error="Required" />)
    const field = container.querySelector('[data-slot="switch-field"]') as HTMLElement

    expect(field.parentElement).toBe(container)
    expect([...field.children].map((child) => child.getAttribute('data-slot'))).toEqual(['switch', 'switch-error'])
  })

  it('marks the field and each message with a data-slot', () => {
    const { container } = renderWithProviders(
      <>
        <Switch label="With error" error="Required" />
        <Switch label="With helper" helperText="Help" />
      </>
    )

    expect(container.querySelectorAll('[data-slot="switch-field"]')).toHaveLength(2)
    expect(container.querySelector('[data-slot="switch-error"]')).toHaveTextContent('Required')
    expect(container.querySelector('[data-slot="switch-helper"]')).toHaveTextContent('Help')
  })

  it('keeps the wrapper className, the wrapper style and the data-slot of the root on the label', () => {
    const { container } = renderWithProviders(<Switch label="On" error="Required" wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />)
    const root = container.querySelector('[data-slot="switch"]') as HTMLElement
    const field = container.querySelector('[data-slot="switch-field"]') as HTMLElement

    expect(root.tagName).toBe('LABEL')
    expect(root.className.split(' ').at(-1)).toBe('outer')
    expect(root.style.margin).toBe('3px')
    expect(field.className).not.toContain('outer')
  })

  it('shows the message of a disabled switch and flags the label as disabled', () => {
    const { container } = renderWithProviders(<Switch label="Locked" disabled error="Required" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    expect(screen.getByRole('switch')).toBeDisabled()
    expect(container.querySelector('[data-slot="switch"]')).toHaveAttribute('data-disabled')
  })

  it('does not pass its own props to the page', () => {
    renderWithProviders(<Switch label="On" error="Required" helperText="Help" />)

    for (const name of ['error', 'helpertext']) expect(screen.getByRole('switch'), name).not.toHaveAttribute(name)
  })

  it('hands the input to the ref when there is a message', () => {
    const ref = createRef<HTMLInputElement>()
    renderWithProviders(<Switch label="On" error="Required" ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('switch'))
  })

  it('has no axe violations with a helper text and with an error, in every state', async () => {
    const { container } = renderWithProviders(
      <>
        <Switch label="Helper" helperText="One summary a day" />
        <Switch label="Error" error="Turn notifications on to continue" />
        <Switch label="On" error="Required" defaultChecked />
        <Switch label="Disabled" error="Required" disabled />
        <Switch aria-label="Without a visible label" error="Required" />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
