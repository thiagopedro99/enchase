import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Flex } from '@components/common/Flex/index.tsx'
import { axe } from '@tests/axe.ts'

describe('Flex', () => {
  it('describes direction, alignment and wrapping with attributes', () => {
    render(<Flex data-testid="f" direction="column" align="center" justify="between" wrap />)
    const root = screen.getByTestId('f')

    expect(root).toHaveAttribute('data-slot', 'flex')
    expect(root).toHaveAttribute('data-direction', 'column')
    expect(root).toHaveAttribute('data-align', 'center')
    expect(root).toHaveAttribute('data-justify', 'between')
    expect(root).toHaveAttribute('data-wrap')
  })

  it('passes the gap through a variable and has no wrap attribute by default', () => {
    render(<Flex data-testid="f" gap="2rem" />)

    expect(screen.getByTestId('f').style.getPropertyValue('--enchase-flex-gap')).toBe('2rem')
    expect(screen.getByTestId('f')).not.toHaveAttribute('data-wrap')
  })

  it('keeps the caller className and style', () => {
    render(<Flex data-testid="f" className="mine" style={{ gap: '5px' }} />)

    expect(screen.getByTestId('f').className.split(' ').at(-1)).toBe('mine')
    expect(screen.getByTestId('f')).toHaveStyle({ gap: '5px' })
  })

  it('has no axe violations', async () => {
    const { container } = render(<Flex>Conteúdo</Flex>)

    expect(await axe(container)).toHaveNoViolations()
  })
})
