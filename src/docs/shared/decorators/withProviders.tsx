import { ColorModeProvider, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import { ptBR } from 'enchase/locales'

import type { Decorator } from '@storybook/react-vite'

export const withProviders: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light'
  const motion = context.globals.motion === 'never' ? 'never' : 'auto'

  return (
    <ColorModeProvider mode={theme}>
      <GlobalStyles />
      <UIProvider locale={ptBR} motion={{ mode: motion }}>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  )
}
