import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'
import { createRef } from 'react'

import { Divider } from '@components/common/Divider/index.tsx'

describe('Divider', () => {
  it('is a horizontal separator on an hr by default', () => {
    renderWithProviders(<Divider />)
    const divider = screen.getByRole('separator')

    expect(divider.tagName).toBe('HR')
    expect(divider).toHaveAttribute('data-orientation', 'horizontal')
    expect(divider).not.toHaveAttribute('aria-orientation')
  })

  it('announces a vertical separator as vertical', () => {
    renderWithProviders(<Divider orientation="vertical" />)
    const divider = screen.getByRole('separator')

    expect(divider).toHaveAttribute('data-orientation', 'vertical')
    expect(divider).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('leaves assistive technology out of a decorative divider', () => {
    const { container } = renderWithProviders(<Divider decorative orientation="vertical" />)
    const divider = container.querySelector('hr') as HTMLElement

    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
    expect(divider).toHaveAttribute('role', 'none')
    expect(divider).not.toHaveAttribute('aria-orientation')
    expect(divider).toHaveAttribute('data-orientation', 'vertical')
  })

  it('stays an hr with no text attribute unless it has a text', () => {
    renderWithProviders(<Divider textAlign="start" />)
    const divider = screen.getByRole('separator')

    expect(divider.tagName).toBe('HR')
    expect(divider).not.toHaveAttribute('data-with-text')
    expect(divider).not.toHaveAttribute('data-text-align')
    expect(divider.querySelector('[data-slot="divider-text"]')).toBeNull()
  })

  it('writes its children between two lines, as a horizontal separator on a div', () => {
    renderWithProviders(<Divider>or</Divider>)
    const divider = screen.getByRole('separator')
    const [before, text, after] = [...divider.children]

    expect(divider.tagName).toBe('DIV')
    expect(divider).toHaveAttribute('data-orientation', 'horizontal')
    expect(divider).toHaveAttribute('data-with-text', '')
    expect(divider).toHaveAttribute('data-text-align', 'center')
    expect(divider).not.toHaveAttribute('aria-orientation')
    expect([before, text, after].map((part) => part.getAttribute('data-slot'))).toEqual(['divider-line', 'divider-text', 'divider-line'])
    expect([before, after].map((line) => line.getAttribute('aria-hidden'))).toEqual(['true', 'true'])
    expect(text).toHaveTextContent('or')
  })

  it.each(['start', 'center', 'end'] as const)('puts the text at the %s', (align) => {
    renderWithProviders(<Divider textAlign={align}>or</Divider>)

    expect(screen.getByRole('separator')).toHaveAttribute('data-text-align', align)
  })

  it('keeps the text readable when the divider is decorative, and takes it out of the separators', () => {
    renderWithProviders(<Divider decorative>or</Divider>)

    expect(screen.queryByRole('separator')).toBeNull()
    expect(screen.getByText('or')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="divider"]')).toHaveAttribute('role', 'none')
  })

  it('draws no text on a vertical divider, which stays an hr', () => {
    renderWithProviders(<Divider orientation="vertical">or</Divider>)
    const divider = screen.getByRole('separator')

    expect(divider.tagName).toBe('HR')
    expect(divider).toHaveAttribute('aria-orientation', 'vertical')
    expect(screen.queryByText('or')).toBeNull()
  })

  it.each([undefined, null, false, ''] as const)('stays an hr for children that are %j', (children) => {
    renderWithProviders(<Divider>{children}</Divider>)

    expect(screen.getByRole('separator').tagName).toBe('HR')
  })

  it('passes the other attributes and the handlers to the div that holds the text', () => {
    renderWithProviders(
      <Divider id="split" className="custom" data-test="yes">
        or
      </Divider>
    )
    const divider = screen.getByRole('separator')

    expect(divider).toHaveAttribute('id', 'split')
    expect(divider).toHaveAttribute('data-test', 'yes')
    expect(divider.className).toContain('custom')
  })

  it('does not pass orientation, decorative and textAlign to the page as attributes', () => {
    renderWithProviders(<Divider orientation="vertical" decorative textAlign="end" />)
    const divider = document.querySelector('hr') as HTMLElement

    expect(divider).not.toHaveAttribute('orientation')
    expect(divider).not.toHaveAttribute('decorative')
    expect(divider).not.toHaveAttribute('textalign')
  })

  it('passes the other attributes to the hr', () => {
    renderWithProviders(<Divider id="between" title="Between the sections" data-testid="divider" />)
    const divider = screen.getByTestId('divider')

    expect(divider).toHaveAttribute('id', 'between')
    expect(divider).toHaveAttribute('title', 'Between the sections')
  })

  it('has no axe violations with a text, decorative or not, at each end', async () => {
    const { container } = renderWithProviders(
      <>
        <Divider>or</Divider>
        <Divider textAlign="start">or</Divider>
        <Divider textAlign="end" decorative>
          or
        </Divider>
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations in each orientation, decorative or not', async () => {
    const { container } = renderWithProviders(
      <div>
        <Divider />
        <Divider orientation="vertical" />
        <Divider decorative />
        <Divider decorative orientation="vertical" />
      </div>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Divider contract', () => {
  it('marks the root with a data-slot', () => {
    renderWithProviders(<Divider />)

    expect(screen.getByRole('separator')).toHaveAttribute('data-slot', 'divider')
  })

  it('keeps the caller className last and lets the caller style win', () => {
    renderWithProviders(<Divider className="mine" style={{ borderColor: 'red' }} />)
    const divider = screen.getByRole('separator')

    expect(divider.className.split(' ').at(-1)).toBe('mine')
    expect(divider.style.borderColor).toBe('red')
  })

  it('keeps the data-slot of the library when the caller sends one', () => {
    renderWithProviders(<Divider data-slot="mine" />)

    expect(screen.getByRole('separator')).toHaveAttribute('data-slot', 'divider')
  })

  it('lets the caller role win over the one of a decorative divider', () => {
    renderWithProviders(<Divider decorative role="presentation" />)

    expect(document.querySelector('hr')).toHaveAttribute('role', 'presentation')
  })
})

describe('Divider ref', () => {
  it('gives the ref the rule, and the wrapper when it has text, and clears it on unmount', () => {
    const rule = createRef<HTMLHRElement>()
    const withText = createRef<HTMLHRElement>()
    const { unmount } = renderWithProviders(
      <>
        <Divider ref={rule} />
        <Divider ref={withText}>or</Divider>
      </>
    )
    const [first, second] = [...document.querySelectorAll('[data-slot="divider"]')]

    expect(rule.current).toBe(first)
    expect(first.tagName).toBe('HR')
    expect(withText.current).toBe(second)
    expect(second.tagName).toBe('DIV')

    unmount()

    expect([rule.current, withText.current]).toEqual([null, null])
  })
})
