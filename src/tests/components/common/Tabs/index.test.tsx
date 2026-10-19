import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Tabs } from '@components/common/Tabs/index.tsx'

const items = [
  { value: 'profile', label: 'Perfil', content: <p>Dados do perfil</p> },
  { value: 'billing', label: 'Cobrança', content: <p>Dados de cobrança</p> },
  { value: 'team', label: 'Equipe', content: <p>Dados da equipe</p> }
]

const withDisabledMiddle = [items[0], { ...items[1], disabled: true }, items[2]]

const selectedTab = () => screen.getByRole('tab', { selected: true })

describe('Tabs', () => {
  it('exposes a named tab list with one tab per item and the first one selected', () => {
    renderWithProviders(<Tabs ariaLabel="Conta" items={items} />)

    expect(screen.getByRole('tablist', { name: 'Conta' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Perfil', 'Cobrança', 'Equipe'])
    expect(selectedTab()).toHaveTextContent('Perfil')
  })

  it('links each tab to its panel in both directions', () => {
    renderWithProviders(<Tabs items={items} />)

    for (const tab of screen.getAllByRole('tab')) {
      const panel = document.getElementById(tab.getAttribute('aria-controls') as string) as HTMLElement

      expect(panel).toHaveAttribute('role', 'tabpanel')
      expect(panel).toHaveAttribute('aria-labelledby', tab.id)
    }
  })

  it('shows only the panel of the selected tab and keeps the others in the document', () => {
    renderWithProviders(<Tabs items={items} defaultValue="billing" />)

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Dados de cobrança')
    expect(screen.getByRole('tabpanel', { name: 'Cobrança' })).toBeVisible()
    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3)
    expect(screen.getByText('Dados do perfil')).not.toBeVisible()
    expect(screen.getByText('Dados da equipe')).not.toBeVisible()
  })

  it('selects a tab by clicking it and reports its value once', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Tabs items={items} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('tab', { name: 'Equipe' }))
    await user.click(screen.getByRole('tab', { name: 'Equipe' }))

    expect(selectedTab()).toHaveTextContent('Equipe')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Dados da equipe')
    expect(onValueChange.mock.calls).toEqual([['team']])
  })

  it('follows the value prop when controlled and reports each change', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const Controlled = () => {
      const [tab, setTab] = useState('profile')

      return (
        <Tabs
          items={items}
          value={tab}
          onValueChange={(next) => {
            onValueChange(next)
            setTab(next)
          }}
        />
      )
    }
    renderWithProviders(<Controlled />)

    await user.click(screen.getByRole('tab', { name: 'Cobrança' }))

    expect(selectedTab()).toHaveTextContent('Cobrança')
    expect(onValueChange.mock.calls).toEqual([['billing']])
  })

  it('stays put when controlled and the owner refuses the change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tabs items={items} value="profile" onValueChange={() => undefined} />)

    await user.click(screen.getByRole('tab', { name: 'Equipe' }))

    expect(selectedTab()).toHaveTextContent('Perfil')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Dados do perfil')
  })

  it('selects nothing when the controlled value matches no tab but keeps the list reachable by keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tabs items={items} value="none" onValueChange={() => undefined} />)

    expect(screen.queryByRole('tab', { selected: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()

    await user.tab()

    expect(screen.getByRole('tab', { name: 'Perfil' })).toHaveFocus()
  })

  it('is a single tab stop on the selected tab and the next stop is its panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tabs items={items} defaultValue="billing" />)

    expect(screen.getByRole('tab', { name: 'Cobrança' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Perfil' })).toHaveAttribute('tabindex', '-1')

    await user.tab()
    expect(screen.getByRole('tab', { name: 'Cobrança' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('tabpanel')).toHaveFocus()
  })

  it('keeps the list itself out of the tab order so a scrollable list is not an extra stop', () => {
    renderWithProviders(<Tabs items={items} />)

    expect(screen.getByRole('tablist')).toHaveAttribute('tabindex', '-1')
  })

  it('selects and focuses the next and previous tab with the arrow keys, wrapping around', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tabs items={items} />)

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Cobrança' })).toHaveFocus()
    expect(selectedTab()).toHaveTextContent('Cobrança')

    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(selectedTab()).toHaveTextContent('Perfil')

    await user.keyboard('{ArrowLeft}')
    expect(selectedTab()).toHaveTextContent('Equipe')
    expect(screen.getByRole('tab', { name: 'Equipe' })).toHaveFocus()
  })

  it('jumps to the first and last tab with Home and End', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tabs items={items} defaultValue="billing" />)

    await user.tab()
    await user.keyboard('{End}')
    expect(selectedTab()).toHaveTextContent('Equipe')

    await user.keyboard('{Home}')
    expect(selectedTab()).toHaveTextContent('Perfil')
  })

  it('skips a disabled tab with the keyboard and ignores a click on it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tabs items={withDisabledMiddle} />)

    expect(screen.getByRole('tab', { name: 'Cobrança' })).toBeDisabled()

    await user.click(screen.getByRole('tab', { name: 'Cobrança' }))
    expect(selectedTab()).toHaveTextContent('Perfil')

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(selectedTab()).toHaveTextContent('Equipe')

    await user.keyboard('{ArrowRight}')
    expect(selectedTab()).toHaveTextContent('Perfil')
  })

  it('keeps the list reachable when the default tab is disabled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tabs items={withDisabledMiddle} defaultValue="billing" />)

    await user.tab()

    expect(screen.getByRole('tab', { name: 'Perfil' })).toHaveFocus()
  })

  it('ignores the arrow keys with a modifier and keys it does not handle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tabs items={items} />)

    await user.tab()
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
    await user.keyboard('{ArrowDown}a')

    expect(selectedTab()).toHaveTextContent('Perfil')
    expect(screen.getByRole('tab', { name: 'Perfil' })).toHaveFocus()
  })

  it('only moves the focus with the arrow keys under manual activation and selects with Enter or Space', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Tabs items={items} activation="manual" onValueChange={onValueChange} />)

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: 'Cobrança' })).toHaveFocus()
    expect(selectedTab()).toHaveTextContent('Perfil')
    expect(onValueChange).not.toHaveBeenCalled()

    await user.keyboard('{Enter}')
    expect(selectedTab()).toHaveTextContent('Cobrança')

    await user.keyboard('{ArrowRight}')
    await user.keyboard(' ')

    expect(selectedTab()).toHaveTextContent('Equipe')
    expect(onValueChange.mock.calls).toEqual([['billing'], ['team']])
  })

  it('keeps the state of a hidden panel while another tab is shown', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Tabs
        items={[
          { value: 'a', label: 'Formulário', content: <input aria-label="Nome" /> },
          { value: 'b', label: 'Outra', content: <p>Outra</p> }
        ]}
      />
    )

    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Ana')
    await user.click(screen.getByRole('tab', { name: 'Outra' }))
    await user.click(screen.getByRole('tab', { name: 'Formulário' }))

    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue('Ana')
  })

  it('renders an empty list without selecting anything when there are no items', () => {
    renderWithProviders(<Tabs items={[]} ariaLabel="Vazio" />)

    expect(within(screen.getByRole('tablist', { name: 'Vazio' })).queryAllByRole('tab')).toEqual([])
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  })

  it('gives each instance its own ids', () => {
    renderWithProviders(
      <>
        <Tabs items={items} ariaLabel="Primeiro" />
        <Tabs items={items} ariaLabel="Segundo" />
      </>
    )
    const ids = screen.getAllByRole('tab').map((tab) => tab.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('forwards the ref to the root', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = renderWithProviders(<Tabs items={items} ref={ref} />)

    expect(ref.current).toBe(container.querySelector('[data-slot="tabs"]'))
  })

  it('does not pass its own props to the page', () => {
    const { container } = renderWithProviders(<Tabs items={items} defaultValue="team" onValueChange={() => undefined} activation="manual" ariaLabel="Conta" animation={false} />)
    const root = container.querySelector('[data-slot="tabs"]') as HTMLElement

    for (const name of ['items', 'value', 'defaultvalue', 'onvaluechange', 'activation', 'arialabel', 'animation']) {
      expect(root, name).not.toHaveAttribute(name)
    }
  })

  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <Tabs items={items} ariaLabel="Padrão" />
        <Tabs items={items} ariaLabel="Escolhida" defaultValue="team" />
        <Tabs items={withDisabledMiddle} ariaLabel="Com desativada" activation="manual" />
        <Tabs items={items} ariaLabel="Sem seleção" value="none" onValueChange={() => undefined} />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Tabs indicator', () => {
  it('is decorative and becomes visible once it is placed, without animating the first time', () => {
    const { container } = renderWithProviders(<Tabs items={items} />)
    const indicator = container.querySelector('[data-slot="tabs-indicator"]') as HTMLElement

    expect(indicator).toHaveAttribute('aria-hidden', 'true')
    expect(indicator).toHaveAttribute('data-visible')
    expect(indicator).not.toHaveAttribute('data-animate')
    expect(container.querySelector('[data-slot="tabs-list"]')).toHaveAttribute('data-indicator')
  })

  it('animates when the selected tab changes', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Tabs items={items} />)

    await user.click(screen.getByRole('tab', { name: 'Equipe' }))

    expect(container.querySelector('[data-slot="tabs-indicator"]')).toHaveAttribute('data-animate')
  })

  it('is hidden when no tab is selected', () => {
    const { container } = renderWithProviders(<Tabs items={items} value="none" onValueChange={() => undefined} />)

    expect(container.querySelector('[data-slot="tabs-indicator"]')).not.toHaveAttribute('data-visible')
    expect(container.querySelector('[data-slot="tabs-list"]')).not.toHaveAttribute('data-indicator')
  })

  it('sizes itself from the selected tab', () => {
    const widths: Record<string, number> = { Perfil: 80, Cobrança: 120, Equipe: 100 }
    const offsets: Record<string, number> = { Perfil: 0, Cobrança: 80, Equipe: 200 }
    const read = (property: 'offsetWidth' | 'offsetLeft', table: Record<string, number>) =>
      vi.spyOn(HTMLElement.prototype, property, 'get').mockImplementation(function (this: HTMLElement) {
        return table[this.textContent ?? ''] ?? 0
      })
    const spies = [read('offsetWidth', widths), read('offsetLeft', offsets)]
    const { container } = renderWithProviders(<Tabs items={items} defaultValue="billing" />)
    const indicator = container.querySelector('[data-slot="tabs-indicator"]') as HTMLElement

    expect(indicator.style.translate).toBe('80px 0')
    expect(indicator.style.scale).toBe('120 1')

    for (const spy of spies) spy.mockRestore()
  })
})

describe('Tabs contract', () => {
  it('marks the root and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Tabs items={items} />)

    for (const part of ['tabs', 'tabs-list', 'tabs-tab', 'tabs-indicator', 'tabs-panel']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('keeps className and style on the root with the caller last', () => {
    const { container } = renderWithProviders(<Tabs items={items} className="mine" style={{ margin: '3px' }} />)
    const root = container.querySelector('[data-slot="tabs"]') as HTMLElement

    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.style.margin).toBe('3px')
  })

  it('passes other attributes and handlers to the root', async () => {
    const user = userEvent.setup()
    const onFocus = vi.fn()
    renderWithProviders(<Tabs items={items} data-testid="tabs" id="account" onFocus={onFocus} />)

    await user.tab()

    expect(screen.getByTestId('tabs')).toHaveAttribute('id', 'account')
    expect(onFocus).toHaveBeenCalled()
  })

  it('keeps the content of every panel inside its tabpanel', () => {
    renderWithProviders(<Tabs items={items} defaultValue="team" />)

    expect(within(screen.getByRole('tabpanel')).getByText('Dados da equipe')).toBeInTheDocument()
  })

  it('sets the motion variables on the root and zeroes them for animation={false}', () => {
    const { container, unmount } = renderWithProviders(<Tabs items={items} />)
    const root = () => container.querySelector('[data-slot="tabs"]') as HTMLElement

    expect(root().style.getPropertyValue('--enchase-tabs-duration')).toBe('200ms')
    unmount()

    const off = renderWithProviders(<Tabs items={items} animation={false} />)

    expect((off.container.querySelector('[data-slot="tabs"]') as HTMLElement).style.getPropertyValue('--enchase-tabs-duration')).toBe('0ms')
  })

  it('takes a custom duration through the animation tuning', () => {
    const { container } = renderWithProviders(<Tabs items={items} animation={{ tuning: { duration: 0.5 } }} />)

    expect((container.querySelector('[data-slot="tabs"]') as HTMLElement).style.getPropertyValue('--enchase-tabs-duration')).toBe('500ms')
  })
})
