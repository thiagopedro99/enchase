import { Accordion, Alert, Badge, Breadcrumbs, Button, Card, Checkbox, ColorModeProvider, Input, NumberInput, Pagination, RadioGroup, Select, Switch, Table, Tabs, Textarea, UIProvider, useColorMode } from 'enchase'
import { createTheme } from 'enchase/theme'
import { ptBR } from 'enchase/locales'

import type { ThemeInput } from 'enchase/theme'
import type { PreviewProps } from './types.ts'

const inputOf = ({ style, brand, shape }: PreviewProps): ThemeInput => ({ style, ...(brand === '' ? {} : { brand }), ...(shape === '' ? {} : { shape }) })

const readTheme = (input: ThemeInput) => {
  try {
    return { theme: createTheme(input), error: null }
  } catch (error) {
    return { theme: null, error: error instanceof Error ? error.message : String(error) }
  }
}

const countries = [
  { value: 'br', label: 'Brasil' },
  { value: 'pt', label: 'Portugal' }
]

const orders = [
  { id: '#1001', status: 'Pago', total: 'R$ 120,00' },
  { id: '#1002', status: 'Pendente', total: 'R$ 80,00' }
]

export const Preview = (props: PreviewProps) => {
  const { resolvedMode } = useColorMode()
  const input = inputOf(props)
  const { theme, error } = readTheme(input)
  const labelPlacement = props.labelPlacement === '' ? undefined : props.labelPlacement

  if (theme === null) return <p role="alert">{error}</p>

  return (
    <ColorModeProvider mode={resolvedMode} theme={input} storage={null}>
      <UIProvider locale={ptBR}>
        <div style={{ display: 'grid', gap: '1.5rem', padding: '1.5rem', maxInlineSize: '48rem', borderRadius: 'var(--enchase-radius-xl)', background: 'var(--enchase-color-background)', color: 'var(--enchase-color-text-primary)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {(['neutral', 'primary', 'success', 'warning', 'error', 'info'] as const).map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem', alignItems: 'start' }}>
            <Input label="E-mail" placeholder="voce@exemplo.com" helperText="Nunca compartilhamos o seu e-mail." labelPlacement={labelPlacement} />
            <Input label="Senha" type="password" defaultValue="segredo" error="Use pelo menos 8 caracteres." labelPlacement={labelPlacement} />
            <NumberInput label="Quantidade" defaultValue={3} min={0} labelPlacement={labelPlacement} />
            <Select label="País" options={countries} defaultValue="br" labelPlacement={labelPlacement} />
            <Textarea label="Mensagem" placeholder="Conte o que aconteceu" labelPlacement={labelPlacement} />
            <Input label="Desabilitado" defaultValue="Somente leitura" disabled labelPlacement={labelPlacement} />
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <Checkbox label="Aceito os termos" defaultChecked />
              <Checkbox label="Receber novidades" />
              <Checkbox label="Desabilitado" disabled />
            </div>
            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <Switch label="Notificações" defaultChecked />
              <Switch label="Modo avião" />
              <Switch label="Desabilitado" disabled />
            </div>
            <RadioGroup label="Plano" defaultValue="pro" options={[{ value: 'free', label: 'Grátis' }, { value: 'pro', label: 'Pro' }, { value: 'team', label: 'Equipe', disabled: true }]} />
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(['info', 'success', 'warning', 'error'] as const).map((variant) => (
              <Alert key={variant} variant={variant} title={`Alerta ${variant}`} onClose={() => undefined}>
                Mensagem de status do tipo {variant}.
              </Alert>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
            {(['default', 'elevated', 'outlined'] as const).map((variant) => (
              <Card key={variant} variant={variant}>
                <p style={{ margin: 0 }}>{`Cartão ${variant}`}</p>
              </Card>
            ))}
          </div>

          <Tabs ariaLabel="Seções" items={[{ value: 'a', label: 'Conta', content: <p style={{ margin: 0 }}>Dados da conta</p> }, { value: 'b', label: 'Senha', content: <p style={{ margin: 0 }}>Troca de senha</p> }, { value: 'c', label: 'Equipe', content: null, disabled: true }]} />

          <Accordion
            defaultValue={['a']}
            items={[
              { value: 'a', title: 'É acessível?', content: <p style={{ margin: 0 }}>Sim, segue o padrão WAI-ARIA.</p> },
              { value: 'b', title: 'Dá para trocar o visual?', content: <p style={{ margin: 0 }}>Sim, com createTheme({'{ style }'}).</p> }
            ]}
          />

          <Breadcrumbs
            items={[
              { id: 'home', label: 'Início', href: '/' },
              { id: 'docs', label: 'Documentos', href: '/docs' },
              { id: 'now', label: 'Atual' }
            ]}
          />

          <Pagination pageCount={9} defaultPage={4} />

          <Table
            caption="Pedidos"
            columns={[
              { key: 'id', header: 'Pedido', rowHeader: true },
              { key: 'status', header: 'Status' },
              { key: 'total', header: 'Total', align: 'end' }
            ]}
            rows={orders}
          />

          <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <caption style={{ textAlign: 'start', paddingBlockEnd: '0.5rem' }}>Valores do tema</caption>
            <tbody>
              <tr>
                <th scope="row" style={{ textAlign: 'start', paddingInlineEnd: '1.5rem', fontWeight: 500 }}>
                  Altura do controle (md)
                </th>
                <td>{theme.base.control.height.md}</td>
              </tr>
              <tr>
                <th scope="row" style={{ textAlign: 'start', paddingInlineEnd: '1.5rem', fontWeight: 500 }}>
                  Raio do botão
                </th>
                <td>{theme.base.borderRadius.button}</td>
              </tr>
              <tr>
                <th scope="row" style={{ textAlign: 'start', paddingInlineEnd: '1.5rem', fontWeight: 500 }}>
                  Rótulo dos campos
                </th>
                <td>{theme.defaults?.labelPlacement ?? 'floating'}</td>
              </tr>
              <tr>
                <th scope="row" style={{ textAlign: 'start', paddingInlineEnd: '1.5rem', fontWeight: 500 }}>
                  Ganchos de CSS definidos
                </th>
                <td>{Object.keys(theme.hooks ?? {}).length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UIProvider>
    </ColorModeProvider>
  )
}
