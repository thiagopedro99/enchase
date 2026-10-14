import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'
import { GlobalStyles } from '@styles/react.tsx'
import Home from '@pages/home/index.tsx'

const App = () => (
  <ColorModeProvider>
    <GlobalStyles />
    <UIProvider locale={ptBR}>
      <ToastProvider>
        <Home />
      </ToastProvider>
    </UIProvider>
  </ColorModeProvider>
)

export default App
