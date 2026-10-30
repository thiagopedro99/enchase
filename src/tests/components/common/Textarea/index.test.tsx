import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { describeRequiredContract } from '@tests/shared/contracts/requiredContract.tsx'
import { describeFieldVariantContract } from '@tests/shared/contracts/fieldVariantContract.tsx'
import { describeLabelPlacementContract } from '@tests/shared/contracts/labelPlacementContract.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'

describe('Textarea', () => {
  it('renders a multiline field named by its label', () => {
    renderWithProviders(<Textarea label="Mensagem" />)

    expect(screen.getByRole('textbox', { name: 'Mensagem' }).tagName).toBe('TEXTAREA')
  })

  it('associates the label even when no id is provided', () => {
    renderWithProviders(<Textarea label="Mensagem" />)

    expect(screen.getByLabelText('Mensagem')).toBeInTheDocument()
  })

  it('keeps ids unique across fields', () => {
    renderWithProviders(
      <>
        <Textarea label="First" helperText="one" />
        <Textarea label="Second" helperText="two" />
      </>
    )

    expect(screen.getByLabelText('First').id).not.toBe(screen.getByLabelText('Second').id)
  })

  it('uses a provided id', () => {
    renderWithProviders(<Textarea label="Mensagem" id="message" />)

    expect(screen.getByLabelText('Mensagem')).toHaveAttribute('id', 'message')
  })

  it('describes the field with the helper text', () => {
    renderWithProviders(<Textarea label="Mensagem" helperText="Conte o que aconteceu" />)

    expect(screen.getByLabelText('Mensagem')).toHaveAccessibleDescription('Conte o que aconteceu')
  })

  it('marks the field invalid and announces the error instead of the helper', () => {
    renderWithProviders(<Textarea label="Mensagem" helperText="Conte o que aconteceu" error="Obrigatório" />)

    const field = screen.getByLabelText('Mensagem')

    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription('Obrigatório')
    expect(screen.getByRole('alert')).toHaveTextContent('Obrigatório')
    expect(screen.queryByText('Conte o que aconteceu')).not.toBeInTheDocument()
  })

  it('merges a consumer aria-describedby with its own', () => {
    renderWithProviders(
      <>
        <p id="hint">Extra hint</p>
        <Textarea label="Mensagem" helperText="Helper" aria-describedby="hint" />
      </>
    )

    expect(screen.getByLabelText('Mensagem')).toHaveAccessibleDescription('Extra hint Helper')
  })

  it('is not marked invalid by default', () => {
    renderWithProviders(<Textarea label="Mensagem" />)

    expect(screen.getByLabelText('Mensagem')).not.toHaveAttribute('aria-invalid')
  })

  it('shows three rows by default and takes another number', () => {
    const { unmount } = renderWithProviders(<Textarea label="Mensagem" />)

    expect(screen.getByLabelText('Mensagem')).toHaveAttribute('rows', '3')

    unmount()
    renderWithProviders(<Textarea label="Mensagem" rows={6} />)

    expect(screen.getByLabelText('Mensagem')).toHaveAttribute('rows', '6')
  })

  it('resizes vertically by default', () => {
    renderWithProviders(<Textarea label="Mensagem" />)

    expect(screen.getByLabelText('Mensagem')).toHaveAttribute('data-resize', 'vertical')
  })

  it.each(['none', 'horizontal', 'both'] as const)('takes resize="%s"', (resize) => {
    renderWithProviders(<Textarea label="Mensagem" resize={resize} />)

    expect(screen.getByLabelText('Mensagem')).toHaveAttribute('data-resize', resize)
  })

  it('does not pass its own props to the page', () => {
    renderWithProviders(<Textarea label="Mensagem" fullWidth resize="none" helperText="Dica" wrapperClassName="outer" />)
    const field = screen.getByLabelText('Mensagem')

    for (const name of ['fullwidth', 'full-width', 'resize', 'helpertext', 'wrapperclassname', 'label', 'error']) {
      expect(field, name).not.toHaveAttribute(name)
    }
  })

  it('keeps a multiline value and calls the change handler', async () => {
    const user = userEvent.setup()
    const values: string[] = []
    renderWithProviders(<Textarea label="Mensagem" onChange={(event) => values.push(event.target.value)} />)

    await user.type(screen.getByLabelText('Mensagem'), 'linha 1{Enter}linha 2')

    expect(screen.getByLabelText('Mensagem')).toHaveValue('linha 1\nlinha 2')
    expect(values.at(-1)).toBe('linha 1\nlinha 2')
  })

  it('forwards the ref to the native textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    renderWithProviders(<Textarea label="Mensagem" ref={ref} />)

    expect(ref.current).toBe(screen.getByLabelText('Mensagem'))
  })

  it('passes the native attributes to the textarea', () => {
    renderWithProviders(<Textarea label="Mensagem" name="message" maxLength={200} required readOnly />)
    const field = screen.getByLabelText('Mensagem')

    expect(field).toHaveAttribute('name', 'message')
    expect(field).toHaveAttribute('maxlength', '200')
    expect(field).toBeRequired()
    expect(field).toHaveAttribute('readonly')
  })

  it('keeps the placeholder blank under a label so the label can float, and the given one otherwise', () => {
    const { unmount } = renderWithProviders(<Textarea label="Mensagem" />)

    expect(screen.getByLabelText('Mensagem')).toHaveAttribute('placeholder', ' ')

    unmount()
    const withText = renderWithProviders(<Textarea label="Mensagem" placeholder="Escreva aqui" />)

    expect(screen.getByLabelText('Mensagem')).toHaveAttribute('placeholder', 'Escreva aqui')

    withText.unmount()
    renderWithProviders(<Textarea aria-label="Sem rótulo visível" />)

    expect(screen.getByLabelText('Sem rótulo visível')).not.toHaveAttribute('placeholder')
  })

  it('disables the field and blocks typing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Textarea label="Mensagem" disabled />)

    await user.type(screen.getByLabelText('Mensagem'), 'texto')

    expect(screen.getByLabelText('Mensagem')).toBeDisabled()
    expect(screen.getByLabelText('Mensagem')).toHaveValue('')
  })

  it('is reached with the keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Textarea label="Mensagem" />)

    await user.tab()

    expect(screen.getByLabelText('Mensagem')).toHaveFocus()
  })

  it('has no axe violations with helper text and error', async () => {
    const { container } = renderWithProviders(
      <form>
        <Textarea label="Descrição" helperText="Até 200 caracteres" />
        <Textarea label="Mensagem" error="Obrigatório" />
        <Textarea aria-label="Sem rótulo visível" />
      </form>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Textarea contract', () => {
  it('marks the wrapper and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Textarea label="Mensagem" error="Obrigatório" />)

    for (const part of ['textarea', 'textarea-control', 'textarea-field', 'textarea-label', 'textarea-outline', 'textarea-error']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('marks the helper text with its own slot', () => {
    const { container } = renderWithProviders(<Textarea label="Mensagem" helperText="Dica" />)

    expect(container.querySelector('[data-slot="textarea-helper"]')).toHaveTextContent('Dica')
  })

  it('keeps className and style on the native textarea and the wrapper ones on the root', () => {
    const { container } = renderWithProviders(<Textarea label="Nome" className="mine" style={{ color: 'red' }} wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />)
    const field = screen.getByLabelText('Nome')
    const root = container.querySelector('[data-slot="textarea"]') as HTMLElement

    expect(field.className.split(' ').at(-1)).toBe('mine')
    expect(field.style.color).toBe('red')
    expect(field).toHaveAttribute('data-slot', 'textarea-field')
    expect(root.className.split(' ').at(-1)).toBe('outer')
    expect(root.style.margin).toBe('3px')
  })

  it('flags the wrapper as full width, invalid or disabled and wires the error to the field', () => {
    const { container } = renderWithProviders(<Textarea label="Nome" error="Obrigatório" disabled fullWidth />)
    const root = container.querySelector('[data-slot="textarea"]') as HTMLElement
    const field = screen.getByLabelText('Nome')

    expect(root).toHaveAttribute('data-full-width')
    expect(root).toHaveAttribute('data-invalid')
    expect(root).toHaveAttribute('data-disabled')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id)
  })

  it('joins a caller aria-describedby with the helper text', () => {
    renderWithProviders(<Textarea label="Nome" helperText="Dica" aria-describedby="extra" />)

    expect(screen.getByLabelText('Nome').getAttribute('aria-describedby')).toBe(`extra ${screen.getByText('Dica').id}`)
  })

  it('runs the handler of the caller before its own and does not lose the slot', async () => {
    const user = userEvent.setup()
    const calls: string[] = []
    renderWithProviders(<Textarea label="Nome" onFocus={() => calls.push('focus')} />)

    await user.click(screen.getByLabelText('Nome'))

    expect(calls).toEqual(['focus'])
    expect(screen.getByLabelText('Nome')).toHaveAttribute('data-slot', 'textarea-field')
  })
})

describeLabelPlacementContract({ name: 'Textarea', slot: 'textarea', control: 'textarea', placeholder: 'Type', render: (placement) => <Textarea label="Name" placeholder="Type" labelPlacement={placement} /> })

describeFieldVariantContract({ name: 'Textarea', slot: 'textarea', control: 'textarea', render: (props) => <Textarea label="Name" placeholder="Type" {...props} /> })

describeRequiredContract({ name: 'Textarea', slot: 'textarea', control: 'textarea', role: 'textbox', render: (props) => <Textarea label="Name" placeholder="Type" {...props} /> })
