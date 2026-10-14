import { Writable } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { hydrationCases, withProviders } from './cases.tsx'

import type { ReactNode } from 'react'

const stream = (tree: ReactNode) =>
  new Promise<{ html: string; errors: unknown[] }>((resolve, reject) => {
    const chunks: string[] = []
    const errors: unknown[] = []
    const sink = new Writable({
      write(chunk, _encoding, done) {
        chunks.push(chunk.toString())
        done()
      }
    })

    sink.on('finish', () => resolve({ html: chunks.join(''), errors }))

    const { pipe } = renderToPipeableStream(tree, {
      onAllReady: () => pipe(sink),
      onShellError: reject,
      onError: (error) => errors.push(error)
    })
  })

describe('streaming server render', () => {
  for (const hydrationCase of hydrationCases) {
    it(`${hydrationCase.name} streams to html without errors`, async () => {
      const { html, errors } = await stream(withProviders(hydrationCase))

      expect(errors).toEqual([])
      expect(html.length).toBeGreaterThan(0)
    })
  }
})
