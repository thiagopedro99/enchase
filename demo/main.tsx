import { createRoot } from 'react-dom/client'
import '@fontsource-variable/figtree'
import { StrictMode } from 'react'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)