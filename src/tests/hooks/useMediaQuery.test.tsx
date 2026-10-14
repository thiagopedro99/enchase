import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useIsClient } from '@hooks/useIsClient.ts'
import { useMediaQuery } from '@hooks/useMediaQuery.ts'
import { setViewportWidth } from '@tests/viewport.ts'

afterEach(() => setViewportWidth(1024))

const Probe = ({ query, server }: { query: string; server?: boolean }) => <span>{String(useMediaQuery(query, server))}</span>

describe('useMediaQuery', () => {
  it('reads the browser value on the client', () => {
    setViewportWidth(1200)

    expect(renderHook(() => useMediaQuery('(min-width: 1000px)')).result.current).toBe(true)
    expect(renderHook(() => useMediaQuery('(min-width: 1400px)')).result.current).toBe(false)
  })

  it('answers with the server value when rendered to a string', () => {
    expect(renderToString(<Probe query="(min-width: 1px)" />)).toContain('false')
    expect(renderToString(<Probe query="(min-width: 1px)" server />)).toContain('true')
  })
})

describe('useIsClient', () => {
  it('is false on the server and true on the client', () => {
    const Client = () => <span>{String(useIsClient())}</span>

    expect(renderToString(<Client />)).toContain('false')
    expect(renderHook(() => useIsClient()).result.current).toBe(true)
  })
})
