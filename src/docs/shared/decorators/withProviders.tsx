import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'
import { GlobalStyles } from '@styles/react.tsx'
import { ptBR } from '@locales/ptBR.ts'
import UIProvider from '@components/uiProvider/index.tsx'

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
