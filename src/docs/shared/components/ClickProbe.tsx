import { useState } from 'react'
import { UIProvider, useUIConfig } from 'enchase'

import type { MouseEvent, ReactNode } from 'react'

type ClickReportProps = { children: ReactNode }

type ClickProbeProps = ClickReportProps & { currentHref?: string }

const idleMessage = 'Clique em um link para ver quem trata o clique.'

export const ClickReport = ({ children }: ClickReportProps) => {
  const [message, setMessage] = useState(idleMessage)

  const report = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as Element).closest('a')
    if (!anchor) return

    setMessage(`${anchor.getAttribute('href')}: ${event.defaultPrevented ? 'navigate do UIProvider' : 'navegador'}`)
    event.preventDefault()
  }

  return (
    <div onClick={report} style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      {children}
      <output style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>{message}</output>
    </div>
  )
}

export const ClickProbe = ({ currentHref = '/docs', children }: ClickProbeProps) => {
  const { labels, motion } = useUIConfig()

  return (
    <UIProvider labels={labels} motion={motion} navigate={() => undefined} currentHref={currentHref}>
      <ClickReport>{children}</ClickReport>
    </UIProvider>
  )
}
