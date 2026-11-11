import { ColorModeProvider, ColorModeScript, GlobalStyles, UIProvider } from 'enchase'
import 'enchase/styles.css'
import 'enchase/theme.css'

import { StyledComponentsRegistry } from './registry'

import type { ReactNode } from 'react'

export default function FlatLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorModeScript />
      </head>
      <body>
        <ColorModeProvider theme={{ shape: 'soft' }}>
          <GlobalStyles />
          <StyledComponentsRegistry>
            <UIProvider>{children}</UIProvider>
          </StyledComponentsRegistry>
        </ColorModeProvider>
      </body>
    </html>
  )
}
