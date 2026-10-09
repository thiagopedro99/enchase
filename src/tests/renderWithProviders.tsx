import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'
import RouterBridge from '@routes/RouterBridge.tsx'

import type { RenderWithProvidersOptions } from './types.ts'
import type { ReactElement } from 'react'

export const renderWithProviders = (ui: ReactElement, { theme = 'light', route = '/', motion, labels }: RenderWithProvidersOptions = {}) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <ColorModeProvider defaultMode={theme} storage={null}>
        <RouterBridge motion={motion} labels={labels}>
          <ToastProvider>{ui}</ToastProvider>
        </RouterBridge>
      </ColorModeProvider>
    </MemoryRouter>
  )
