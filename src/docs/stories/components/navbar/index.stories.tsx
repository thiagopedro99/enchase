import { useEffect, useRef } from 'react'
import { Button, Icon, Navbar } from 'enchase'

import type { SidebarSection } from 'enchase'
import type { NavbarProps } from 'enchase'
import type { Meta, StoryObj } from '@storybook/react-vite'

const sections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Início', href: '/' },
      { id: 'docs', label: 'Documentação', href: '/docs' },
      { id: 'api', label: 'API', href: '/api' }
    ]
  }
]

const cards = ['Primeiro', 'Segundo', 'Terceiro', 'Quarto', 'Quinto', 'Sexto']

const vivid = 'linear-gradient(160deg, var(--enchase-color-primary), var(--enchase-color-error) 35%, var(--enchase-color-warning) 65%, var(--enchase-color-success))'

const BehindTheBar = (props: NavbarProps) => {
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 100 })
  }, [])

  return (
    <div ref={scroller} style={{ blockSize: '28rem', overflowY: 'auto', background: vivid }}>
      <Navbar {...props} />
      <div style={{ display: 'grid', gap: '1rem', padding: '1rem' }}>
        {cards.map((name) => (
          <div key={name} style={{ minBlockSize: '8rem', padding: '1rem', borderRadius: 'var(--enchase-radius-lg)', backgroundColor: 'var(--enchase-color-surface)', color: 'var(--enchase-color-text-primary)' }}>
            <strong>{name} quadro</strong>
            <p style={{ margin: 0 }}>Role este quadro: a cor e as bordas que passam por baixo da barra aparecem desfocadas, sem tirar a leitura do menu.</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Componentes/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Barra de navegação no topo, com a marca, os links, ações e o botão de tema. Abaixo do breakpoint, os links vão para um drawer. Com `translucent`, o fundo fica semitransparente e desfoca o que rola por baixo, e volta ao fundo opaco quando o sistema pede menos transparência ou mais contraste, em cores forçadas e em navegadores sem `backdrop-filter`.'
      }
    }
  },
  args: { logo: 'Enchase', sections },
  argTypes: {
    logo: { description: 'Marca exibida à esquerda (ou à direita em rtl). Aceita texto ou qualquer nó React, como uma imagem ou um SVG. É um link para logoHref (data-slot="navbar-logo").', control: 'text' },
    logoHref: { description: 'Destino do link da marca. Aceita uma rota, uma âncora (#inicio) ou uma URL.', control: 'text', table: { defaultValue: { summary: '/' } } },
    breakpoint: {
      description: 'Breakpoint a partir do qual os links aparecem na barra. Abaixo dele, a barra mostra o botão de menu e os links vão para o drawer. Os valores vêm do UIProvider.',
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl'],
      table: { defaultValue: { summary: 'md' } }
    },
    sections: {
      description: 'Itens do menu, no mesmo formato da Sidebar: [{ id, items: [{ id, label, href }] }]. Só os itens com href aparecem, e os títulos das seções não são exibidos.',
      control: false
    },
    activeSectionId: {
      description: 'Id do item de âncora (href #id, ou /pagina#id na página atual) marcado como localização atual (aria-current="location"). Use useScrollSpy para obtê-lo.',
      control: 'text'
    },
    actions: {
      description:
        'Ações ao lado do menu, como um botão de chamada. Em telas largas ficam na barra, entre o menu e o botão de tema (data-slot="navbar-cta"). Em telas estreitas vão para o drawer, abaixo dos links (data-slot="navbar-drawer-cta"), e um clique em um link dentro delas fecha o drawer. O nó é renderizado em um lugar por vez.',
      control: false
    },
    translucent: {
      description:
        'Deixa o fundo da barra semitransparente, com desfoque do que passa por trás. O fundo vem de `--enchase-navbar-background` (padrão: a cor `--enchase-navbar-background-solid`, que é a `surfaceContainer` do tema, a `--enchase-navbar-background-alpha`, 0,8) e o desfoque de `--enchase-navbar-blur` (padrão `12px`), que você muda no `style` ou no CSS. Com `prefers-reduced-transparency: reduce`, `prefers-contrast: more`, cores forçadas ou sem `backdrop-filter`, o fundo é opaco. Com o tema padrão, o texto da marca e do menu mantém 4,5:1 mesmo sobre preto ou branco puro (3:1 na cor de destaque da marca ao passar o mouse); confira o contraste se mudar a cor ou o tema.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    className: {
      description: 'Classe do cabeçalho (`data-slot="navbar"`). As partes seguem `data-slot="navbar-*"`; o drawer mobile é `navbar-drawer`, com `data-state`.',
      control: 'text'
    },
    style: { description: 'Estilo do cabeçalho.', control: false }
  }
} satisfies Meta<typeof Navbar>

export default meta

type Story = StoryObj<typeof meta>

export const Padrao: Story = {}

export const ComAcao: Story = {
  args: { actions: <Button variant="primary">Começar</Button> }
}

export const LogoComImagem: Story = {
  args: {
    logo: (
      <>
        <Icon size={28}>
          <path d="M12 3 3 8v8l9 5 9-5V8z" />
        </Icon>{' '}
        Enchase
      </>
    ),
    logoHref: '#inicio'
  }
}

export const Translucida: Story = {
  args: { translucent: true, actions: <Button variant="primary">Começar</Button> },
  parameters: { docs: { description: { story: 'O quadro já está rolado: o fundo colorido e as bordas dos cards passam por trás da barra, que os desfoca e deixa a cor aparecer.' } } },
  render: (args) => <BehindTheBar {...args} />
}

export const TranslucidaPersonalizada: Story = {
  args: { translucent: true, style: { '--enchase-navbar-background': 'color-mix(in srgb, var(--enchase-color-primary-container) 55%, transparent)', '--enchase-navbar-blur': '24px' } as NavbarProps['style'] },
  parameters: { docs: { description: { story: 'A cor do fundo e o raio do desfoque pelas variáveis `--enchase-navbar-background` e `--enchase-navbar-blur`, aqui no `style` da barra.' } } },
  render: (args) => <BehindTheBar {...args} />
}
