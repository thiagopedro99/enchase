import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import GlobalStyles from '@styles/globalStyles.ts'
import Router from '@routes/index.tsx'

const App = () => (
  <ColorModeProvider>
    <GlobalStyles />
    <UIProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </UIProvider>
  </ColorModeProvider>
)

export default App
