import type { SidebarSection } from 'enchase'
import type { MotionStoryArgs, VariableRow } from './types.ts'

export const defaultArgs: MotionStoryArgs = {
  preset: 'standard',
  mode: 'auto',
  baseDuration: 250,
  distance: 32,
  gentleDuration: 300,
  snappyDuration: 300,
  snappyBounce: 0.15,
  bouncyDuration: 400,
  bouncyBounce: 0.3
}

export const presets = ['off', 'subtle', 'standard', 'expressive'] as const

export const modes = ['auto', 'never'] as const

export const buildMotionTheme = ({ baseDuration, distance, gentleDuration, snappyDuration, snappyBounce, bouncyDuration, bouncyBounce }: MotionStoryArgs) => ({
  motion: {
    duration: {
      fast: `${Math.round(baseDuration * 0.6)}ms`,
      base: `${baseDuration}ms`,
      slow: `${Math.round(baseDuration * 1.2)}ms`
    },
    distance: { xs: `${Math.max(1, Math.round(distance / 16))}px`, sm: `${Math.round(distance * 0.375)}px`, md: `${distance}px` },
    spring: {
      gentle: { duration: `${gentleDuration}ms` },
      snappy: { duration: `${snappyDuration}ms`, bounce: snappyBounce },
      bouncy: { duration: `${bouncyDuration}ms`, bounce: bouncyBounce }
    }
  }
})

export const menuSections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Application',
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'components', label: 'Components', href: '/components' },
      { id: 'docs', label: 'Documentation', href: '/docs' },
      { id: 'api', label: 'API', href: '/api' },
      { id: 'about', label: 'About', href: '/about' }
    ]
  }
]

export const toastSteps = [
  { message: 'First notification (2 s)', duration: 2000, type: 'info' },
  { message: 'Second notification (4 s)', duration: 4000, type: 'success' },
  { message: 'Third notification (6 s)', duration: 6000, type: 'warning' }
] as const

export const reducedMotionInstructions = [
  'Open the developer tools (F12).',
  'Open the command menu (Ctrl+Shift+P) and search for "Rendering".',
  'Under "Emulate CSS media feature prefers-reduced-motion", choose "reduce".',
  'Trigger the demos again: the displacement and the scale go away, the fade stays.'
].join('\n')

export const variableRows: VariableRow[] = [
  { component: 'modal', variables: '-duration, -exit-duration, -distance, -dx, -dy, -scale, -ease (gentle spring on entry), -fade-ease, -exit-ease' },
  {
    component: 'sidebar (collapse and drawer)',
    variables:
      '-duration, -exit-duration, -distance, -dx, -dy, -ease, -label-duration, -width, -width-collapsed, -item-duration, -item-scale, -indicator-duration, -stagger, -item-offset'
  },
  { component: 'navbar (drawer)', variables: '-duration, -exit-duration, -distance, -dx, -dy, -ease, -stagger, -item-offset' },
  { component: 'toast', variables: '-duration, -exit-duration, -distance, -dx, -dy, -ease (snappy spring on entry and on reflow), -fade-ease, -exit-ease, -lifetime' },
  { component: 'tooltip', variables: '-duration, -scale, -ease (the second tooltip opened within 300 ms enters with no animation and no delay)' },
  { component: 'button (and theme-toggle)', variables: '-duration, -scale (press), -distance (lift), -ease' },
  { component: 'card', variables: '-duration, -distance (lift), -ease' },
  { component: 'loading', variables: '-duration (spinner turn), -ease' },
  { component: 'skeleton', variables: '-duration (shimmer), -ease' },
  { component: 'checkbox', variables: '-duration, -scale (check mark), -ease' },
  { component: 'input, select, link, breadcrumbs, footer, app-bar', variables: '-duration, -ease' },
  { component: 'icon-swap', variables: '-duration, -ease, -rotate' }
]
