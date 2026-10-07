import { ThemeProvider } from 'styled-components'

import { ToastProvider } from '@components/toast/index.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import GlobalStyles from '@styles/globalStyles.ts'
import { useAppStore } from '@stores/app/index.ts'
import { themes } from '@styles/themes/index.ts'
import Router from '@routes/index.tsx'

const App = () => {
  const theme = useAppStore((state) => state.theme)
  const currentTheme = themes[theme]

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <UIProvider>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </UIProvider>
    </ThemeProvider>
  )
}

export default App