import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { VisuallyHidden } from '@components/common/VisuallyHidden/index.tsx'
import { axe } from '@tests/axe.ts'

describe('VisuallyHidden', () => {
  it('keeps the text in the accessibility tree with a slot', () => {
    render(<VisuallyHidden>Só para leitores de tela</VisuallyHidden>)

    expect(screen.getByText('Só para leitores de tela')).toHaveAttribute('data-slot', 'visually-hidden')
  })

  it('keeps the caller className and attributes', () => {
    render(<VisuallyHidden className="mine" id="x">Texto</VisuallyHidden>)

    expect(screen.getByText('Texto').className.split(' ').at(-1)).toBe('mine')
    expect(screen.getByText('Texto')).toHaveAttribute('id', 'x')
  })

  it('has no axe violations', async () => {
    const { container } = render(<VisuallyHidden>Texto</VisuallyHidden>)

    expect(await axe(container)).toHaveNoViolations()
  })
})
