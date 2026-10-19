import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Alert } from '@components/common/Alert/index.tsx'

const variants = ['info', 'success', 'warning', 'error'] as const

describe('Alert', () => {
  it('shows its message in a status region by default', () => {
    renderWithProviders(<Alert>Alterações salvas</Alert>)

    expect(screen.getByRole('status')).toHaveTextContent('Alterações salvas')
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'info')
  })

  it.each(variants)('takes variant="%s"', (variant) => {
    renderWithProviders(<Alert variant={variant}>Mensagem</Alert>)

    expect(screen.getByText('Mensagem').closest('[data-slot="alert"]')).toHaveAttribute('data-variant', variant)
  })

  it('announces only an error right away, with role alert', () => {
    renderWithProviders(
      <>
        {variants.map((variant) => (
          <Alert key={variant} variant={variant}>
            {variant}
          </Alert>
        ))}
      </>
    )

    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByRole('alert')).toHaveTextContent('error')
    expect(screen.getAllByRole('status')).toHaveLength(3)
  })

  it('lets the caller choose another role', () => {
    renderWithProviders(
      <Alert role="note" variant="error">
        Só uma nota
      </Alert>
    )

    expect(screen.getByRole('note')).toHaveTextContent('Só uma nota')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the title above the message without passing it to the page as an attribute', () => {
    renderWithProviders(
      <Alert title="Atenção" data-testid="alert">
        O prazo termina hoje.
      </Alert>
    )
    const alert = screen.getByTestId('alert')

    expect(screen.getByText('Atenção')).toBeInTheDocument()
    expect(alert).not.toHaveAttribute('title')
    expect(alert).toHaveAccessibleDescription('')
    expect(alert).toHaveTextContent('AtençãoO prazo termina hoje.')
  })

  it('draws a decorative icon for each variant', () => {
    const { container } = renderWithProviders(
      <>
        {variants.map((variant) => (
          <Alert key={variant} variant={variant}>
            {variant}
          </Alert>
        ))}
      </>
    )
    const icons = container.querySelectorAll('[data-slot="alert-icon"]')

    expect(icons).toHaveLength(4)

    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(icon.querySelector('svg')).toBeInTheDocument()
    }
  })

  it('replaces the icon with the one of the caller', () => {
    const { container } = renderWithProviders(<Alert icon={<span data-testid="mine" />}>Mensagem</Alert>)

    expect(container.querySelector('[data-slot="alert-icon"]')).toContainElement(screen.getByTestId('mine'))
    expect(container.querySelector('[data-slot="alert-icon"] svg')).not.toBeInTheDocument()
  })

  it.each([null, false] as const)('has no icon with icon={%s}', (icon) => {
    const { container } = renderWithProviders(<Alert icon={icon}>Mensagem</Alert>)

    expect(container.querySelector('[data-slot="alert-icon"]')).not.toBeInTheDocument()
  })

  it('has no close button without onClose', () => {
    renderWithProviders(<Alert>Mensagem</Alert>)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows a close button named by the labels of the provider and calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<Alert onClose={onClose}>Mensagem</Alert>)

    await user.click(screen.getByRole('button', { name: 'Fechar notificação' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses a configurable label for the close button', () => {
    renderWithProviders(<Alert onClose={() => undefined}>Mensagem</Alert>, { labels: { closeToast: 'Dismiss' } })

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('closes with the keyboard', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<Alert onClose={onClose}>Mensagem</Alert>)

    await user.tab()

    expect(screen.getByRole('button', { name: 'Fechar notificação' })).toHaveFocus()

    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('keeps links and buttons inside the message reachable', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Alert variant="warning" onClose={() => undefined}>
        Sua assinatura vence hoje. <a href="/planos">Ver planos</a>
      </Alert>
    )

    await user.tab()

    expect(screen.getByRole('link', { name: 'Ver planos' })).toHaveFocus()

    await user.tab()

    expect(screen.getByRole('button', { name: 'Fechar notificação' })).toHaveFocus()
  })

  it('has no axe violations in every variant, with a title and a close button', async () => {
    const { container } = renderWithProviders(
      <div>
        {variants.map((variant) => (
          <Alert key={variant} variant={variant} title={`Título ${variant}`} onClose={() => undefined}>
            Mensagem {variant}
          </Alert>
        ))}
      </div>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Alert contract', () => {
  it('marks the root and every part with a data-slot', () => {
    const { container } = renderWithProviders(
      <Alert title="Título" onClose={() => undefined}>
        Mensagem
      </Alert>
    )

    for (const part of ['alert', 'alert-icon', 'alert-content', 'alert-title', 'alert-message', 'alert-close']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('keeps the caller className last and lets the caller style win', () => {
    renderWithProviders(
      <Alert className="mine" style={{ color: 'red' }}>
        Mensagem
      </Alert>
    )
    const alert = screen.getByRole('status')

    expect(alert.className.split(' ').at(-1)).toBe('mine')
    expect(alert.style.color).toBe('red')
  })

  it('keeps the data-slot of the library and passes the other attributes to the root', () => {
    renderWithProviders(
      <Alert data-slot="mine" id="saved" aria-label="Resultado">
        Mensagem
      </Alert>
    )
    const alert = screen.getByRole('status')

    expect(alert).toHaveAttribute('data-slot', 'alert')
    expect(alert).toHaveAttribute('id', 'saved')
    expect(alert).toHaveAccessibleName('Resultado')
  })

  it('does not pass variant, icon and onClose to the page as attributes', () => {
    renderWithProviders(
      <Alert variant="success" icon={null} onClose={() => undefined}>
        Mensagem
      </Alert>
    )
    const alert = screen.getByRole('status')

    for (const name of ['variant', 'icon', 'onclose']) {
      expect(alert, name).not.toHaveAttribute(name)
    }
  })

  it('runs the click handler of the caller on the root', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(<Alert onClick={onClick}>Mensagem</Alert>)

    await user.click(screen.getByRole('status'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
