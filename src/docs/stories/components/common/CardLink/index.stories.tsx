import { Badge, CardLink, Grid } from 'enchase'

import { ClickProbe } from '@docs/shared/components/ClickProbe.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'

const projects = [
  ['Enchase', 'Biblioteca de componentes em React', '/projects/enchase'],
  ['Painel de métricas', 'Gráficos e tabelas em tempo real', '/projects/metrics'],
  ['Loja de exemplo', 'Carrinho, pagamento e pedidos', '/projects/shop']
]

const content = (title: string, text: string) => (
  <>
    <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
    <p style={{ margin: '0.25rem 0 0', color: 'var(--enchase-color-text-secondary)' }}>{text}</p>
  </>
)

const meta = {
  title: 'Componentes/CardLink',
  component: CardLink,
  args: {
    href: '/projects/enchase',
    variant: 'outlined',
    children: content('Enchase', 'Biblioteca de componentes em React')
  },
  parameters: {
    docs: {
      description: {
        component:
          'Cartão inteiro clicável que leva a outra página: um `<a href>` de verdade, com a superfície do `Card` (`variant`, `padding` e `animation`, e os mesmos ganchos `--enchase-card-*`), anel de foco e camadas de hover e de pressionado. Passa pelo `navigate` do `UIProvider` nas rotas do app, como o `Link` (veja `native`, `target` e `download`). Com `target="_blank"`, o `rel` vira `noopener noreferrer` e o texto "abre em nova aba" entra no nome acessível, sem ícone: o desenho do cartão é seu. Tudo o que está dentro do cartão entra no nome do link, então prefira um título curto e um apoio curto. O conteúdo de um `<a>` aceita títulos e parágrafos, mas não outro link ou botão. Para uma ação, use `CardButton`.'
      }
    }
  },
  argTypes: {
    href: {
      description: 'Destino do link, com as mesmas regras do `Link`: uma rota do app vai para o `navigate` do `UIProvider`; âncoras, o hash da página atual e URLs externas ficam com o navegador.',
      control: 'text'
    },
    variant: {
      description: 'Aparência da superfície, a mesma do `Card`. Só a `elevated` sobe ao passar o ponteiro.',
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      table: { defaultValue: { summary: 'default' } }
    },
    padding: {
      description: 'Espaçamento interno (qualquer valor CSS), como no `Card`. Sem ele vale o espaçamento padrão, que a classe de quem usa sempre vence.',
      control: 'text'
    },
    animation: {
      description: 'false desliga o movimento. { tuning: { duration, distance } } ajusta o lift da variante `elevated` (segundos e pixels). O lift só roda com ponteiro fino e sem preferência de movimento reduzido.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'lift' } }
    },
    native: {
      description: 'Deixa o clique com o navegador mesmo em uma rota do app.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    target: {
      description: 'Com `_blank`, abre em nova aba e acrescenta o texto "abre em nova aba" para leitores de tela. O `rel` padrão passa a ser `noopener noreferrer`.',
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
    onClick: {
      description: 'Roda antes do tratamento do clique. Se chamar `preventDefault`, o `navigate` não é chamado.',
      control: false
    },
    className: {
      description: 'Classe do link (`data-slot="card-link"`). Também dá para estilizar por `data-variant` e `data-motion`.',
      control: 'text'
    },
    children: { control: false },
    style: { control: false }
  },
  render: (args) => (
    <ClickProbe>
      <div style={{ inlineSize: 'min(24rem, 100%)' }}>
        <CardLink {...args} />
      </div>
    </ClickProbe>
  )
} satisfies Meta<typeof CardLink>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Elevated: Story = {
  args: { variant: 'elevated' }
}

export const OpensInNewTab: Story = {
  args: { href: 'https://github.com/thiagopedro99/enchase', target: '_blank', children: content('Código no GitHub', 'Abre o repositório') }
}

export const WithBadge: Story = {
  args: {
    children: (
      <>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>
          Enchase <Badge variant="success">Novo</Badge>
        </h3>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--enchase-color-text-secondary)' }}>Biblioteca de componentes em React</p>
      </>
    )
  }
}

export const ProjectList: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Uma lista de projetos de verdade: o `Grid` é um `ul`, cada cartão fica num `li` e ocupa a altura da linha, mesmo quando os textos têm tamanhos diferentes. Sem `role` na mão e sem CSS repetido.'
      }
    }
  },
  render: () => (
    <ClickProbe>
      <Grid as="ul" columns={{ xs: 1, md: 3 }} aria-label="Projetos">
        {projects.map(([title, text, href], index) => (
          <li key={href}>
            <CardLink href={href} variant={index === 0 ? 'elevated' : 'outlined'}>
              {content(title, text)}
            </CardLink>
          </li>
        ))}
      </Grid>
    </ClickProbe>
  )
}
