import { ButtonLink, Icon } from 'enchase'
import { defaultExternalIcon } from './defaultData.ts'

import { ClickProbe } from '@docs/shared/components/ClickProbe.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/ButtonLink',
  component: ButtonLink,
  args: {
    href: '/docs',
    children: 'Documentação',
    variant: 'primary',
    size: 'md',
    fullWidth: false
  },
  argTypes: {
    href: {
      description: 'Destino do link, com as mesmas regras do `Link`: uma rota do app vai para o `navigate` do `UIProvider`; âncoras, o hash da página atual e URLs externas ficam com o navegador.',
      control: 'text'
    },
    variant: {
      description: 'Estilo visual, o mesmo do `Button`.',
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      table: { defaultValue: { summary: 'primary' } }
    },
    size: {
      description: 'Tamanho, o mesmo do `Button`.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } }
    },
    fullWidth: {
      description: 'Ocupa toda a largura disponível.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    native: {
      description: 'Deixa o clique com o navegador mesmo em uma rota do app.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    externalIcon: {
      description: 'Com `target="_blank"`, mostra o ícone de link externo depois do conteúdo. `false` tira só o ícone (útil em um botão só de ícone) e mantém o texto "abre em nova aba" para leitores de tela; em um link só de ícone com `aria-label`, ponha o aviso no próprio rótulo.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultExternalIcon) } }
    },
    target: {
      description: 'Com `_blank`, abre em nova aba, mostra um ícone (veja `externalIcon`) e acrescenta o texto "abre em nova aba" para leitores de tela. O `rel` padrão passa a ser `noopener noreferrer`.',
      control: 'inline-radio',
      options: ['_self', '_blank']
    },
    download: {
      description: 'Qualquer valor, inclusive vazio, faz o navegador baixar o arquivo em vez de navegar.',
      control: 'text'
    },
    rel: {
      description: 'Relação do link. Sem valor, `target="_blank"` usa `noopener noreferrer`.',
      control: 'text'
    },
    animation: {
      description: 'Receita de motion do `Button`. Use false para desligar, ou { recipe, tuning } com press ou lift.',
      control: false,
      table: { type: { summary: 'false | { recipe, from, tuning }' }, defaultValue: { summary: 'press' } }
    },
    onClick: {
      description: 'Roda antes do tratamento do clique. Se chamar `preventDefault`, o `navigate` não é chamado.',
      control: false
    },
    className: {
      description: 'Classe do elemento (`data-slot="button-link"`), que vence o estilo da biblioteca.',
      control: 'text'
    },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'Link com a aparência de um `Button`. É um `<a href>` de verdade, e passa pelo `navigate` do `UIProvider` nas rotas do app, como o `Link`.'
      }
    }
  },
  render: (args) => (
    <ClickProbe>
      <ButtonLink {...args} />
    </ClickProbe>
  )
} satisfies Meta<typeof ButtonLink>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ClickProbe>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <ButtonLink href="/docs">Primário</ButtonLink>
        <ButtonLink href="/docs" variant="secondary">
          Secundário
        </ButtonLink>
        <ButtonLink href="/docs" variant="outline">
          Contorno
        </ButtonLink>
        <ButtonLink href="/docs" variant="ghost">
          Fantasma
        </ButtonLink>
      </div>
    </ClickProbe>
  )
}

export const OpensInNewTab: Story = {
  args: { href: 'https://github.com/thiagopedro99/enchase', target: '_blank', variant: 'outline', children: 'Repositório' }
}

export const IconOnly: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ClickProbe>
      <ButtonLink href="https://github.com/thiagopedro99/enchase" target="_blank" externalIcon={false} variant="outline" aria-label="Código no GitHub (abre em nova aba)">
        <Icon>
          <path d="M8 8l-4 4 4 4" />
          <path d="M16 8l4 4-4 4" />
          <path d="M14 5l-4 14" />
        </Icon>
      </ButtonLink>
    </ClickProbe>
  )
}
