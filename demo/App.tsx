import { ColorModeProvider, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import { ptBR } from 'enchase/locales'

import Home from './pages/home/index.tsx'

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
