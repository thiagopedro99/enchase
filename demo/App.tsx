import { ColorModeProvider, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import { useMemo, useState } from 'react'
import { ptBR } from 'enchase/locales'

import { defaultLook, themeOf } from './pages/landing/defaultData.ts'
import Sugestoes from './pages/sugestoes/index.tsx'
import Novidades from './pages/novidades/index.tsx'
import Landing from './pages/landing/index.tsx'
import { navigate, usePath } from './router.ts'
import { routes } from './defaultData.ts'

const App = () => {
  const [look, setLook] = useState(defaultLook)
  const theme = useMemo(() => themeOf(look), [look])
  const path = usePath()

  return (
    <ColorModeProvider theme={theme}>
      <GlobalStyles />
      <UIProvider locale={ptBR} currentHref={path} navigate={navigate}>
        <ToastProvider>
          {path === routes.news && <Novidades />}
          {path === routes.suggestions && <Sugestoes />}
          {path !== routes.news && path !== routes.suggestions && <Landing look={look} onLookChange={setLook} />}
        </ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  )
}

export default App
