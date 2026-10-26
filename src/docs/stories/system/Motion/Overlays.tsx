import { useState } from 'react'
import { Button, Modal, Navbar, Popover, Sidebar, Tooltip, UIProvider, useToast } from 'enchase'

import { Demo } from './Demo.tsx'
import { menuSections, toastSteps } from './defaultData.ts'

export const ModalDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <Demo title="Modal" hint="Enters with the pop recipe and the gentle spring; exits faster. Esc closes it.">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit profile">
        The panel emerges from the center with a 0.96 scale and a fade.
      </Modal>
    </Demo>
  )
}

export const TooltipDemo = () => (
  <Demo title="Tooltip" hint="Move the mouse from one button to the other: the second one opens without animating.">
    <Tooltip text="Save changes" position="top">
      <Button variant="outline">Save</Button>
    </Tooltip>
    <Tooltip text="Discard changes" position="top">
      <Button variant="outline">Discard</Button>
    </Tooltip>
  </Demo>
)

export const ToastDemo = () => {
  const toast = useToast()

  const addAll = () => toastSteps.forEach((step) => toast.addToast(step.message, step.type, step.duration))

  return (
    <Demo title="Toast" hint="Toasts enter with the slide recipe and the snappy spring. When one goes away, the others rearrange smoothly.">
      <Button onClick={addAll}>Add three</Button>
      <Button variant="outline" onClick={() => toast.error('Something went wrong', 5000)}>
        Error
      </Button>
    </Demo>
  )
}

export const PopoverDemo = () => (
  <Demo title="Popover" hint="Grows from the trigger with the snappy spring.">
    <Popover label="Details" content={<div style={{ padding: '0.25rem 0.5rem' }}>Three items, delivery on Friday.</div>}>
      <Button variant="outline">Open popover</Button>
    </Popover>
  </Demo>
)

export const SidebarDrawerDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <Demo title="Sidebar drawer" hint="Slides in from the start edge, and the items enter in a 30 ms cascade.">
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Sidebar variant="modal" open={open} onClose={() => setOpen(false)} sections={menuSections} ariaLabel="Demo menu" />
    </Demo>
  )
}

export const NavbarDrawerDemo = () => (
  <Demo title="Navbar drawer" hint="The Navbar stays compact in this demo to show the mobile menu.">
    <UIProvider breakpoints={{ xxl: '100000px' }}>
      <div style={{ inlineSize: '100%' }}>
        <Navbar logo="Enchase" sections={menuSections} breakpoint="xxl" />
      </div>
    </UIProvider>
  </Demo>
)
