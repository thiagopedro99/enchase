'use client'

import { useState } from 'react'
import { Button, Modal, useBreakpoint, useColorMode, useToast } from 'enchase'

export default function Counter() {
  const [open, setOpen] = useState(false)
  const { resolvedMode } = useColorMode()
  const { current } = useBreakpoint()
  const toast = useToast()

  return (
    <div>
      <p data-testid="state">{`${resolvedMode} ${current}`}</p>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Button onClick={() => toast.success('Saved')}>Toast</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Title">
        Body
      </Modal>
    </div>
  )
}
