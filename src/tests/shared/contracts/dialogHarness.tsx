import { useState } from 'react'

import type { ControlledDialogProps } from './types.ts'

export const ControlledDialog = ({ children, triggerLabel = 'Open' }: ControlledDialogProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>{triggerLabel}</button>
      <main>
        <p>Page content</p>
      </main>
      {children({ open, close: () => setOpen(false) })}
    </>
  )
}
