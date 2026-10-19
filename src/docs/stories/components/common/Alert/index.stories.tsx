import { useState } from 'react'
import { Alert, Button, Icon } from 'enchase'
import { defaultVariant, variantTexts, variants } from './defaultData.ts'

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const DismissibleDemo = (args: ComponentProps<typeof Alert>) => {
  const [open, setOpen] = useState(true)

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Mostrar de novo
      </Button>
    )
  }

  return <Alert {...args} onClose={() => setOpen(false)} />
}

const meta = {
  title: 'Componentes/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Mensagem de status dentro da página, em quatro tipos (`info`, `success`, `warning` e `error`), com título, ícone e botão de fechar opcionais. Para avisos temporários que somem sozinhos, use as notificações (`useToast`). É um `<div>` e aceita os atributos dele.'
      }
    }
  },
  args: {
    children: variantTexts.info.message,
    title: variantTexts.info.title,
    variant: defaultVariant
  },
  argTypes: {
    children: {
      description: 'Mensagem do alerta. Aceita texto e outros elementos, como links.',
      control: 'text'
    },
    variant: {
      description: 'Tipo da mensagem: define a cor, o ícone e o papel ARIA. Só error usa role="alert" e é anunciado na hora; os outros usam role="status", que leitores de tela costumam não anunciar quando o alerta já aparece com o texto. Para um aviso inserido depois do carregamento da página e que precise ser lido, passe role="alert".',
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: `'${defaultVariant}'` } }
    },
    title: {
      description: 'Título em destaque, acima da mensagem.',
      control: 'text'
    },
    icon: {
      description: 'Ícone no lugar do padrão de cada tipo. Com null ou false, não mostra ícone. O ícone é decorativo (aria-hidden), então o texto precisa dizer tudo.',
      control: false
    },
    onClose: {
      description: 'Mostra o botão de fechar e é chamado ao clicar nele. O Alert não some sozinho: quem usa o remove. O nome do botão vem de labels.closeToast do UIProvider.',
      control: false
    }
  }
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {variants.map((variant) => (
        <Alert key={variant} variant={variant} title={variantTexts[variant].title}>
          {variantTexts[variant].message}
        </Alert>
      ))}
    </div>
  )
}

export const WithoutTitle: Story = {
  args: { title: undefined, variant: 'success', children: variantTexts.success.title }
}

export const Dismissible: Story = {
  args: { variant: 'warning', title: variantTexts.warning.title, children: variantTexts.warning.message },
  render: (args) => <DismissibleDemo {...args} />
}

export const WithAction: Story = {
  args: { variant: 'warning', title: variantTexts.warning.title },
  render: (args) => (
    <Alert {...args}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span>{variantTexts.warning.message}</span>
        <Button size="sm" variant="outline">
          Renovar agora
        </Button>
      </div>
    </Alert>
  )
}

export const CustomIcon: Story = {
  args: {
    variant: 'info',
    title: 'Dica',
    children: 'Use o atalho para abrir a busca.',
    icon: (
      <Icon size={20}>
        <path d="M12 3v1M5.6 5.6l.7.7M3 12h1M5.6 18.4l.7-.7M12 20v1M18.4 18.4l-.7-.7M20 12h1M18.4 5.6l-.7.7" />
        <circle cx="12" cy="12" r="4" />
      </Icon>
    )
  }
}

export const WithoutIcon: Story = {
  args: { icon: null }
}
