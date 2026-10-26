import { Alert, Badge, Button, Card, ColorModeProvider, Input, NumberInput, Pagination, RadioGroup, Select, Switch, Tabs, UIProvider, useColorMode } from 'enchase'
import { createTheme } from 'enchase/theme'
import { ptBR } from 'enchase/locales'

import { radiusTokens } from './defaultData.ts'

import type { ThemeInput } from 'enchase/theme'
import type { PreviewProps } from './types.ts'

const overridesOf = ({ buttonRadius, controlRadius, cardRadius }: PreviewProps) =>
  Object.fromEntries(
    [
      ['button', buttonRadius],
      ['control', controlRadius],
      ['xl', cardRadius]
    ].filter(([, value]) => value !== '')
  ) as NonNullable<ThemeInput['radius']>

const readTheme = (input: ThemeInput) => {
  try {
    return { theme: createTheme(input), error: null }
  } catch (error) {
    return { theme: null, error: error instanceof Error ? error.message : String(error) }
  }
}

export const Preview = (props: PreviewProps) => {
  const { resolvedMode } = useColorMode()
  const input: ThemeInput = { shape: props.shape, radius: overridesOf(props) }
  const { theme, error } = readTheme(input)

  if (theme === null) return <p role="alert">{error}</p>

  return (
    <ColorModeProvider mode={resolvedMode} theme={input} storage={null}>
      <UIProvider locale={ptBR}>
        <div style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem', maxInlineSize: '44rem', borderRadius: 'var(--enchase-radius-xl)', background: 'var(--enchase-color-background)', color: 'var(--enchase-color-text-primary)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Badge variant="success">Pago</Badge>
            <Badge variant="primary">Novo</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
            <Input label="E-mail" placeholder="voce@exemplo.com" />
            <NumberInput label="Quantidade" defaultValue={3} min={0} />
            <Select label="País" placeholder="Escolha" options={[{ value: 'br', label: 'Brasil' }, { value: 'pt', label: 'Portugal' }]} />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Switch label="Notificações" defaultChecked />
            <RadioGroup label="Plano" defaultValue="pro" orientation="horizontal" options={[{ value: 'free', label: 'Grátis' }, { value: 'pro', label: 'Pro' }]} />
          </div>

          <Card variant="elevated">
            <p style={{ margin: 0 }}>Cartão com texto comum, para ver o canto da superfície.</p>
          </Card>

          <Alert variant="info" title="Aviso">
            O canto do alerta segue a escala do tema.
          </Alert>

          <Tabs ariaLabel="Seções" items={[{ value: 'a', label: 'Primeira', content: <p style={{ margin: 0 }}>Primeiro painel</p> }, { value: 'b', label: 'Segunda', content: <p style={{ margin: 0 }}>Segundo painel</p> }]} />

          <Pagination pageCount={9} defaultPage={4} />

          <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <caption style={{ textAlign: 'start', paddingBlockEnd: '0.5rem' }}>Raios do tema</caption>
            <tbody>
              {radiusTokens.map((token) => (
                <tr key={token}>
                  <th scope="row" style={{ textAlign: 'start', paddingInlineEnd: '1.5rem', fontWeight: 500 }}>
                    {token}
                  </th>
                  <td>{theme.base.borderRadius[token]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UIProvider>
    </ColorModeProvider>
  )
}
