import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Accordion } from '@components/common/Accordion/index.tsx'

const items = [
  { value: 'shipping', title: 'Envio', content: <p>Enviamos em até dois dias.</p> },
  { value: 'returns', title: 'Devoluções', content: <p>Aceitamos em até trinta dias.</p> },
  { value: 'payment', title: 'Pagamento', content: <p>Cartão, Pix e boleto.</p> }
]

const withDisabledMiddle = [items[0], { ...items[1], disabled: true }, items[2]]

const trigger = (name: string) => screen.getByRole('button', { name })

const accordion = (container: HTMLElement) => within(container.querySelector('[data-slot="accordion"]') as HTMLElement)

const openTitles = () => screen.getAllByRole('button').filter((button) => button.getAttribute('aria-expanded') === 'true').map((button) => button.textContent)

describe('Accordion', () => {
  it('renders a heading with a button per item, all closed by default', () => {
    const { container } = renderWithProviders(<Accordion items={items} />)

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Envio', 'Devoluções', 'Pagamento'])
    expect(openTitles()).toEqual([])
    expect(accordion(container).queryAllByRole('region')).toEqual([])
    expect(screen.getByText('Enviamos em até dois dias.')).not.toBeVisible()
  })

  it('puts each button inside a heading, level 3 by default and any level from 2 to 6', () => {
    const { unmount } = renderWithProviders(<Accordion items={items} />)

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
    expect(within(screen.getByRole('heading', { name: 'Envio' })).getByRole('button')).toBe(trigger('Envio'))

    unmount()
    renderWithProviders(<Accordion items={items} headingLevel={2} />)

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
  })

  it('links each button to its panel in both directions', () => {
    renderWithProviders(<Accordion items={items} defaultValue={['returns']} />)
    const button = trigger('Devoluções')
    const panel = document.getElementById(button.getAttribute('aria-controls') as string) as HTMLElement

    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveAttribute('aria-labelledby', button.id)
    expect(screen.getByRole('region', { name: 'Devoluções' })).toBe(panel)
    expect(panel).toBeVisible()
  })

  it('opens and closes an item by clicking its button and reports the open items', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Accordion items={items} onValueChange={onValueChange} />)

    await user.click(trigger('Envio'))
    expect(trigger('Envio')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Enviamos em até dois dias.')).toBeVisible()

    await user.click(trigger('Envio'))
    expect(trigger('Envio')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Enviamos em até dois dias.')).not.toBeVisible()
    expect(onValueChange.mock.calls).toEqual([[['shipping']], [[]]])
  })

  it('keeps a single item open by default and closes the previous one', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Accordion items={items} />)

    await user.click(trigger('Envio'))
    await user.click(trigger('Pagamento'))

    expect(openTitles()).toEqual(['Pagamento'])
  })

  it('shows only the first of several default values when single', () => {
    renderWithProviders(<Accordion items={items} defaultValue={['returns', 'payment']} />)

    expect(openTitles()).toEqual(['Devoluções'])
  })

  it('lets several items stay open when multiple', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Accordion items={items} multiple onValueChange={onValueChange} />)

    await user.click(trigger('Envio'))
    await user.click(trigger('Pagamento'))
    expect(openTitles()).toEqual(['Envio', 'Pagamento'])

    await user.click(trigger('Envio'))

    expect(openTitles()).toEqual(['Pagamento'])
    expect(onValueChange.mock.calls).toEqual([[['shipping']], [['shipping', 'payment']], [['payment']]])
  })

  it('starts with the defaultValue items open', () => {
    const { container } = renderWithProviders(<Accordion items={items} multiple defaultValue={['shipping', 'payment']} />)

    expect(openTitles()).toEqual(['Envio', 'Pagamento'])
    expect(accordion(container).getAllByRole('region')).toHaveLength(2)
  })

  it('follows the value prop when controlled and reports each change', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const Controlled = () => {
      const [open, setOpen] = useState<string[]>(['returns'])

      return (
        <Accordion
          items={items}
          value={open}
          onValueChange={(next) => {
            onValueChange(next)
            setOpen(next)
          }}
        />
      )
    }
    renderWithProviders(<Controlled />)

    expect(openTitles()).toEqual(['Devoluções'])
    await user.click(trigger('Pagamento'))

    expect(openTitles()).toEqual(['Pagamento'])
    expect(onValueChange.mock.calls).toEqual([[['payment']]])
  })

  it('stays put when controlled and the owner refuses the change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Accordion items={items} value={[]} onValueChange={() => undefined} />)

    await user.click(trigger('Envio'))

    expect(openTitles()).toEqual([])
  })

  it('ignores a disabled item and skips it with the keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Accordion items={withDisabledMiddle} />)

    expect(trigger('Devoluções')).toBeDisabled()

    await user.click(trigger('Devoluções'))
    expect(openTitles()).toEqual([])

    await user.tab()
    await user.keyboard('{ArrowDown}')

    expect(trigger('Pagamento')).toHaveFocus()
  })

  it('moves through every enabled button with Tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Accordion items={items} />)

    await user.tab()
    expect(trigger('Envio')).toHaveFocus()
    await user.tab()
    expect(trigger('Devoluções')).toHaveFocus()
    await user.tab()
    expect(trigger('Pagamento')).toHaveFocus()
  })

  it('toggles the focused item with Enter and Space', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Accordion items={items} multiple />)

    await user.tab()
    await user.keyboard('{Enter}')
    expect(openTitles()).toEqual(['Envio'])

    await user.keyboard(' ')
    expect(openTitles()).toEqual([])
  })

  it('moves the focus with the arrow keys, Home and End, wrapping around', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Accordion items={items} />)

    await user.tab()
    await user.keyboard('{ArrowDown}')
    expect(trigger('Devoluções')).toHaveFocus()

    await user.keyboard('{End}')
    expect(trigger('Pagamento')).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(trigger('Envio')).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(trigger('Pagamento')).toHaveFocus()

    await user.keyboard('{Home}')
    expect(trigger('Envio')).toHaveFocus()
    expect(openTitles()).toEqual([])
  })

  it('ignores the arrow keys with a modifier and keys it does not handle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Accordion items={items} />)

    await user.tab()
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}')
    await user.keyboard('{ArrowRight}a')

    expect(trigger('Envio')).toHaveFocus()
  })

  it('keeps the state of a closed panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Accordion
        multiple
        items={[
          { value: 'a', title: 'Formulário', content: <input aria-label="Nome" /> },
          { value: 'b', title: 'Outra', content: <p>Outra</p> }
        ]}
        defaultValue={['a']}
      />
    )

    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Ana')
    await user.click(trigger('Formulário'))
    await user.click(trigger('Formulário'))

    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue('Ana')
  })

  it('renders only the root when there are no items', () => {
    const { container } = renderWithProviders(<Accordion items={[]} />)

    expect(container.querySelector('[data-slot="accordion"]')).toBeEmptyDOMElement()
  })

  it('gives each instance its own ids', () => {
    renderWithProviders(
      <>
        <Accordion items={items} />
        <Accordion items={items} />
      </>
    )
    const ids = screen.getAllByRole('button').map((button) => button.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('forwards the ref to the root', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = renderWithProviders(<Accordion items={items} ref={ref} />)

    expect(ref.current).toBe(container.querySelector('[data-slot="accordion"]'))
  })

  it('does not pass its own props to the page', () => {
    const { container } = renderWithProviders(<Accordion items={items} multiple defaultValue={['shipping']} onValueChange={() => undefined} headingLevel={4} animation={false} />)
    const root = container.querySelector('[data-slot="accordion"]') as HTMLElement

    for (const name of ['items', 'multiple', 'value', 'defaultvalue', 'onvaluechange', 'headinglevel', 'animation']) {
      expect(root, name).not.toHaveAttribute(name)
    }
  })

  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <Accordion items={items} />
        <Accordion items={items} defaultValue={['returns']} headingLevel={3} />
        <Accordion items={items} multiple defaultValue={['shipping', 'payment']} />
        <Accordion items={withDisabledMiddle} />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Accordion contract', () => {
  it('marks the root and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Accordion items={items} />)

    for (const part of ['accordion', 'accordion-item', 'accordion-heading', 'accordion-trigger', 'accordion-title', 'accordion-icon', 'accordion-panel']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('hides the decorative icon from assistive technology', () => {
    const { container } = renderWithProviders(<Accordion items={items} />)

    expect(container.querySelector('[data-slot="accordion-icon"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('flags the open items', () => {
    const { container } = renderWithProviders(<Accordion items={items} defaultValue={['returns']} />)
    const [shipping, returns] = [...container.querySelectorAll('[data-slot="accordion-item"]')]

    expect(shipping).not.toHaveAttribute('data-open')
    expect(returns).toHaveAttribute('data-open')
  })

  it('keeps className and style on the root with the caller last', () => {
    const { container } = renderWithProviders(<Accordion items={items} className="mine" style={{ margin: '3px' }} />)
    const root = container.querySelector('[data-slot="accordion"]') as HTMLElement

    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.style.margin).toBe('3px')
  })

  it('passes other attributes and handlers to the root', async () => {
    const user = userEvent.setup()
    const onFocus = vi.fn()
    renderWithProviders(<Accordion items={items} data-testid="faq" id="faq" onFocus={onFocus} />)

    await user.tab()

    expect(screen.getByTestId('faq')).toHaveAttribute('id', 'faq')
    expect(onFocus).toHaveBeenCalled()
  })

  it('sets the motion variables on the root and zeroes them for animation={false}', () => {
    const { container, unmount } = renderWithProviders(<Accordion items={items} />)
    const root = () => container.querySelector('[data-slot="accordion"]') as HTMLElement

    expect(root().style.getPropertyValue('--enchase-accordion-duration')).toBe('200ms')
    expect(root().style.getPropertyValue('--enchase-accordion-distance')).toBe('6px')
    unmount()

    const off = renderWithProviders(<Accordion items={items} animation={false} />)
    const style = (off.container.querySelector('[data-slot="accordion"]') as HTMLElement).style

    expect(style.getPropertyValue('--enchase-accordion-duration')).toBe('0ms')
    expect(style.getPropertyValue('--enchase-accordion-distance')).toBe('0px')
  })

  it('takes a custom duration and distance through the animation tuning', () => {
    const { container } = renderWithProviders(<Accordion items={items} animation={{ tuning: { duration: 0.5, distance: 10 } }} />)
    const style = (container.querySelector('[data-slot="accordion"]') as HTMLElement).style

    expect(style.getPropertyValue('--enchase-accordion-duration')).toBe('500ms')
    expect(style.getPropertyValue('--enchase-accordion-distance')).toBe('10px')
  })
})
