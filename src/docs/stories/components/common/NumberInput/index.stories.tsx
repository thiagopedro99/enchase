import { useState } from 'react'
import { Button, NumberInput } from 'enchase'
import { defaultFullWidth, defaultStep, defaultSteppers, defaultValue } from './defaultData.ts'

import type { FormEvent } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [quantity, setQuantity] = useState<number | null>(3)

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <NumberInput label="Quantidade" min={1} max={20} value={quantity} onValueChange={setQuantity} />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Button size="sm" variant="outline" onClick={() => setQuantity(10)}>
          Definir 10
        </Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Valor: {quantity === null ? 'vazio' : quantity}</span>
      </div>
    </div>
  )
}

const FormDemo = () => {
  const [sent, setSent] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(String(new FormData(event.currentTarget).get('price')))
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <NumberInput label="Preço" name="price" defaultValue={1234.5} formatOptions={{ style: 'currency', currency: 'BRL' }} />
      <Button type="submit" size="sm">
        Enviar
      </Button>
      <span style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>{sent ? `price=${sent}` : 'Nada enviado'}</span>
    </form>
  )
}

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  args: {
    label: 'Quantidade',
    defaultValue: 3,
    min: 0,
    max: 99,
    step: defaultStep,
    fullWidth: defaultFullWidth,
    steppers: defaultSteppers,
    disabled: false,
    readOnly: false
  },
  parameters: {
    docs: {
      description: {
        component:
          'Campo para digitar um número, com rótulo, mensagem de erro, texto de ajuda e botões para diminuir e aumentar. É um `<input type="text">` com `role="spinbutton"` e teclado numérico no celular, em vez de `type="number"`: o texto segue o idioma do `UIProvider` (vírgula decimal e ponto de milhar em pt-BR), aceita moeda e porcentagem por `formatOptions`, e o valor sai como `number`, ou `null` com o campo vazio. As setas mudam o valor por `step`; Shift com as setas e Page Up e Page Down, por `largeStep`; Home e End vão ao `min` e ao `max`. O valor é confirmado ao sair do campo ou com Enter, limitado ao intervalo e arredondado às casas do formato. Com `name`, o número vai para o formulário num campo oculto, sem a formatação da tela. Os botões ficam fora da ordem do Tab, porque o teclado já tem as setas, e seus nomes vêm de `labels.increaseValue` e `labels.decreaseValue` do `UIProvider`. Aceita `ref`, que vai para o `<input>`, e os atributos dele.'
      }
    }
  },
  argTypes: {
    value: {
      description: 'Valor quando o componente é controlado; `null` é o campo vazio. Exige também onValueChange. Veja a story Controlled.',
      control: false
    },
    defaultValue: {
      description: 'Valor inicial, para uso sem controle externo. `null` começa com o campo vazio.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultValue) } }
    },
    onValueChange: {
      description: 'Chamada com o número confirmado, ou `null` se o campo ficou vazio. Acontece ao sair do campo, com Enter, com as setas e com os botões, nunca a cada tecla digitada.',
      control: false
    },
    min: {
      description: 'Menor valor aceito. O que for digitado abaixo dele volta ao mínimo ao sair do campo, o botão de diminuir se desativa nele e Home vai até ele. Com `min` de zero ou mais, o sinal de menos não é aceito. No iPhone o teclado numérico não tem o sinal de menos: para aceitar negativos, passe `inputMode="text"`.',
      control: 'number'
    },
    max: {
      description: 'Maior valor aceito. O que for digitado acima dele volta ao máximo ao sair do campo, o botão de aumentar se desativa nele e End vai até ele.',
      control: 'number'
    },
    step: {
      description: 'Quanto o valor muda com as setas e com os botões. Os passos contam a partir de `min` (ou de 0), e as casas decimais do passo entram no formato. Um valor que não seja positivo vale 1.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultStep) } }
    },
    largeStep: {
      description: 'Passo grande, de Shift com as setas e de Page Up e Page Down. Sem ele, vale dez vezes o `step`.',
      control: 'number'
    },
    formatOptions: {
      description:
        'Formato do número, como no `Intl.NumberFormat`: `style` (`decimal`, `currency` ou `percent`), `currency` (código como `BRL`), `currencyDisplay`, `minimumFractionDigits`, `maximumFractionDigits` e `useGrouping`. O idioma vem do `UIProvider`. Sem `maximumFractionDigits`, valem as casas do estilo (3 no decimal, 2 na moeda, 0 no percentual) ou as que o `step` pedir. No percentual o valor é a fração: 0,15 aparece como 15%, e o `step` costuma ser 0,01.',
      control: false,
      table: { type: { summary: 'NumberInputFormat' } }
    },
    label: {
      description: 'Rótulo do campo, associado ao input para leitores de tela.',
      control: 'text'
    },
    labelPlacement: {
      description: 'Onde fica o rótulo: floating (dentro do campo, sobe para o contorno ao focar ou preencher) ou stacked (acima do controle, sem entalhe no contorno). Sem a prop, vale o style do tema (createTheme): floating no padrão e stacked no shadcn.',
      control: 'inline-radio',
      options: ['floating', 'stacked'],
      table: { defaultValue: { summary: "'floating'" } }
    },
    helperText: {
      description: 'Texto de ajuda. Fica ligado ao campo por aria-describedby e some quando há erro.',
      control: 'text'
    },
    error: {
      description: 'Mensagem de erro. Marca o campo como inválido (aria-invalid) e é anunciada como alerta.',
      control: 'text'
    },
    fullWidth: {
      description: 'Ocupa toda a largura disponível.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultFullWidth) } }
    },
    steppers: {
      description: 'Mostra os botões de diminuir e aumentar, e o aviso por voz do novo valor quando um deles é usado. Sem eles, o teclado continua com as setas.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultSteppers) } }
    },
    name: {
      description: 'Nome do campo no formulário. O número vai num campo oculto, como `1234.5`, e o texto da tela não é enviado.',
      control: 'text'
    },
    placeholder: {
      description: 'Texto de exemplo exibido quando o campo está vazio. Com rótulo, ele só aparece com o foco.',
      control: 'text'
    },
    disabled: {
      description: 'Desativa o campo e os botões.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    readOnly: {
      description: 'Deixa o valor só para leitura: não se digita, as setas não mudam o valor e os botões ficam desativados.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    wrapperClassName: {
      description: 'Classe da raiz (data-slot="number-input"). className e style continuam no input (data-slot="number-input-field").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Estilo da raiz (data-slot="number-input"). style continua no input.',
      control: false
    }
  }
} satisfies Meta<typeof NumberInput>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithHelperText: Story = {
  args: { helperText: 'De 0 a 99 unidades' }
}

export const WithError: Story = {
  args: { error: 'Informe uma quantidade de pelo menos 1', defaultValue: 0 }
}

export const Decimals: Story = {
  args: { label: 'Nota', defaultValue: 7.5, min: 0, max: 10, step: 0.1 }
}

export const Currency: Story = {
  args: { label: 'Preço', defaultValue: 1234.5, min: 0, max: undefined, step: 0.5, formatOptions: { style: 'currency', currency: 'BRL' } }
}

export const Percent: Story = {
  args: { label: 'Desconto', defaultValue: 0.15, min: 0, max: 1, step: 0.01, formatOptions: { style: 'percent' } }
}

export const Integers: Story = {
  args: { label: 'Pessoas', defaultValue: 2, min: 1, max: 10, formatOptions: { maximumFractionDigits: 0 }, helperText: 'Digite só inteiros' }
}

export const Negative: Story = {
  args: { label: 'Temperatura', defaultValue: -4, min: -30, max: 50, inputMode: 'text', formatOptions: { maximumFractionDigits: 0 } }
}

export const WithoutSteppers: Story = {
  args: { steppers: false }
}

export const Empty: Story = {
  args: { defaultValue: null, placeholder: 'Quantas?' }
}

export const Disabled: Story = {
  args: { disabled: true }
}

export const ReadOnly: Story = {
  args: { readOnly: true }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}

export const InAForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FormDemo />
}

export const LabelAbove: Story = {
  args: { labelPlacement: 'stacked' }
}
