import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { RadioGroup } from '@components/common/RadioGroup/index.tsx'

const plans = [
  { value: 'free', label: 'Grátis' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Equipe' }
]

describe('RadioGroup', () => {
  it('exposes a radio group named by its label with one radio per option', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} />)

    expect(screen.getByRole('radiogroup', { name: 'Plano' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('value'))).toEqual(['free', 'pro', 'team'])
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeInTheDocument()
  })

  it('renders the group as a fieldset with the label as its legend', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} />)

    expect(screen.getByRole('radiogroup').tagName).toBe('FIELDSET')
    expect(screen.getByText('Plano').tagName).toBe('LEGEND')
  })

  it('takes its name from aria-label when there is no visible label', () => {
    renderWithProviders(<RadioGroup aria-label="Plano de cobrança" options={plans} />)

    expect(screen.getByRole('radiogroup', { name: 'Plano de cobrança' })).toBeInTheDocument()
    expect(screen.queryByText('Plano de cobrança')).not.toBeInTheDocument()
  })

  it('starts with nothing selected', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} />)

    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
  })

  it('starts with the defaultValue selected', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} defaultValue="pro" />)

    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Grátis' })).not.toBeChecked()
  })

  it('selects one option at a time by clicking the radio or its label text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RadioGroup label="Plano" options={plans} />)

    await user.click(screen.getByRole('radio', { name: 'Grátis' }))
    expect(screen.getByRole('radio', { name: 'Grátis' })).toBeChecked()

    await user.click(screen.getByText('Equipe'))

    expect(screen.getByRole('radio', { name: 'Equipe' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Grátis' })).not.toBeChecked()
  })

  it('reports the value of each newly selected option', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<RadioGroup label="Plano" options={plans} onValueChange={onValueChange} />)

    await user.click(screen.getByText('Pro'))
    await user.click(screen.getByText('Pro'))
    await user.click(screen.getByText('Equipe'))

    expect(onValueChange.mock.calls).toEqual([['pro'], ['team']])
  })

  it('follows the value prop when controlled and reports each change', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const Controlled = () => {
      const [plan, setPlan] = useState('free')

      return (
        <RadioGroup
          label="Plano"
          options={plans}
          value={plan}
          onValueChange={(next) => {
            onValueChange(next)
            setPlan(next)
          }}
        />
      )
    }
    renderWithProviders(<Controlled />)

    expect(screen.getByRole('radio', { name: 'Grátis' })).toBeChecked()
    await user.click(screen.getByText('Equipe'))

    expect(screen.getByRole('radio', { name: 'Equipe' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Grátis' })).not.toBeChecked()
    expect(onValueChange.mock.calls).toEqual([['team']])
  })

  it('stays put when controlled and the owner refuses the change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RadioGroup label="Plano" options={plans} value="free" onValueChange={() => undefined} />)

    await user.click(screen.getByText('Pro'))

    expect(screen.getByRole('radio', { name: 'Grátis' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Pro' })).not.toBeChecked()
  })

  it('can be controlled with nothing selected by passing an empty value', async () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} value="" onValueChange={() => undefined} />)

    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
  })

  it('is one tab stop and moves the selection with the arrow keys', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <RadioGroup label="Plano" options={plans} defaultValue="free" />
        <button>Depois</button>
      </>
    )

    await user.tab()
    expect(screen.getByRole('radio', { name: 'Grátis' })).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Pro' })).toHaveFocus()
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked()

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('radio', { name: 'Grátis' })).toBeChecked()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Depois' })).toHaveFocus()
  })

  it('wraps the arrow keys around the ends and also answers to left and right', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RadioGroup label="Plano" options={plans} defaultValue="team" orientation="horizontal" />)

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Grátis' })).toBeChecked()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'Equipe' })).toBeChecked()
  })

  it('reports the keyboard selection through onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<RadioGroup label="Plano" options={plans} defaultValue="free" onValueChange={onValueChange} />)

    await user.tab()
    await user.keyboard('{ArrowDown}{ArrowDown}')

    expect(onValueChange.mock.calls).toEqual([['pro'], ['team']])
  })

  it('does not select anything when it is disabled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RadioGroup label="Plano" options={plans} disabled />)

    await user.click(screen.getByText('Pro'))

    expect(screen.getByRole('radiogroup')).toBeDisabled()
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled()
      expect(radio).not.toBeChecked()
    }
  })

  it('disables a single option without touching the others', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RadioGroup label="Plano" options={[plans[0], { ...plans[1], disabled: true }, plans[2]]} />)

    await user.click(screen.getByText('Pro'))

    expect(screen.getByRole('radio', { name: 'Pro' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Pro' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Grátis' })).toBeEnabled()
  })

  it('skips a disabled option with the arrow keys', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RadioGroup label="Plano" options={[plans[0], { ...plans[1], disabled: true }, plans[2]]} defaultValue="free" />)

    await user.tab()
    await user.keyboard('{ArrowDown}')

    expect(screen.getByRole('radio', { name: 'Equipe' })).toBeChecked()
  })

  it('marks the group and every radio as required', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} required />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true')
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeRequired()
  })

  it('is not required or invalid by default', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} />)

    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-required')
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-invalid')
  })

  it('describes the group with the helper text', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} helperText="Dá para trocar depois" />)

    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('Dá para trocar depois')
  })

  it('marks the group invalid and announces the error instead of the helper', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} helperText="Dá para trocar depois" error="Escolha um plano" />)
    const group = screen.getByRole('radiogroup')

    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription('Escolha um plano')
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha um plano')
    expect(screen.queryByText('Dá para trocar depois')).not.toBeInTheDocument()
  })

  it('merges a consumer aria-describedby with its own', () => {
    renderWithProviders(
      <>
        <p id="hint">Extra</p>
        <RadioGroup label="Plano" options={plans} helperText="Ajuda" aria-describedby="hint" />
      </>
    )

    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('Extra Ajuda')
  })

  it('shares one name among the radios and gives each group its own', () => {
    renderWithProviders(
      <>
        <RadioGroup label="Plano" options={plans} />
        <RadioGroup label="Ciclo" options={[{ value: 'month', label: 'Mensal' }]} />
      </>
    )
    const [first, second] = screen.getAllByRole('radiogroup').map((group) => [...group.querySelectorAll('input')].map((input) => input.name))

    expect(new Set(first).size).toBe(1)
    expect(first[0]).not.toBe('')
    expect(second[0]).not.toBe(first[0])
  })

  it('uses a provided name and submits the chosen value with the form', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <form aria-label="Assinatura">
        <RadioGroup label="Plano" name="plan" options={plans} />
      </form>
    )
    const data = () => new FormData(screen.getByRole('form') as HTMLFormElement).get('plan')

    expect(data()).toBeNull()
    await user.click(screen.getByText('Equipe'))

    expect(data()).toBe('team')
  })

  it('keeps two groups on the same page independent', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <RadioGroup label="Plano" options={plans} defaultValue="free" />
        <RadioGroup label="Ciclo" options={plans} defaultValue="free" />
      </>
    )
    const plan = within(screen.getByRole('radiogroup', { name: 'Plano' }))
    const cycle = within(screen.getByRole('radiogroup', { name: 'Ciclo' }))

    await user.click(cycle.getByRole('radio', { name: 'Pro' }))

    expect(plan.getByRole('radio', { name: 'Grátis' })).toBeChecked()
    expect(cycle.getByRole('radio', { name: 'Pro' })).toBeChecked()
    expect(cycle.getByRole('radio', { name: 'Grátis' })).not.toBeChecked()
  })

  it('forwards the ref to the fieldset', () => {
    const ref = createRef<HTMLFieldSetElement>()
    renderWithProviders(<RadioGroup label="Plano" options={plans} ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('radiogroup'))
  })

  it('uses a provided id', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} id="plan" error="Obrigatório" />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute('id', 'plan')
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'plan-error')
  })

  it('does not pass its own props to the page', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} defaultValue="pro" onValueChange={() => undefined} helperText="Dica" orientation="horizontal" animation={false} required />)
    const group = screen.getByRole('radiogroup')

    for (const name of ['options', 'label', 'defaultvalue', 'onvaluechange', 'helpertext', 'orientation', 'animation', 'value', 'name']) {
      expect(group, name).not.toHaveAttribute(name)
    }
  })

  it('is vertical by default and takes a horizontal orientation', () => {
    const { unmount } = renderWithProviders(<RadioGroup label="Plano" options={plans} />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-orientation', 'vertical')

    unmount()
    renderWithProviders(<RadioGroup label="Plano" options={plans} orientation="horizontal" />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <RadioGroup label="Padrão" options={plans} />
        <RadioGroup label="Escolhido" options={plans} defaultValue="pro" helperText="Dá para trocar" />
        <RadioGroup label="Com erro" options={plans} error="Escolha um" required />
        <RadioGroup label="Bloqueado" options={plans} disabled />
        <RadioGroup label="Uma opção bloqueada" options={[plans[0], { ...plans[1], disabled: true }]} orientation="horizontal" />
        <RadioGroup aria-label="Sem texto visível" options={plans} />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('RadioGroup contract', () => {
  it('marks the group and every part with a data-slot', () => {
    const { container } = renderWithProviders(<RadioGroup label="Plano" options={plans} helperText="Ajuda" />)

    for (const part of ['radio-group', 'radio-group-legend', 'radio-group-options', 'radio-group-option', 'radio-group-input', 'radio-group-control', 'radio-group-label', 'radio-group-helper']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('marks the error part when there is an error', () => {
    const { container } = renderWithProviders(<RadioGroup label="Plano" options={plans} error="Obrigatório" />)

    expect(container.querySelector('[data-slot="radio-group-error"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="radio-group-helper"]')).not.toBeInTheDocument()
  })

  it('omits the legend part when there is no label', () => {
    const { container } = renderWithProviders(<RadioGroup aria-label="Plano" options={plans} />)

    expect(container.querySelector('[data-slot="radio-group-legend"]')).not.toBeInTheDocument()
  })

  it('keeps className and style on the root with the caller last', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} className="mine" style={{ margin: '3px' }} />)
    const root = screen.getByRole('radiogroup')

    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.style.margin).toBe('3px')
    expect(root).toHaveAttribute('data-slot', 'radio-group')
  })

  it('passes other attributes and handlers to the root', async () => {
    const user = userEvent.setup()
    const onFocus = vi.fn()
    renderWithProviders(<RadioGroup label="Plano" options={plans} data-testid="group" onFocus={onFocus} />)

    await user.tab()

    expect(screen.getByTestId('group')).toBe(screen.getByRole('radiogroup'))
    expect(onFocus).toHaveBeenCalled()
  })

  it('does not flag the group as invalid or disabled by default', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} />)

    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('data-invalid')
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('data-disabled')
  })

  it('flags the group as invalid and as disabled', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} error="Obrigatório" disabled />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-invalid')
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled')
  })

  it('flags each disabled option', () => {
    const { container } = renderWithProviders(<RadioGroup label="Plano" options={[plans[0], { ...plans[1], disabled: true }]} />)
    const [free, pro] = [...container.querySelectorAll('[data-slot="radio-group-option"]')]

    expect(free).not.toHaveAttribute('data-disabled')
    expect(pro).toHaveAttribute('data-disabled')
  })

  it('sets the motion variables on the root and drops them for animation={false}', () => {
    const { unmount } = renderWithProviders(<RadioGroup label="Plano" options={plans} />)

    expect(screen.getByRole('radiogroup').style.getPropertyValue('--enchase-radio-group-duration')).toBe('150ms')
    expect(screen.getByRole('radiogroup').style.getPropertyValue('--enchase-radio-group-scale')).toBe('0.6')
    unmount()

    renderWithProviders(<RadioGroup label="Plano" options={plans} animation={false} />)

    expect(screen.getByRole('radiogroup').style.getPropertyValue('--enchase-radio-group-duration')).toBe('0ms')
  })

  it('takes a custom duration and scale through the animation tuning', () => {
    renderWithProviders(<RadioGroup label="Plano" options={plans} animation={{ tuning: { duration: 0.4, scale: 0.3 } }} />)

    expect(screen.getByRole('radiogroup').style.getPropertyValue('--enchase-radio-group-duration')).toBe('400ms')
    expect(screen.getByRole('radiogroup').style.getPropertyValue('--enchase-radio-group-scale')).toBe('0.3')
  })
})
