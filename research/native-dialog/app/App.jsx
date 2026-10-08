import { useState } from 'react'
import { Modal, PortalModal } from './Modal.jsx'

export const App = ({ variant, initialOpen }) => {
  const [open, setOpen] = useState(initialOpen)
  const [openB, setOpenB] = useState(false)
  const M = variant === 'portal' ? PortalModal : Modal
  return (
    <main>
      <button id="opener" onClick={() => setOpen(true)}>Open</button>
      <button id="outside">Outside</button>
      <M isOpen={open} onClose={() => setOpen(false)} label="A">
        <button id="inA" onClick={() => setOpenB(true)}>Open B</button>
        <M isOpen={openB} onClose={() => setOpenB(false)} label="B">
          <button id="inB">B</button>
        </M>
      </M>
    </main>
  )
}
