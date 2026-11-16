import { useMemo, useState } from 'react'
import { ColorModeProvider, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import { ptBR } from 'enchase/locales'

import { defaultLook, landingPath, themeOf } from './pages/landing/defaultData.ts'
import Landing from './pages/landing/index.tsx'
import Home from './pages/home/index.tsx'

const landing = window.location.pathname.startsWith(landingPath)

const App = () => {
  const [look, setLook] = useState(defaultLook)
  const theme = useMemo(() => (landing ? themeOf(look) : undefined), [look])

  return (
    <ColorModeProvider theme={theme}>
      <GlobalStyles />
      <UIProvider locale={ptBR} currentHref={landing ? landingPath : '/'}>
        <ToastProvider>{landing ? <Landing look={look} onLookChange={setLook} /> : <Home />}</ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  )
}

export default App
