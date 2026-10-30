import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { useLabelPlacement, useThemeDefaults } from '@components/colorMode/themeDefaults.ts'
import { enchase } from '@styles/presets/enchase.ts'
import { shadcn } from '@styles/presets/shadcn.ts'

import type { FieldVariant, LabelPlacement } from '@styles/tokens/types.ts'

const Probe = () => <p data-testid="placement">{useThemeDefaults().labelPlacement}</p>

const Effective = ({ labelPlacement, variant }: { labelPlacement?: LabelPlacement; variant: FieldVariant }) => <p data-testid="effective">{useLabelPlacement(labelPlacement, variant)}</p>

const seen: ReturnType<typeof useThemeDefaults>[] = []

const Recorder = () => {
  seen.push(useThemeDefaults())

  return null
}

describe('the defaults that the theme gives to the components', () => {
  it('puts the label inside the field when there is no provider', () => {
    render(<Probe />)

    expect(screen.getByTestId('placement')).toHaveTextContent('floating')
  })

  it('keeps the floating label for a provider without a style or with the enchase style', () => {
    const { unmount } = render(
      <ColorModeProvider storage={null}>
        <Probe />
      </ColorModeProvider>
    )

    expect(screen.getByTestId('placement')).toHaveTextContent('floating')
    unmount()
    render(
      <ColorModeProvider storage={null} theme={{ style: enchase }}>
        <Probe />
      </ColorModeProvider>
    )

    expect(screen.getByTestId('placement')).toHaveTextContent('floating')
  })

  it('takes the stacked label from the shadcn style', () => {
    render(
      <ColorModeProvider storage={null} theme={{ style: shadcn }}>
        <Probe />
      </ColorModeProvider>
    )

    expect(screen.getByTestId('placement')).toHaveTextContent('stacked')
  })

  it('gives the same default on the server as in the browser', () => {
    const html = renderToString(
      <ColorModeProvider storage={null} theme={{ style: shadcn }}>
        <Probe />
      </ColorModeProvider>
    )

    expect(html).toContain('stacked')
  })

  it('writes the css of the style: the tokens of its palette in the mode blocks', () => {
    const { container } = render(
      <ColorModeProvider storage={null} theme={{ style: shadcn }}>
        <Probe />
      </ColorModeProvider>
    )
    const css = container.ownerDocument.querySelector('style')?.textContent ?? ''

    expect(css).toContain('--enchase-color-primary: #171717;')
    expect(css).toContain('--enchase-control-height-md: 2.25rem;')
  })

  it('keeps the same defaults object while the placement does not change, even when the theme is a new object on every render', () => {
    seen.length = 0
    const app = (
      <ColorModeProvider storage={null} theme={{ style: shadcn }}>
        <Recorder />
      </ColorModeProvider>
    )
    const { rerender } = render(app)

    rerender(
      <ColorModeProvider storage={null} theme={{ style: shadcn }}>
        <Recorder />
      </ColorModeProvider>
    )

    expect(seen.length).toBeGreaterThanOrEqual(2)
    expect(new Set(seen).size).toBe(1)
  })

  it('gives a new defaults object when the style changes the placement', () => {
    seen.length = 0
    const { rerender } = render(
      <ColorModeProvider storage={null} theme={{ style: enchase }}>
        <Recorder />
      </ColorModeProvider>
    )

    rerender(
      <ColorModeProvider storage={null} theme={{ style: shadcn }}>
        <Recorder />
      </ColorModeProvider>
    )

    expect(new Set(seen).size).toBe(2)
    expect(seen.at(-1)?.labelPlacement).toBe('stacked')
  })
})

describe('the placement of the label that a field really uses', () => {
  const variants = ['filled', 'borderless', 'underlined'] as const

  it('is the one asked for, or the one of the style, in the outlined variant', () => {
    const { unmount } = render(<Effective variant="outlined" />)

    expect(screen.getByTestId('effective')).toHaveTextContent('floating')
    unmount()

    const { unmount: second } = render(<Effective variant="outlined" labelPlacement="stacked" />)

    expect(screen.getByTestId('effective')).toHaveTextContent('stacked')
    second()
    render(
      <ColorModeProvider storage={null} theme={{ style: shadcn }}>
        <Effective variant="outlined" />
      </ColorModeProvider>
    )

    expect(screen.getByTestId('effective')).toHaveTextContent('stacked')
  })

  it.each(variants)('turns the floating label, asked for or taken from the style, into a stacked one in the %s variant', (variant) => {
    const { unmount } = render(<Effective variant={variant} />)

    expect(screen.getByTestId('effective')).toHaveTextContent('stacked')
    unmount()
    render(<Effective variant={variant} labelPlacement="floating" />)

    expect(screen.getByTestId('effective')).toHaveTextContent('stacked')
  })

  it.each(variants)('keeps the stacked label as it is in the %s variant', (variant) => {
    render(<Effective variant={variant} labelPlacement="stacked" />)

    expect(screen.getByTestId('effective')).toHaveTextContent('stacked')
  })
})
