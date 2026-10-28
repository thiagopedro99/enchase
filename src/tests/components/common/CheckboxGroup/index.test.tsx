import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { CheckboxGroup } from '@components/common/CheckboxGroup/index.tsx'

const topics = [
  { value: 'news', label: 'Novidades' },
  { value: 'offers', label: 'Ofertas' },
  { value: 'events', label: 'Eventos' }
]

const checked = () => screen.getAllByRole('checkbox').flatMap((box) => ((box as HTMLInputElement).checked ? [box.getAttribute('value')] : []))

describe('CheckboxGroup', () => {
  it('exposes a group named by its label with one checkbox per option', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} />)

    expect(screen.getByRole('group', { name: 'Assuntos' })).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox').map((box) => box.getAttribute('value'))).toEqual(['news', 'offers', 'events'])
    expect(screen.getByRole('checkbox', { name: 'Ofertas' })).toBeInTheDocument()
  })

  it('renders the group as a fieldset with the label as its legend', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} />)

    expect(screen.getByRole('group').tagName).toBe('FIELDSET')
    expect(screen.getByText('Assuntos').tagName).toBe('LEGEND')
  })

  it('takes its name from aria-label when there is no visible label', () => {
    renderWithProviders(<CheckboxGroup aria-label="Assuntos de interesse" options={topics} />)

    expect(screen.getByRole('group', { name: 'Assuntos de interesse' })).toBeInTheDocument()
    expect(screen.queryByText('Assuntos de interesse')).not.toBeInTheDocument()
  })

  it('starts with nothing checked', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} />)

    expect(checked()).toEqual([])
  })

  it('starts with the options of the defaultValue checked', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} defaultValue={['news', 'events']} />)

    expect(checked()).toEqual(['news', 'events'])
  })

  it('checks and unchecks each option on its own by clicking the box or its label text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} />)

    await user.click(screen.getByRole('checkbox', { name: 'Novidades' }))
    await user.click(screen.getByText('Eventos'))

    expect(checked()).toEqual(['news', 'events'])

    await user.click(screen.getByText('Novidades'))

    expect(checked()).toEqual(['events'])
  })

  it('reports the whole value after each change, in the order of the options', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} onValueChange={onValueChange} />)

    await user.click(screen.getByText('Eventos'))
    await user.click(screen.getByText('Novidades'))
    await user.click(screen.getByText('Eventos'))

    expect(onValueChange.mock.calls).toEqual([[['events']], [['news', 'events']], [['news']]])
  })

  it('follows the value prop when controlled and reports each change', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const Controlled = () => {
      const [value, setValue] = useState(['offers'])

      return (
        <CheckboxGroup
          label="Assuntos"
          options={topics}
          value={value}
          onValueChange={(next) => {
            onValueChange(next)
            setValue(next)
          }}
        />
      )
    }
    renderWithProviders(<Controlled />)

    expect(checked()).toEqual(['offers'])
    await user.click(screen.getByText('Novidades'))

    expect(checked()).toEqual(['news', 'offers'])
    expect(onValueChange.mock.calls).toEqual([[['news', 'offers']]])
  })

  it('stays put when controlled and the owner refuses the change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} value={['news']} onValueChange={() => undefined} />)

    await user.click(screen.getByText('Ofertas'))

    expect(checked()).toEqual(['news'])
  })

  it('can be controlled with nothing checked by passing an empty array', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} value={[]} onValueChange={() => undefined} />)

    expect(checked()).toEqual([])
  })

  it('is one tab stop per checkbox and toggles the focused one with Space, without arrow-key movement', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <CheckboxGroup label="Assuntos" options={topics} />
        <button>Depois</button>
      </>
    )

    await user.tab()
    expect(screen.getByRole('checkbox', { name: 'Novidades' })).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('checkbox', { name: 'Novidades' })).toHaveFocus()

    await user.keyboard(' ')
    await user.tab()
    await user.keyboard(' ')

    expect(screen.getByRole('checkbox', { name: 'Ofertas' })).toHaveFocus()
    expect(checked()).toEqual(['news', 'offers'])

    await user.tab()
    await user.tab()

    expect(screen.getByRole('button', { name: 'Depois' })).toHaveFocus()
  })

  it('does not change anything when it is disabled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} defaultValue={['news']} disabled />)

    await user.click(screen.getByText('Ofertas'))

    expect(screen.getByRole('group')).toBeDisabled()
    for (const box of screen.getAllByRole('checkbox')) expect(box).toBeDisabled()
    expect(checked()).toEqual(['news'])
  })

  it('disables a single option without touching the others', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CheckboxGroup label="Assuntos" options={[topics[0], { ...topics[1], disabled: true }, topics[2]]} />)

    await user.click(screen.getByText('Ofertas'))

    expect(screen.getByRole('checkbox', { name: 'Ofertas' })).toBeDisabled()
    expect(checked()).toEqual([])
    expect(screen.getByRole('checkbox', { name: 'Novidades' })).toBeEnabled()
  })

  it('keeps a checked disabled option in the value that it reports', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<CheckboxGroup label="Assuntos" options={[topics[0], { ...topics[1], disabled: true }, topics[2]]} defaultValue={['offers']} onValueChange={onValueChange} />)

    await user.click(screen.getByText('Eventos'))

    expect(onValueChange).toHaveBeenCalledWith(['offers', 'events'])
  })

  it('is not invalid by default and marks every checkbox invalid when there is an error', () => {
    const { unmount } = renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} />)

    for (const box of screen.getAllByRole('checkbox')) expect(box).not.toHaveAttribute('aria-invalid')
    unmount()

    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} error="Escolha ao menos um" />)

    for (const box of screen.getAllByRole('checkbox')) expect(box).toHaveAttribute('aria-invalid', 'true')
  })

  it('describes the group with the helper text', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} helperText="Dá para mudar depois" />)

    expect(screen.getByRole('group')).toHaveAccessibleDescription('Dá para mudar depois')
  })

  it('announces the error instead of the helper', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} helperText="Dá para mudar depois" error="Escolha ao menos um" />)

    expect(screen.getByRole('group')).toHaveAccessibleDescription('Escolha ao menos um')
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha ao menos um')
    expect(screen.queryByText('Dá para mudar depois')).not.toBeInTheDocument()
  })

  it('merges a consumer aria-describedby with its own', () => {
    renderWithProviders(
      <>
        <p id="hint">Extra</p>
        <CheckboxGroup label="Assuntos" options={topics} helperText="Ajuda" aria-describedby="hint" />
      </>
    )

    expect(screen.getByRole('group')).toHaveAccessibleDescription('Extra Ajuda')
  })

  it('leaves the checkboxes without a name unless one is given, so a form does not receive them', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} />)

    for (const box of screen.getAllByRole('checkbox')) expect(box).not.toHaveAttribute('name')
  })

  it('uses a provided name and submits every checked value with the form', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <form aria-label="Inscrição">
        <CheckboxGroup label="Assuntos" name="topics" options={topics} />
      </form>
    )
    const data = () => new FormData(screen.getByRole('form') as HTMLFormElement).getAll('topics')

    expect(data()).toEqual([])
    await user.click(screen.getByText('Eventos'))
    await user.click(screen.getByText('Novidades'))

    expect(data()).toEqual(['news', 'events'])
  })

  it('keeps two groups on the same page independent', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <CheckboxGroup label="Assuntos" options={topics} />
        <CheckboxGroup label="Canais" options={topics} />
      </>
    )
    const subjects = within(screen.getByRole('group', { name: 'Assuntos' }))
    const channels = within(screen.getByRole('group', { name: 'Canais' }))

    await user.click(channels.getByRole('checkbox', { name: 'Ofertas' }))

    expect(subjects.getByRole('checkbox', { name: 'Ofertas' })).not.toBeChecked()
    expect(channels.getByRole('checkbox', { name: 'Ofertas' })).toBeChecked()
  })

  it('forwards the ref to the fieldset', () => {
    const ref = createRef<HTMLFieldSetElement>()
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('group'))
  })

  it('uses a provided id', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} id="topics" error="Obrigatório" />)

    expect(screen.getByRole('group')).toHaveAttribute('id', 'topics')
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'topics-error')
  })

  it('does not pass its own props to the page', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} defaultValue={['news']} onValueChange={() => undefined} helperText="Dica" orientation="horizontal" animation={false} />)
    const group = screen.getByRole('group')

    for (const name of ['options', 'label', 'defaultvalue', 'onvaluechange', 'helpertext', 'orientation', 'animation', 'value', 'name']) {
      expect(group, name).not.toHaveAttribute(name)
    }
  })

  it('is vertical by default and takes a horizontal orientation', () => {
    const { unmount } = renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} />)

    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical')

    unmount()
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} orientation="horizontal" />)

    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <CheckboxGroup label="Padrão" options={topics} />
        <CheckboxGroup label="Marcado" options={topics} defaultValue={['offers']} helperText="Dá para mudar" />
        <CheckboxGroup label="Com erro" options={topics} error="Escolha ao menos um" />
        <CheckboxGroup label="Bloqueado" options={topics} defaultValue={['news']} disabled />
        <CheckboxGroup label="Uma opção bloqueada" options={[topics[0], { ...topics[1], disabled: true }]} orientation="horizontal" />
        <CheckboxGroup aria-label="Sem texto visível" options={topics} />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('CheckboxGroup contract', () => {
  it('marks the group and every part with a data-slot', () => {
    const { container } = renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} helperText="Ajuda" />)

    for (const part of ['checkbox-group', 'checkbox-group-legend', 'checkbox-group-options', 'checkbox-group-helper', 'checkbox', 'checkbox-input', 'checkbox-box', 'checkbox-label']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('marks the error part when there is an error', () => {
    const { container } = renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} error="Obrigatório" />)

    expect(container.querySelector('[data-slot="checkbox-group-error"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="checkbox-group-helper"]')).not.toBeInTheDocument()
  })

  it('omits the legend part when there is no label', () => {
    const { container } = renderWithProviders(<CheckboxGroup aria-label="Assuntos" options={topics} />)

    expect(container.querySelector('[data-slot="checkbox-group-legend"]')).not.toBeInTheDocument()
  })

  it('keeps className and style on the root with the caller last', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} className="mine" style={{ margin: '3px' }} />)
    const root = screen.getByRole('group')

    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.style.margin).toBe('3px')
    expect(root).toHaveAttribute('data-slot', 'checkbox-group')
  })

  it('passes other attributes and handlers to the root', async () => {
    const user = userEvent.setup()
    const onFocus = vi.fn()
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} data-testid="group" onFocus={onFocus} />)

    await user.tab()

    expect(screen.getByTestId('group')).toBe(screen.getByRole('group'))
    expect(onFocus).toHaveBeenCalled()
  })

  it('does not flag the group as invalid or disabled by default', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} />)

    expect(screen.getByRole('group')).not.toHaveAttribute('data-invalid')
    expect(screen.getByRole('group')).not.toHaveAttribute('data-disabled')
  })

  it('flags the group as invalid and as disabled', () => {
    renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} error="Obrigatório" disabled />)

    expect(screen.getByRole('group')).toHaveAttribute('data-invalid')
    expect(screen.getByRole('group')).toHaveAttribute('data-disabled')
  })

  it('flags each disabled option', () => {
    const { container } = renderWithProviders(<CheckboxGroup label="Assuntos" options={[topics[0], { ...topics[1], disabled: true }]} />)
    const [news, offers] = [...container.querySelectorAll('[data-slot="checkbox"]')]

    expect(news).not.toHaveAttribute('data-disabled')
    expect(offers).toHaveAttribute('data-disabled')
  })

  it('passes the animation to every checkbox', () => {
    const { container, unmount } = renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} />)
    const durations = () => [...container.querySelectorAll<HTMLElement>('[data-slot="checkbox"]')].map((box) => box.style.getPropertyValue('--enchase-checkbox-duration'))

    expect(durations()).toEqual(['150ms', '150ms', '150ms'])
    unmount()

    const off = renderWithProviders(<CheckboxGroup label="Assuntos" options={topics} animation={false} />)

    expect([...off.container.querySelectorAll<HTMLElement>('[data-slot="checkbox"]')].map((box) => box.style.getPropertyValue('--enchase-checkbox-duration'))).toEqual(['0ms', '0ms', '0ms'])
  })
})
