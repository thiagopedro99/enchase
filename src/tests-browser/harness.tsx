import { render } from '@testing-library/react'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { GlobalStyles } from '@styles/react.tsx'
import { ptBR } from '@locales/ptBR.ts'

import type { ThemeInput } from '@styles/theme/createTheme.ts'
import type { ReactElement } from 'react'

export const renderInBrowser = (ui: ReactElement, motion: 'auto' | 'never' = 'never', mode: 'light' | 'dark' = 'light', theme?: ThemeInput) =>
  render(
    <ColorModeProvider defaultMode={mode} storage={null} theme={theme}>
      <GlobalStyles />
      <UIProvider locale={ptBR} motion={{ mode: motion }} navigate={() => undefined} currentHref="/">
        <ToastProvider>{ui}</ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  )
