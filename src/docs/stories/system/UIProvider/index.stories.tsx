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
      <p style={headingStyle}>What the components receive from the UIProvider (useUIConfig)</p>
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
    <p style={headingStyle}>navigate and currentHref: who handles the click on each link</p>
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
      description: 'The app. The components read the configuration of the nearest `UIProvider`; without one, the defaults apply.',
      control: false
    },
    motion: {
      description: 'Motion of all the components: `{ mode, preset, recipes }`. With `mode`, `"auto"` respects `prefers-reduced-motion` and `"never"` turns off all motion. `preset` scales the duration and the distance: `"off"`, `"subtle"`, `"standard"` or `"expressive"`. `recipes` adjusts `fade`, `pop`, `slide`, `press`, `lift`, `resize`, `spin` and `shimmer`, as in `{ slide: { distance: 48 } }`.',
      control: 'object',
      table: { type: { summary: '{ mode?, preset?, recipes? }' }, defaultValue: { summary: "{ mode: 'auto', preset: 'standard' }" } }
    },
    locale: {
      description: 'Language, in the format `{ locale, dir, messages }`, such as `ptBR` and `en` from `enchase/locales`. It sets the accessibility texts of the components and the direction (`ltr` or `rtl`) they use. The `locale` tag also decides how dates and numbers are written: a malformed tag, or one that the `Intl` of the environment does not know, falls back to `en` with no error. The `dir` of the `<html>` is still up to the app.',
      control: false,
      table: { defaultValue: { summary: 'en' } }
    },
    labels: {
      description: 'Replaces individual texts of the locale, such as `{ closeModal: "Dismiss" }`.',
      control: 'object'
    },
    breakpoints: {
      description: 'Width of each breakpoint (`xs`, `sm`, `md`, `lg`, `xl` and `xxl`), in any CSS width value, such as `{ md: "1000px" }`. They apply to `Container`, `Layout`, `Navbar`, `Sidebar` and `useBreakpoint`.',
      control: 'object',
      table: { defaultValue: { summary: "{ xs: '0px', sm: '576px', md: '768px', lg: '992px', xl: '1200px', xxl: '1400px' }" } }
    },
    navigate: {
      description: 'Called with the `href` when there is a plain click on an app route (an `href` that starts with `/`). Connect it to your router, as in `(href) => router.push(href)`. Without it, the links reload the page.',
      control: false
    },
    currentHref: {
      description: 'Current path of the app. It marks the active item of the menus (`aria-current="page"`), derives the `Breadcrumbs` of the `Layout` and makes a link with a hash to its own page (`/docs#props`) scroll without going through the `navigate`. Without it, the hash is compared with the URL of the browser.',
      control: 'text'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Configuration shared by all the components: language and texts, breakpoints, motion and navigation (`navigate` and `currentHref`). It is optional: without it, the components use English, the Bootstrap 5 breakpoints, automatic motion and links that reload the page.'
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
  args: { labels: { closeModal: 'Dismiss' } }
}

export const CustomBreakpoints: Story = {
  args: { breakpoints: { md: '1000px' } }
}

export const NoMotion: Story = {
  args: { motion: { mode: 'never' } }
}
