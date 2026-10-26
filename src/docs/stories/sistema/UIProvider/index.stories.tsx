import { Fragment } from 'react'
import { Link, UIProvider, useUIConfig } from 'enchase'
import { en, ptBR } from 'enchase/locales'

import { ClickReport } from '@docs/shared/components/ClickProbe.tsx'
import { configMeanings, linkCases } from './defaultData.ts'

import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const headingStyle: CSSProperties = { margin: 0, fontWeight: 600 }

const meaningStyle: CSSProperties = { margin: 0, fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }

const Inspector = () => {
  const { dir, labels, breakpoints, motion } = useUIConfig()
  const rows = [
    ['dir', dir, configMeanings.dir],
    ['labels.closeModal', labels.closeModal, configMeanings.closeModal],
    ['breakpoints.md', breakpoints.md, configMeanings.breakpoint],
    ['motion', `${motion.mode} / ${motion.preset}`, configMeanings.motion]
  ]

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <p style={headingStyle}>O que os componentes recebem do UIProvider (useUIConfig)</p>
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: '0.25rem 1rem', margin: 0 }}>
        {rows.map(([name, value, meaning]) => (
          <Fragment key={name}>
            <dt>{name}</dt>
            <dd style={{ margin: 0 }}>{value}</dd>
            <dd style={meaningStyle}>{meaning}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  )
}

const Links = () => (
  <div style={{ display: 'grid', gap: '0.5rem' }}>
    <p style={headingStyle}>navigate e currentHref: quem trata o clique em cada link</p>
    <ul style={{ display: 'grid', gap: '0.5rem', margin: 0, paddingInlineStart: '1.25rem' }}>
      {linkCases.map(({ href, outcome }) => (
        <li key={href}>
          <Link href={href}>{href}</Link>
          <div style={meaningStyle}>{outcome}</div>
        </li>
      ))}
    </ul>
  </div>
)

const meta = {
  title: 'System/UIProvider',
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
        <Links />
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
