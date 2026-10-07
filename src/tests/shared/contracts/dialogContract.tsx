import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import type { DialogContractAdapter } from './types.ts'

const tabRounds = 8

export const describeDialogContract = (adapter: DialogContractAdapter) => {
  describe(`${adapter.name} · contrato de diálogo`, () => {
    beforeEach(() => {
      document.body.style.overflow = 'auto'
      adapter.before?.()
    })

    afterEach(() => adapter.after?.())

    const openDialog = async () => {
      const user = userEvent.setup()
      renderWithProviders(adapter.render(), adapter.options)
      const trigger = screen.getByRole('button', { name: adapter.triggerName })

      await user.click(trigger)
      const dialog = await screen.findByRole(adapter.role ?? 'dialog')

      return { user, trigger, dialog }
    }

    const closeWithEscape = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole(adapter.role ?? 'dialog')).not.toBeInTheDocument())
    }

    it('opens a modal dialog with an accessible name', async () => {
      const { dialog } = await openDialog()

      expect(dialog).toHaveAttribute('aria-modal', 'true')
      if (adapter.dialogName) expect(dialog).toHaveAccessibleName(adapter.dialogName)
      else expect(dialog).toHaveAccessibleName()
    })

    it('moves focus inside the dialog', async () => {
      const { dialog } = await openDialog()

      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    })

    it('keeps Tab navigation inside the dialog in both directions', async () => {
      const { user, dialog } = await openDialog()

      for (let round = 0; round < tabRounds; round += 1) {
        await user.tab()
        expect(dialog).toContainElement(document.activeElement as HTMLElement)
      }

      for (let round = 0; round < tabRounds; round += 1) {
        await user.tab({ shift: true })
        expect(dialog).toContainElement(document.activeElement as HTMLElement)
      }
    })

    it('closes with Escape and restores focus to the trigger', async () => {
      const { user, trigger } = await openDialog()

      await closeWithEscape(user)

      await waitFor(() => expect(trigger).toHaveFocus())
    })

    it('restores focus only after the page is no longer inert', async () => {
      const { user, trigger } = await openDialog()
      const inertAtFocus: boolean[] = []
      const originalFocus = trigger.focus.bind(trigger)
      trigger.focus = (options?: FocusOptions) => {
        inertAtFocus.push(trigger.closest('[inert]') !== null)
        originalFocus(options)
      }

      await closeWithEscape(user)

      await waitFor(() => expect(inertAtFocus).toEqual([false]))
    })

    it('makes the rest of the page inert while open and restores it on close', async () => {
      const { user, trigger, dialog } = await openDialog()

      expect(dialog.closest('[inert]')).toBeNull()
      expect(trigger.closest('[inert]')).not.toBeNull()

      await closeWithEscape(user)

      await waitFor(() => expect(trigger.closest('[inert]')).toBeNull())
    })

    it('locks the page scroll while open and restores it on close', async () => {
      const { user } = await openDialog()

      expect(document.body.style.overflow).toBe('hidden')

      await closeWithEscape(user)

      await waitFor(() => expect(document.body.style.overflow).toBe('auto'))
    })

    it('has no axe violations while open', async () => {
      const { dialog } = await openDialog()

      expect(await axe(dialog)).toHaveNoViolations()
    })
  })
}
