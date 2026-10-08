import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { vi } from 'vitest'

import type { ReactNode } from 'react'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

export const hydrateAndCollect = async (serverHtml: string, tree: ReactNode) => {
  const container = document.createElement('div')
  const problems: string[] = []
  const consoleError = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    problems.push(`console.error: ${String(args[0]).slice(0, 120)}`)
  })

  container.innerHTML = serverHtml
  document.body.append(container)

  let root: ReturnType<typeof hydrateRoot> | undefined

  try {
    await act(async () => {
      root = hydrateRoot(container, tree, { onRecoverableError: (error) => problems.push(`recoverable: ${String((error as Error).message).slice(0, 120)}`) })
    })
  } finally {
    await act(async () => root?.unmount())
    consoleError.mockRestore()
    container.remove()
  }

  return problems
}
