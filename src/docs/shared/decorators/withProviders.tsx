import { ColorModeProvider, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import { ptBR } from 'enchase/locales'
import { enchase } from 'enchase/styles'

import { storyStyles } from '../styles.ts'

import type { Decorator } from '@storybook/react-vite'
import type { ThemeInput } from 'enchase/theme'

const themes: Record<string, ThemeInput | undefined> = Object.fromEntries(Object.entries(storyStyles).map(([name, style]) => [name, style === enchase ? undefined : { style }]))

export const withProviders: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light'
  const motion = context.globals.motion === 'never' ? 'never' : 'auto'

  return (
    <ColorModeProvider mode={theme} theme={themes[String(context.globals.style)]}>
      <GlobalStyles />
      <UIProvider locale={ptBR} motion={{ mode: motion }}>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  )
}
