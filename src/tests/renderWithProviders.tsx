import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ToastProvider } from '@components/toast/index.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { themes } from '@styles/themes/index.ts'

import type { RenderWithProvidersOptions } from './types.ts'
import type { ReactElement } from 'react'

export const renderWithProviders = (ui: ReactElement, { theme = 'light', route = '/', motion, labels }: RenderWithProvidersOptions = {}) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider theme={themes[theme]}>
        <UIProvider motion={motion} labels={labels}>
          <ToastProvider>{ui}</ToastProvider>
        </UIProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
