import { ColorModeProvider, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import { useMemo, useState } from 'react'
import { ptBR } from 'enchase/locales'

import { defaultLook, themeOf } from './pages/landing/defaultData.ts'
import Landing from './pages/landing/index.tsx'

const App = () => {
  const [look, setLook] = useState(defaultLook)
  const theme = useMemo(() => themeOf(look), [look])

  return (
    <ColorModeProvider theme={theme}>
      <GlobalStyles />
      <UIProvider locale={ptBR} currentHref="/">
        <ToastProvider>
          <Landing look={look} onLookChange={setLook} />
        </ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  )
}

export default App
