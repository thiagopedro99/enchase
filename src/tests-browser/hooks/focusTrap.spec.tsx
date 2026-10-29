import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Popover } from '@components/common/Popover/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'

const where = () => {
  const active = document.activeElement

  return active?.getAttribute('data-testid') ?? active?.getAttribute('data-slot') ?? active?.tagName.toLowerCase() ?? 'none'
}

const walk = async (steps: number, shift = false) => {
  const seen = [where()]

  for (let step = 0; step < steps; step += 1) {
    await userEvent.tab({ shift })
    seen.push(where())
  }

  return seen
}

const ModalWithAwkwardContent = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Título">
        <form>
          <input type="hidden" name="token" value="x" />
          <button type="button" data-testid="a">
            A
          </button>
          <div contentEditable suppressContentEditableWarning role="textbox" aria-label="Texto rico" data-testid="editable">
            Editar
          </div>
          <details>
            <summary data-testid="summary">Mais</summary>
            <button type="button" data-testid="in-closed-details">
              Dentro
            </button>
          </details>
          <fieldset disabled>
            <button type="button" data-testid="in-disabled-fieldset">
              Desabilitado
            </button>
          </fieldset>
          <button type="button" data-testid="b">
            B
          </button>
          <button type="button" data-testid="css-hidden" style={{ display: 'none' }}>
            Escondido
          </button>
        </form>
      </Modal>
    </>
  )
}

const openModal = async () => {
  renderInBrowser(<ModalWithAwkwardContent />)
  await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
  await expect.element(page.getByRole('dialog')).toBeVisible()
}

describe('the Tab trap of a dialog in a real browser', () => {
  it('starts on the close button and walks every control that can take focus, in order, wrapping at the end', async () => {
    await openModal()

    expect(await walk(6)).toEqual(['modal-close', 'a', 'editable', 'summary', 'b', 'modal-close', 'a'])
  })

  it('walks the same controls backwards and wraps at the start', async () => {
    await openModal()

    expect(await walk(5, true)).toEqual(['modal-close', 'b', 'summary', 'editable', 'a', 'modal-close'])
  })

  it('never gets stuck on a control when the next one is a hidden input or hidden by css', async () => {
    await openModal()
    const seen = await walk(14)

    expect(new Set(seen)).toEqual(new Set(['modal-close', 'a', 'editable', 'summary', 'b']))
  })

  it('leaves out what a browser would not focus: a hidden input, display none, a closed details and a disabled fieldset', async () => {
    await openModal()
    const seen = await walk(12)

    expect(seen).not.toContain('in-closed-details')
    expect(seen).not.toContain('in-disabled-fieldset')
    expect(seen).not.toContain('css-hidden')
    expect(seen).not.toContain('input')
  })

  it('reaches a contenteditable region and a summary, which the old selector skipped', async () => {
    await openModal()
    const seen = await walk(5)

    expect(seen).toContain('editable')
    expect(seen).toContain('summary')
  })
})

describe('the Popover focus helpers in a real browser', () => {
  it('moves focus into the first visible control of the content when it opens by keyboard', async () => {
    renderInBrowser(
      <Popover
        content={
          <div>
            <button type="button" data-testid="hidden-first" style={{ display: 'none' }}>
              Escondido
            </button>
            <button type="button" data-testid="first-visible">
              Visível
            </button>
          </div>
        }
      >
        <button>Abrir</button>
      </Popover>
    )
    page.getByRole('button', { name: 'Abrir' }).element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => where()).toBe('first-visible')
  })
})
