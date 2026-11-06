import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'
import { createRef } from 'react'

import { Card } from '@components/common/Card/index.tsx'
import { Grid } from '@components/common/Grid/index.tsx'
import { structureTags } from '@utils/structureTag.ts'

describe('Card', () => {
  it('renders every variant and passes through attributes', () => {
    renderWithProviders(
      <>
        <Card variant="default" data-testid="default">
          a
        </Card>
        <Card variant="elevated" data-testid="elevated">
          b
        </Card>
        <Card variant="outlined" data-testid="outlined">
          c
        </Card>
      </>
    )

    expect(screen.getByTestId('elevated')).toBeInTheDocument()
    expect(screen.getByTestId('outlined')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Card variant="elevated">Conteúdo</Card>)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Card header', () => {
  const root = () => screen.getByTestId('card')

  it('keeps its children straight in the root, with nothing marked, unless it has a header', () => {
    renderWithProviders(
      <Card data-testid="card" padding="2rem">
        <span>content</span>
      </Card>
    )

    expect(root()).not.toHaveAttribute('data-with-header')
    expect([...root().children].map((child) => child.tagName)).toEqual(['SPAN'])
    expect(root().style.getPropertyValue('--card-padding-prop')).toBe('2rem')
    expect(root().style.padding).toBe('')
  })

  it.each([undefined, null, false, ''] as const)('stays without a header for a header that is %j', (header) => {
    renderWithProviders(
      <Card data-testid="card" header={header} headerExtra={header}>
        content
      </Card>
    )

    expect(root()).not.toHaveAttribute('data-with-header')
    expect(root().querySelector('[data-slot="card-header"]')).toBeNull()
  })

  it('writes the header above the body, with the title and the extra, and marks the root', () => {
    renderWithProviders(
      <Card data-testid="card" header="Invoice" headerExtra={<button type="button">Edit</button>}>
        content
      </Card>
    )
    const [header, body] = [...root().children]

    expect(root()).toHaveAttribute('data-with-header', '')
    expect([header, body].map((part) => part.getAttribute('data-slot'))).toEqual(['card-header', 'card-body'])
    expect([...header.children].map((part) => part.getAttribute('data-slot'))).toEqual(['card-title', 'card-extra'])
    expect(header.querySelector('[data-slot="card-title"]')).toHaveTextContent('Invoice')
    expect(header.querySelector('[data-slot="card-extra"]')).toContainElement(screen.getByRole('button', { name: 'Edit' }))
    expect(body).toHaveTextContent('content')
  })

  it('writes an empty title to keep the extra at the end when there is only the extra, and no extra when there is only the title', () => {
    const { unmount } = renderWithProviders(
      <Card data-testid="card" headerExtra="Extra">
        content
      </Card>
    )

    expect([...root().querySelector('[data-slot="card-header"]')!.children].map((part) => part.getAttribute('data-slot'))).toEqual(['card-title', 'card-extra'])
    expect(root().querySelector('[data-slot="card-title"]')).toBeEmptyDOMElement()
    unmount()

    renderWithProviders(
      <Card data-testid="card" header="Title">
        content
      </Card>
    )

    expect(root().querySelector('[data-slot="card-extra"]')).toBeNull()
  })

  it('moves the padding prop to the body, and keeps the style of the caller on the root', () => {
    renderWithProviders(
      <Card data-testid="card" header="Title" padding="2rem" style={{ color: 'red' }}>
        content
      </Card>
    )

    const body = root().querySelector('[data-slot="card-body"]') as HTMLElement

    expect(root().style.padding).toBe('')
    expect(root().style.getPropertyValue('--card-padding-prop')).toBe('')
    expect(root()).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(body.style.getPropertyValue('--card-padding-prop')).toBe('2rem')
    expect(body.style.padding).toBe('')
  })

  it('does not pass header and headerExtra to the page as attributes', () => {
    renderWithProviders(
      <Card data-testid="card" header="Title" headerExtra="Extra">
        content
      </Card>
    )

    for (const name of ['header', 'headerextra']) expect(root(), name).not.toHaveAttribute(name)
  })

  it('keeps the tag, the role and the lift of the root, and has no axe violations', async () => {
    const { container } = renderWithProviders(
      <Grid as="ul">
        <Card as="li" variant="elevated" header="Title" headerExtra={<button type="button">Edit</button>}>
          content
        </Card>
      </Grid>
    )

    expect(container.querySelector('li')).toHaveAttribute('data-with-header', '')
    expect(container.querySelector('li')).toHaveAttribute('data-motion')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Card contract', () => {
  it('marks the root with a slot and the variant and keeps the caller className last', () => {
    renderWithProviders(
      <Card variant="outlined" className="mine" data-testid="card">
        a
      </Card>
    )
    const card = screen.getByTestId('card')

    expect(card).toHaveAttribute('data-slot', 'card')
    expect(card).toHaveAttribute('data-variant', 'outlined')
    expect(card.className.split(' ').at(-1)).toBe('mine')
  })

  it('writes the padding prop in a variable, so the padding of the caller style still wins', () => {
    renderWithProviders(
      <>
        <Card padding="2rem" data-testid="padded">
          a
        </Card>
        <Card padding="2rem" style={{ padding: '1px', color: 'red' }} data-testid="styled">
          b
        </Card>
      </>
    )

    expect(screen.getByTestId('padded').style.getPropertyValue('--card-padding-prop')).toBe('2rem')
    expect(screen.getByTestId('padded').style.padding).toBe('')
    expect(screen.getByTestId('styled').style.getPropertyValue('--card-padding-prop')).toBe('2rem')
    expect(screen.getByTestId('styled')).toHaveStyle({ padding: '1px', color: 'rgb(255, 0, 0)' })
  })

  it('lifts only the elevated card and calls the motion lift', () => {
    renderWithProviders(
      <>
        <Card variant="elevated" data-testid="elevated">
          a
        </Card>
        <Card variant="default" data-testid="default">
          b
        </Card>
      </>
    )

    expect(screen.getByTestId('elevated')).toHaveAttribute('data-motion', 'lift')
    expect(screen.getByTestId('default')).toHaveAttribute('data-motion', 'off')
  })

  it('turns the lift off with animation false, never mode or the off preset', () => {
    renderWithProviders(
      <>
        <Card variant="elevated" animation={false} data-testid="false">
          a
        </Card>
        <Card variant="elevated" animation={{ recipe: 'fade' }} data-testid="other">
          b
        </Card>
      </>
    )

    expect(screen.getByTestId('false')).toHaveAttribute('data-motion', 'off')
    expect(screen.getByTestId('other')).toHaveAttribute('data-motion', 'off')
  })

  it('does not lift under the never mode or the off preset', () => {
    const { unmount } = renderWithProviders(<Card variant="elevated" data-testid="card">a</Card>, { motion: { mode: 'never' } })

    expect(screen.getByTestId('card')).toHaveAttribute('data-motion', 'off')

    unmount()
    renderWithProviders(<Card variant="elevated" data-testid="card">a</Card>, { motion: { preset: 'off' } })

    expect(screen.getByTestId('card')).toHaveAttribute('data-motion', 'off')
  })

  it('maps the tuning to css variables and scales by preset', () => {
    const { unmount } = renderWithProviders(
      <Card variant="elevated" animation={{ tuning: { duration: 0.3, distance: 6 } }} data-testid="card">
        a
      </Card>
    )

    expect(screen.getByTestId('card').style.getPropertyValue('--enchase-card-duration')).toBe('300ms')
    expect(screen.getByTestId('card').style.getPropertyValue('--enchase-card-distance')).toBe('6px')

    unmount()
    renderWithProviders(
      <Card variant="elevated" data-testid="card">
        a
      </Card>,
      { motion: { preset: 'expressive' } }
    )

    expect(screen.getByTestId('card').style.getPropertyValue('--enchase-card-distance')).toBe('3.2px')
  })

  it('does not use the motion library on the root', () => {
    renderWithProviders(
      <Card variant="elevated" data-testid="card">
        a
      </Card>
    )

    expect(screen.getByTestId('card').getAttribute('style') ?? '').not.toContain('transform')
  })
})

describe('Card as', () => {
  it('renders a div unless told otherwise', () => {
    renderWithProviders(<Card data-testid="card">a</Card>)

    expect(screen.getByTestId('card').tagName).toBe('DIV')
  })

  it.each(structureTags)('renders a %s when asked, still marked with its slot and its variant', (tag) => {
    renderWithProviders(
      <Card as={tag} variant="outlined" data-testid="card">
        a
      </Card>
    )
    const card = screen.getByTestId('card')

    expect(card.tagName.toLowerCase()).toBe(tag)
    expect(card).toHaveAttribute('data-slot', 'card')
    expect(card).toHaveAttribute('data-variant', 'outlined')
  })

  it('gives a list the role of a list, so it stays one in Safari once the markers are gone, and no other tag gets a role', () => {
    renderWithProviders(
      <>
        <Card as="ul" data-testid="ul">
          a
        </Card>
        <Card as="article" data-testid="article">
          b
        </Card>
        <Card data-testid="div">c</Card>
      </>
    )

    expect(screen.getByTestId('ul')).toHaveAttribute('role', 'list')
    expect(screen.getByTestId('article')).not.toHaveAttribute('role')
    expect(screen.getByTestId('div')).not.toHaveAttribute('role')
  })

  it('lets the role of the caller win over the one of the list', () => {
    renderWithProviders(
      <Card as="ul" role="presentation" data-testid="card">
        a
      </Card>
    )

    expect(screen.getByTestId('card')).toHaveAttribute('role', 'presentation')
  })

  it('keeps the padding, the lift and the attributes of the caller on the tag it renders', () => {
    renderWithProviders(
      <Card as="article" variant="elevated" padding="2rem" aria-label="Project" data-testid="card">
        a
      </Card>
    )
    const card = screen.getByTestId('card')

    expect(card.style.getPropertyValue('--card-padding-prop')).toBe('2rem')
    expect(card).toHaveAttribute('data-motion', 'lift')
    expect(screen.getByRole('article', { name: 'Project' })).toBe(card)
  })

  it('is an item of the list when it is a li inside a grid that is a ul, and has no axe violations', async () => {
    const { container } = renderWithProviders(
      <Grid as="ul" columns={2} aria-label="Projects">
        <Card as="li">Um</Card>
        <Card as="li" variant="outlined">
          Dois
        </Card>
      </Grid>
    )

    expect(screen.getByRole('list', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Card ref', () => {
  it('gives the ref the root element, whatever its tag and with or without a header', () => {
    const plain = createRef<HTMLElement>()
    const section = createRef<HTMLElement>()
    const headed = createRef<HTMLElement>()
    const { unmount } = renderWithProviders(
      <>
        <Card ref={plain}>Body</Card>
        <Card ref={section} as="section">
          Body
        </Card>
        <Card ref={headed} header="Title">
          Body
        </Card>
      </>
    )
    const roots = [...document.querySelectorAll('[data-slot="card"]')]

    expect([plain.current, section.current, headed.current]).toEqual(roots)
    expect(roots.map((root) => root.tagName)).toEqual(['DIV', 'SECTION', 'DIV'])

    unmount()

    expect([plain.current, section.current, headed.current]).toEqual([null, null, null])
  })
})
