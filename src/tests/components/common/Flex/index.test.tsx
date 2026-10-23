import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge } from '@components/common/Badge/index.tsx'
import { Flex } from '@components/common/Flex/index.tsx'
import { structureTags } from '@utils/structureTag.ts'
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

describe('Flex as', () => {
  it('renders a div unless told otherwise', () => {
    render(<Flex data-testid="f" />)

    expect(screen.getByTestId('f').tagName).toBe('DIV')
  })

  it.each(structureTags)('renders a %s when asked, still marked with its slot', (tag) => {
    render(<Flex as={tag} data-testid="f" />)
    const root = screen.getByTestId('f')

    expect(root.tagName.toLowerCase()).toBe(tag)
    expect(root).toHaveAttribute('data-slot', 'flex')
  })

  it('gives a list the role of a list, so it stays one in Safari once the markers are gone, and no other tag gets a role', () => {
    render(
      <>
        <Flex as="ul" data-testid="ul" />
        <Flex as="ol" data-testid="ol" />
        <Flex as="nav" data-testid="nav" />
        <Flex data-testid="div" />
      </>
    )

    expect(screen.getByTestId('ul')).toHaveAttribute('role', 'list')
    expect(screen.getByTestId('ol')).toHaveAttribute('role', 'list')
    expect(screen.getByTestId('nav')).not.toHaveAttribute('role')
    expect(screen.getByTestId('div')).not.toHaveAttribute('role')
  })

  it('lets the role of the caller win over the one of the list', () => {
    render(<Flex as="ul" role="presentation" data-testid="f" />)

    expect(screen.getByTestId('f')).toHaveAttribute('role', 'presentation')
  })

  it('keeps the direction, the wrap and the attributes of the caller on the tag it renders', () => {
    render(<Flex as="ul" direction="column" wrap gap="4px" aria-label="Stack" data-testid="f" />)
    const root = screen.getByTestId('f')

    expect(root).toHaveAttribute('data-direction', 'column')
    expect(root).toHaveAttribute('data-wrap')
    expect(root.style.getPropertyValue('--enchase-flex-gap')).toBe('4px')
    expect(root).toHaveAccessibleName('Stack')
  })

  it('makes a list of badges that reads as a list and has no axe violations', async () => {
    const { container } = render(
      <Flex as="ul" wrap gap="0.5rem" aria-label="Stack">
        <li>
          <Badge>React</Badge>
        </li>
        <li>
          <Badge variant="primary">TypeScript</Badge>
        </li>
        <li>
          <Badge variant="success">Vite</Badge>
        </li>
      </Flex>
    )

    expect(screen.getByRole('list', { name: 'Stack' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['React', 'TypeScript', 'Vite'])
    expect(await axe(container)).toHaveNoViolations()
  })
})
