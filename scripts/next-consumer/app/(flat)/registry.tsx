'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { useState } from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

import type { ReactNode } from 'react'

export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement()

    sheet.instance.clearTag()

    return <>{styles}</>
  })

  if (typeof window !== 'undefined') return <>{children}</>

  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>
}
