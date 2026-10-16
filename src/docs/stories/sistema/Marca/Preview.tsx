import { Button, Card, Checkbox, ColorModeProvider, Input, Link, UIProvider, useColorMode } from 'enchase'
import { createTheme, validateTheme } from 'enchase/theme'
import { ptBR } from 'enchase/locales'

import { swatchTokens } from './defaultData.ts'

import type { PreviewProps } from './types.ts'

const readTheme = (brand: string) => {
  try {
    const theme = createTheme({ brand })

    return { theme, issues: validateTheme(theme).length, error: null }
  } catch (error) {
    return { theme: null, issues: 0, error: error instanceof Error ? error.message : String(error) }
  }
}

export const Preview = ({ brand }: PreviewProps) => {
  const { resolvedMode } = useColorMode()
  const { theme, issues, error } = readTheme(brand)

  if (theme === null) return <p role="alert">{error}</p>

  const colors = theme[resolvedMode].colors

  return (
    <ColorModeProvider mode={resolvedMode} theme={{ brand }} storage={null}>
      <UIProvider locale={ptBR}>
        <div style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem', maxInlineSize: '40rem', borderRadius: '1rem', background: 'var(--enchase-color-background)', color: 'var(--enchase-color-text-primary)' }}>
          <p style={{ margin: 0 }}>
            {issues === 0 ? 'Nenhum par de cor abaixo do contraste mínimo, nos dois temas.' : `${issues} par(es) de cor abaixo do contraste mínimo.`} Primary claro: <strong>{theme.light.colors.primary}</strong>, escuro: <strong>{theme.dark.colors.primary}</strong>.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>

          <Input label="E-mail" placeholder="voce@exemplo.com" />

          <Card variant="elevated">
            <p style={{ margin: 0 }}>
              Cartão com <Link href="#">um link</Link> e texto comum.
            </p>
          </Card>

          <Checkbox label="Aceito os termos" defaultChecked />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))', gap: '0.5rem' }}>
            {swatchTokens.map((token) => (
              <div key={token} style={{ display: 'grid', gap: '0.25rem', fontSize: '0.75rem' }}>
                <span style={{ blockSize: '2.5rem', borderRadius: '0.5rem', background: colors[token], border: '1px solid var(--enchase-color-border)' }} />
                <span>
                  {token}
                  <br />
                  {colors[token]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </UIProvider>
    </ColorModeProvider>
  )
}
