import { Link, UIProvider, useUIConfig } from 'enchase'
import { en, ptBR } from 'enchase/locales'

import { ClickReport } from '@docs/shared/components/ClickProbe.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'

const Inspector = () => {
  const { dir, labels, breakpoints, motion } = useUIConfig()

  return (
    <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 1rem', margin: 0 }}>
      <dt>dir</dt>
      <dd style={{ margin: 0 }}>{dir}</dd>
      <dt>labels.closeModal</dt>
      <dd style={{ margin: 0 }}>{labels.closeModal}</dd>
      <dt>breakpoints.md</dt>
      <dd style={{ margin: 0 }}>{breakpoints.md}</dd>
      <dt>motion</dt>
      <dd style={{ margin: 0 }}>{`${motion.mode} / ${motion.preset}`}</dd>
    </dl>
  )
}

const meta = {
  title: 'Sistema/UIProvider',
  component: UIProvider,
  args: { children: undefined, currentHref: '/docs' },
  argTypes: {
    children: {
      description: 'A aplicação. Os componentes leem a configuração do UIProvider mais próximo; sem nenhum, valem os padrões.',
      control: false
    },
    motion: {
      description: 'Movimento de todos os componentes: { mode, preset, recipes }. mode "auto" respeita prefers-reduced-motion e "never" desliga todo o movimento. preset escala a duração e a distância: "off", "subtle", "standard" ou "expressive". recipes ajusta fade, pop, slide, press, lift, resize, spin e shimmer, como { slide: { distance: 48 } }.',
      control: 'object',
      table: { type: { summary: '{ mode?, preset?, recipes? }' }, defaultValue: { summary: "{ mode: 'auto', preset: 'standard' }" } }
    },
    locale: {
      description: 'Idioma, no formato { locale, dir, messages }, como o ptBR e o en de enchase/locales. Define os textos de acessibilidade dos componentes e a direção (ltr ou rtl) que eles usam. O `dir` do `<html>` continua sendo do app.',
      control: false,
      table: { defaultValue: { summary: 'en' } }
    },
    labels: {
      description: 'Troca textos avulsos, como { closeModal: "Dispensar" }, sobre os do locale.',
      control: 'object'
    },
    breakpoints: {
      description: 'Largura de cada breakpoint (xs, sm, md, lg, xl e xxl) em qualquer valor CSS de largura, como { md: "1000px" }. Valem para Container, Layout, Navbar, Sidebar e useBreakpoint.',
      control: 'object',
      table: { defaultValue: { summary: "{ xs: '0px', sm: '576px', md: '768px', lg: '992px', xl: '1200px', xxl: '1400px' }" } }
    },
    navigate: {
      description: 'Chamado com o href quando há um clique simples em uma rota do app (um href que começa com /). Ligue ao seu roteador, como (href) => router.push(href). Sem ele, os links recarregam a página.',
      control: false
    },
    currentHref: {
      description: 'Caminho atual do app. Marca o item ativo dos menus (aria-current="page"), deriva os Breadcrumbs do Layout e faz um link com hash para a própria página (/docs#props) rolar sem passar pelo navigate. Sem ele, o hash é comparado com a URL do navegador.',
      control: 'text'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Configuração compartilhada por todos os componentes: idioma e textos, breakpoints, movimento e navegação (navigate e currentHref). É opcional: sem ele, os componentes usam inglês, os breakpoints do Bootstrap 5, movimento automático e links que recarregam a página.'
      }
    }
  },
  render: (args) => (
    <UIProvider {...args} navigate={() => undefined}>
      <ClickReport>
        <Inspector />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/sobre">/sobre</Link>
          <Link href="/docs#props">/docs#props</Link>
          <Link href="https://example.com">https://example.com</Link>
        </div>
      </ClickReport>
    </UIProvider>
  )
} satisfies Meta<typeof UIProvider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Portuguese: Story = {
  args: { locale: ptBR }
}

export const RightToLeft: Story = {
  args: { locale: { ...en, dir: 'rtl' } }
}

export const CustomLabels: Story = {
  args: { locale: ptBR, labels: { closeModal: 'Dispensar' } }
}

export const CustomBreakpoints: Story = {
  args: { breakpoints: { md: '1000px' } }
}

export const NoMotion: Story = {
  args: { motion: { mode: 'never' } }
}
