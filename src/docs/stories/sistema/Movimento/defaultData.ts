import { spring } from 'enchase/theme'

import type { SidebarSection } from 'enchase'
import type { MotionStoryArgs, VariableRow } from './types.ts'

export const defaultArgs: MotionStoryArgs = {
  preset: 'standard',
  mode: 'auto',
  baseDuration: 250,
  distance: 32,
  gentleDuration: 0.5,
  snappyBounce: 0.15,
  bouncyBounce: 0.35
}

export const presets = ['off', 'subtle', 'standard', 'expressive'] as const

export const modes = ['auto', 'never'] as const

export const buildMotionTheme = ({ baseDuration, distance, gentleDuration, snappyBounce, bouncyBounce }: MotionStoryArgs) => ({
  motion: {
    duration: {
      fast: `${Math.round(baseDuration * 0.6)}ms`,
      base: `${baseDuration}ms`,
      slow: `${Math.round(baseDuration * 1.2)}ms`
    },
    distance: { xs: `${Math.max(1, Math.round(distance / 16))}px`, sm: `${Math.round(distance * 0.375)}px`, md: `${distance}px` },
    spring: {
      gentle: spring({ duration: gentleDuration }).easing,
      snappy: spring({ duration: 0.35, bounce: snappyBounce }).easing,
      bouncy: spring({ duration: 0.5, bounce: bouncyBounce }).easing
    }
  }
})

export const menuSections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Aplicação',
    items: [
      { id: 'home', label: 'Início', href: '/' },
      { id: 'components', label: 'Componentes', href: '/components' },
      { id: 'docs', label: 'Documentação', href: '/docs' },
      { id: 'api', label: 'API', href: '/api' },
      { id: 'about', label: 'Sobre', href: '/about' }
    ]
  }
]

export const toastSteps = [
  { message: 'Primeira notificação (2 s)', duration: 2000, type: 'info' },
  { message: 'Segunda notificação (4 s)', duration: 4000, type: 'success' },
  { message: 'Terceira notificação (6 s)', duration: 6000, type: 'warning' }
] as const

export const reducedMotionInstructions = [
  'Abra as ferramentas do desenvolvedor (F12).',
  'Abra o menu de comandos (Ctrl+Shift+P) e procure "Rendering".',
  'Em "Emulate CSS media feature prefers-reduced-motion", escolha "reduce".',
  'Dispare as demonstrações de novo: o deslocamento e a escala somem, o fade continua.'
].join('\n')

export const variableRows: VariableRow[] = [
  { component: 'modal', variables: '-duration, -exit-duration, -distance, -dx, -dy, -scale, -ease (mola gentle na entrada), -fade-ease, -exit-ease' },
  {
    component: 'sidebar (recolher e drawer)',
    variables:
      '-duration, -exit-duration, -distance, -dx, -dy, -ease, -label-duration, -width, -width-collapsed, -item-duration, -item-scale, -indicator-duration, -stagger, -item-offset'
  },
  { component: 'navbar (drawer)', variables: '-duration, -exit-duration, -distance, -dx, -dy, -ease, -stagger, -item-offset' },
  { component: 'toast', variables: '-duration, -exit-duration, -distance, -dx, -dy, -ease (mola snappy na entrada e no reflow), -fade-ease, -exit-ease, -lifetime' },
  { component: 'tooltip', variables: '-duration, -scale, -ease (o segundo tooltip aberto em até 300 ms entra sem animação e sem atraso)' },
  { component: 'button (e theme-toggle)', variables: '-duration, -scale (press), -distance (lift), -ease' },
  { component: 'card', variables: '-duration, -distance (lift), -ease' },
  { component: 'loading', variables: '-duration (volta do spinner), -ease' },
  { component: 'skeleton', variables: '-duration (brilho), -ease' },
  { component: 'checkbox', variables: '-duration, -scale (marca), -ease' },
  { component: 'input, select, link, breadcrumbs, footer, app-bar', variables: '-duration, -ease' },
  { component: 'icon-swap', variables: '-duration, -ease, -rotate' }
]
