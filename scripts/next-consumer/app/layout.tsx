import { ColorModeProvider, ColorModeScript, GlobalStyles, UIProvider } from 'enchase'
import 'enchase/styles.css'

import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorModeScript />
      </head>
      <body>
        <ColorModeProvider cssLayer="enchase-theme">
          <GlobalStyles />
          <UIProvider>{children}</UIProvider>
        </ColorModeProvider>
      </body>
    </html>
  )
}
