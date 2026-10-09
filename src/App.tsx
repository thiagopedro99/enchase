import { BrowserRouter } from 'react-router-dom'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'
import { GlobalStyles } from '@styles/react.tsx'
import RouterBridge from '@routes/RouterBridge.tsx'
import Router from '@routes/index.tsx'

const App = () => (
  <BrowserRouter>
    <ColorModeProvider>
      <GlobalStyles />
      <RouterBridge>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </RouterBridge>
    </ColorModeProvider>
  </BrowserRouter>
)

export default App
