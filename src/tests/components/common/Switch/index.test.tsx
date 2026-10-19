import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Switch } from '@components/common/Switch/index.tsx'

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
