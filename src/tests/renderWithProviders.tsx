import { render } from '@testing-library/react'
import { vi } from 'vitest'

import { ptBR } from '@locales/ptBR.ts'
import { ColorModeProvider } from '@components/colorMode/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'

import type { RenderWithProvidersOptions } from './types.ts'
import type { ReactElement } from 'react'

export const renderWithProviders = (ui: ReactElement, { theme = 'light', route = '/', navigate = vi.fn(), motion, labels, locale = ptBR, toasts = false }: RenderWithProvidersOptions = {}) => ({
  ...render(
    <ColorModeProvider defaultMode={theme} storage={null}>
      <UIProvider motion={motion} locale={locale} labels={labels} navigate={navigate} currentHref={route}>
        {toasts ? <ToastProvider>{ui}</ToastProvider> : ui}
      </UIProvider>
    </ColorModeProvider>
  ),
  navigate
})
