import { Link } from 'enchase'

import { ClickProbe } from '@docs/shared/components/ClickProbe.tsx'
import { hrefCases } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Link',
  component: Link,
  args: {
    href: '/sobre',
    children: 'Sobre'
  },
  argTypes: {
    href: {
      description: 'Destino do link. Uma rota do app (`/sobre`, `/sobre#equipe`) vai para o `navigate` do `UIProvider` quando ele existe. Âncoras (`#id`), o hash da página atual, URLs externas, `mailto:` e `tel:` ficam com o navegador, assim como Ctrl, Cmd, Shift e o botão do meio.',
      control: 'text'
    },
    native: {
      description: 'Deixa o clique com o navegador mesmo em uma rota do app. Use em rotas que pertencem a outro app, como a documentação publicada no mesmo domínio.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    target: {
      description: 'Com `_blank` (ou qualquer valor diferente de `_self`) o navegador abre o destino e o `navigate` não é chamado. Com `_blank`, o `rel` padrão é `noopener noreferrer`.',
      control: 'inline-radio',
      options: ['_self', '_blank']
    },
    download: {
      description: 'Qualquer valor, inclusive vazio, faz o navegador baixar o arquivo em vez de navegar. Texto vira o nome do arquivo.',
      control: 'text'
    },
    rel: {
      description: 'Relação do link. Sem valor, `target="_blank"` usa `noopener noreferrer`.',
      control: 'text'
    },
    onClick: {
      description: 'Roda antes do tratamento do clique. Se chamar `preventDefault`, o `navigate` não é chamado.',
      control: false
    },
    className: {
      description: 'Classe do elemento (`data-slot="link"`), que vence o estilo da biblioteca.',
      control: 'text'
    },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'Link de texto que passa pelo `navigate` do `UIProvider` quando o destino é uma rota do app, sem depender de um roteador. Sem `navigate`, é um `<a href>` comum. A story "Quem trata cada href" mostra cada caso.'
      }
    }
  },
  render: (args) => (
    <ClickProbe>
      <Link {...args} />
    </ClickProbe>
  )
} satisfies Meta<typeof Link>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WhoHandlesEachHref: Story = {
  name: 'Quem trata cada href',
  parameters: { controls: { disable: true } },
  render: () => (
    <ClickProbe currentHref="/docs">
      <ul style={{ display: 'grid', gap: '0.75rem', margin: 0, paddingInlineStart: '1.25rem' }}>
        {hrefCases.map(({ id, outcome, ...link }) => (
          <li key={id}>
            <Link {...link}>{link.href}</Link>
            <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>{outcome}</div>
          </li>
        ))}
      </ul>
    </ClickProbe>
  )
}
