import { afterEach, describe, expect, it } from 'vitest'

import { Button } from '@components/common/Button/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'

let reset: HTMLStyleElement | undefined

afterEach(() => {
  reset?.remove()
  reset = undefined
})

describe('the cursor of a disabled control under the reset of a preflight', () => {
  it('keeps the cursor of a disabled button at default, and the cursor of a disabled input at not-allowed', () => {
    reset = document.createElement('style')
    reset.textContent = ':disabled { cursor: default; } button, [role="button"] { cursor: pointer; }'
    document.head.append(reset)

    renderInBrowser(
      <>
        <Button disabled>Save</Button>
        <Input label="Name" disabled />
      </>
    )

    expect(getComputedStyle(document.querySelector('button') as HTMLButtonElement).cursor).toBe('default')
    expect(getComputedStyle(document.querySelector('input') as HTMLInputElement).cursor).toBe('not-allowed')
  })
})
