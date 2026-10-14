import { render } from '@testing-library/react'
import { vi } from 'vitest'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'

import type { RenderWithProvidersOptions } from './types.ts'
import type { ReactElement } from 'react'

export const renderWithProviders = (ui: ReactElement, { theme = 'light', route = '/', navigate = vi.fn(), motion, labels }: RenderWithProvidersOptions = {}) => ({
  ...render(
    <ColorModeProvider defaultMode={theme} storage={null}>
      <UIProvider motion={motion} labels={labels} navigate={navigate} currentHref={route}>
        <ToastProvider>{ui}</ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  ),
  navigate
})
