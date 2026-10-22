import { ColorModeProvider, ColorModeScript, GlobalStyles, UIProvider } from 'enchase'
import { shadcn } from 'enchase/styles'
import 'enchase/styles.layer.css'
import 'enchase/theme.css'

import type { ReactNode } from 'react'

export default function StyledLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorModeScript />
      </head>
      <body>
        <ColorModeProvider cssLayer="enchase-theme" theme={{ style: shadcn, brand: '#0B6BCB' }}>
          <GlobalStyles />
          <UIProvider>{children}</UIProvider>
        </ColorModeProvider>
      </body>
    </html>
  )
}
