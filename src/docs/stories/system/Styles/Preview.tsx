import { Accordion, Alert, Badge, Breadcrumbs, Button, Card, Checkbox, ColorModeProvider, Input, NumberInput, Pagination, RadioGroup, Select, Switch, Table, Tabs, Textarea, UIProvider, useColorMode } from 'enchase'
import { createTheme } from 'enchase/theme'

import { storyStyles } from '../../../shared/styles.ts'

import type { ThemeInput } from 'enchase/theme'
import type { PreviewProps } from './types.ts'

const inputOf = ({ style, brand, shape }: PreviewProps): ThemeInput => ({ style: storyStyles[style], ...(brand === '' ? {} : { brand }), ...(shape === '' ? {} : { shape }) })

const readTheme = (input: ThemeInput) => {
  try {
    return { theme: createTheme(input), error: null }
  } catch (error) {
    return { theme: null, error: error instanceof Error ? error.message : String(error) }
  }
}

const countries = [
  { value: 'br', label: 'Brazil' },
  { value: 'pt', label: 'Portugal' }
]

const orders = [
  { id: '#1001', status: 'Paid', total: '$120.00' },
  { id: '#1002', status: 'Pending', total: '$80.00' }
]

export const Preview = (props: PreviewProps) => {
  const { resolvedMode } = useColorMode()
  const input = inputOf(props)
  const { theme, error } = readTheme(input)
  const labelPlacement = props.labelPlacement === '' ? undefined : props.labelPlacement

  if (theme === null) return <p role="alert">{error}</p>

  return (
    <ColorModeProvider mode={resolvedMode} theme={input} storage={null}>
      <UIProvider>
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
            <Input label="Email" placeholder="ada@example.com" helperText="We never share your email." labelPlacement={labelPlacement} />
            <Input label="Password" type="password" defaultValue="secret" error="Use at least 8 characters." labelPlacement={labelPlacement} />
            <NumberInput label="Quantity" defaultValue={3} min={0} labelPlacement={labelPlacement} />
            <Select label="Country" options={countries} defaultValue="br" labelPlacement={labelPlacement} />
            <Textarea label="Message" placeholder="Tell us what happened" labelPlacement={labelPlacement} />
            <Input label="Disabled" defaultValue="Read-only" disabled labelPlacement={labelPlacement} />
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <Checkbox label="I accept the terms" defaultChecked />
              <Checkbox label="Receive updates" />
              <Checkbox label="Disabled" disabled />
            </div>
            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <Switch label="Notifications" defaultChecked />
              <Switch label="Airplane mode" />
              <Switch label="Disabled" disabled />
            </div>
            <RadioGroup label="Plan" defaultValue="pro" options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }, { value: 'team', label: 'Team', disabled: true }]} />
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(['info', 'success', 'warning', 'error'] as const).map((variant) => (
              <Alert key={variant} variant={variant} title={`Alert ${variant}`} onClose={() => undefined}>
                Status message of type {variant}.
              </Alert>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
            {(['default', 'elevated', 'outlined'] as const).map((variant) => (
              <Card key={variant} variant={variant}>
                <p style={{ margin: 0 }}>{`Card ${variant}`}</p>
              </Card>
            ))}
          </div>

          <Tabs ariaLabel="Sections" items={[{ value: 'a', label: 'Account', content: <p style={{ margin: 0 }}>Account details</p> }, { value: 'b', label: 'Password', content: <p style={{ margin: 0 }}>Change password</p> }, { value: 'c', label: 'Team', content: null, disabled: true }]} />

          <Accordion
            defaultValue={['a']}
            items={[
              { value: 'a', title: 'Is it accessible?', content: <p style={{ margin: 0 }}>Yes, it follows the WAI-ARIA pattern.</p> },
              { value: 'b', title: 'Can I change the look?', content: <p style={{ margin: 0 }}>Yes, with createTheme({'{ style }'}).</p> }
            ]}
          />

          <Breadcrumbs
            items={[
              { id: 'home', label: 'Home', href: '/' },
              { id: 'docs', label: 'Documents', href: '/docs' },
              { id: 'now', label: 'Current' }
            ]}
          />

          <Pagination pageCount={9} defaultPage={4} />

          <Table
            caption="Orders"
            columns={[
              { key: 'id', header: 'Order', rowHeader: true },
              { key: 'status', header: 'Status' },
              { key: 'total', header: 'Total', align: 'end' }
            ]}
            rows={orders}
          />

          <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <caption style={{ textAlign: 'start', paddingBlockEnd: '0.5rem' }}>Theme values</caption>
            <tbody>
              <tr>
                <th scope="row" style={{ textAlign: 'start', paddingInlineEnd: '1.5rem', fontWeight: 500 }}>
                  Control height (md)
                </th>
                <td>{theme.base.control.height.md}</td>
              </tr>
              <tr>
                <th scope="row" style={{ textAlign: 'start', paddingInlineEnd: '1.5rem', fontWeight: 500 }}>
                  Button radius
                </th>
                <td>{theme.base.borderRadius.button}</td>
              </tr>
              <tr>
                <th scope="row" style={{ textAlign: 'start', paddingInlineEnd: '1.5rem', fontWeight: 500 }}>
                  Field label
                </th>
                <td>{theme.defaults?.labelPlacement ?? 'floating'}</td>
              </tr>
              <tr>
                <th scope="row" style={{ textAlign: 'start', paddingInlineEnd: '1.5rem', fontWeight: 500 }}>
                  CSS hooks defined
                </th>
                <td>{Object.keys({ ...theme.hooks, ...theme.light.hooks }).length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UIProvider>
    </ColorModeProvider>
  )
}
