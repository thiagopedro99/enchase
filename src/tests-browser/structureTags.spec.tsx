import { describe, expect, it } from 'vitest'

import { Container } from '@components/common/Container/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Flex } from '@components/common/Flex/index.tsx'
import { Grid } from '@components/common/Grid/index.tsx'
import { renderInBrowser } from './harness.tsx'

import type { StructureTag } from '@utils/structureTag.ts'
import type { ReactElement, ReactNode } from 'react'

const roots: [string, (as: StructureTag, id: string, children?: ReactNode) => ReactElement][] = [
  ['Grid', (as, id, children) => <Grid as={as} data-testid={id}>{children}</Grid>],
  ['Flex', (as, id, children) => <Flex as={as} data-testid={id}>{children}</Flex>],
  ['Container', (as, id, children) => <Container as={as} data-testid={id}>{children}</Container>],
  ['Card', (as, id, children) => <Card as={as} data-testid={id}>{children}</Card>]
]

const lists = (prefix: string) => (
  <>
    <ul data-testid={`${prefix}-ul`}>
      <li data-testid={`${prefix}-ul-item`}>Um</li>
    </ul>
    <ol data-testid={`${prefix}-ol`}>
      <li data-testid={`${prefix}-ol-item`}>Um</li>
    </ol>
    <details>
      <summary data-testid={`${prefix}-summary`}>Mais</summary>
      Texto
    </details>
  </>
)

const listStyleOf = (id: string) => getComputedStyle(document.querySelector(`[data-testid="${id}"]`) as Element).listStyleType

const properties = ['display', 'list-style-type', 'list-style-position', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'inline-size']

const boxOf = (id: string) => {
  const computed = getComputedStyle(document.querySelector(`[data-testid="${id}"]`) as Element)

  return Object.fromEntries(properties.map((property) => [property, computed.getPropertyValue(property)]))
}

describe.each(roots)('%s as a list in a real browser', (_, make) => {
  it.each(['ul', 'ol'] as const)('has the box of a div and none of the markers, the margin or the indent of a %s', (tag) => {
    renderInBrowser(
      <>
        {make('div', 'plain')}
        {make(tag, 'list')}
      </>
    )

    expect(boxOf('list')['list-style-type']).toBe('none')
    expect(boxOf('list')).toEqual({ ...boxOf('plain'), 'list-style-type': 'none' })
  })
})

describe.each(roots)('the real lists inside a %s in a real browser', (_, make) => {
  it('keeps the markers of the ul, the ol and the disclosure that it holds, as a plain div would', () => {
    renderInBrowser(
      <>
        <div>{lists('plain')}</div>
        {make('div', 'root', lists('inside'))}
      </>
    )

    expect(listStyleOf('plain-ul')).toBe('disc')
    expect(listStyleOf('plain-ol')).toBe('decimal')

    for (const part of ['ul', 'ol', 'ul-item', 'ol-item', 'summary']) expect(listStyleOf(`inside-${part}`), part).toBe(listStyleOf(`plain-${part}`))
  })
})

describe('the items of a list made with the layout primitives in a real browser', () => {
  it.each(['ul', 'ol'] as const)('shows no marker on the li of a %s', (tag) => {
    renderInBrowser(
      <Grid as={tag} data-testid="list">
        <li data-testid="item">Um</li>
      </Grid>
    )

    expect(getComputedStyle(document.querySelector('[data-testid="item"]') as Element).listStyleType).toBe('none')
  })

  it('shows no marker on a Card that is a li, even outside a list of the library', () => {
    renderInBrowser(
      <ul>
        <Card as="li" data-testid="item">
          Um
        </Card>
      </ul>
    )

    expect(getComputedStyle(document.querySelector('[data-testid="item"]') as Element).listStyleType).toBe('none')
  })

  it('stretches a Card that is a li to the height of its row in a Grid that is a ul, with no block-size on the card', () => {
    renderInBrowser(
      <Grid as="ul" columns={3} data-testid="grid">
        <Card as="li">
          <div style={{ blockSize: 20 }} />
        </Card>
        <Card as="li">
          <div style={{ blockSize: 200 }} />
        </Card>
        <Card as="li">
          <div style={{ blockSize: 60 }} />
        </Card>
      </Grid>
    )
    const items = [...document.querySelectorAll('[data-testid="grid"] > li')]
    const padding = parseFloat(getComputedStyle(items[0]).paddingTop) * 2

    expect(items.map((item) => item.getBoundingClientRect().height)).toEqual([200 + padding, 200 + padding, 200 + padding])
  })

  it('wraps the li of a Flex that is a ul and keeps them apart by the gap', () => {
    renderInBrowser(
      <div style={{ inlineSize: 200 }}>
        <Flex as="ul" wrap gap="8px" data-testid="badges">
          {[1, 2, 3, 4].map((number) => (
            <li key={number}>
              <span style={{ display: 'inline-block', inlineSize: 80, blockSize: 20 }} />
            </li>
          ))}
        </Flex>
      </div>
    )
    const boxes = [...document.querySelectorAll('[data-testid="badges"] > li')].map((item) => item.getBoundingClientRect())

    expect(boxes[1].left - boxes[0].left).toBe(88)
    expect(boxes[2].left).toBe(boxes[0].left)
    expect(boxes[2].top - boxes[0].top).toBe(boxes[0].height + 8)
    expect(boxes[3].top).toBe(boxes[2].top)
  })
})
