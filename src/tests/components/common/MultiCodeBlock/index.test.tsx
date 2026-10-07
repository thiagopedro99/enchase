import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { MultiCodeBlock } from '@components/common/MultiCodeBlock/index.tsx'

import type { CodeBlock } from '@components/common/MultiCodeBlock/types.ts'

const blocks: CodeBlock[] = [
  { title: 'Componente', code: 'const a = 1' },
  { title: 'Estilos', code: 'const b = 2' }
]

describe('MultiCodeBlock', () => {
  it('renders each block as a focusable region named by its title', () => {
    renderWithProviders(<MultiCodeBlock blocks={blocks} />)

    const region = screen.getByRole('region', { name: 'Componente' })

    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toHaveTextContent('const a = 1')
    expect(screen.getByRole('region', { name: 'Estilos' })).toHaveTextContent('const b = 2')
  })

  it('copies the code of the chosen block to the clipboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MultiCodeBlock blocks={blocks} />)

    await user.click(screen.getAllByRole('button', { name: 'Copiar' })[1])

    expect(await navigator.clipboard.readText()).toBe('const b = 2')
  })

  it('announces the copy in a status and marks only the copied block', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MultiCodeBlock blocks={blocks} />)

    await user.click(screen.getAllByRole('button', { name: 'Copiar' })[0])

    expect(await screen.findByText('Copiado!', { selector: '[role="status"]' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Copiar' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Copiado!' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<MultiCodeBlock blocks={blocks} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
