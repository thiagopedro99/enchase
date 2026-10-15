import { useState } from 'react'
import { Button, Modal, Navbar, Popover, Sidebar, Tooltip, UIProvider, useToast } from 'enchase'

import { Demo } from './Demo.tsx'
import { menuSections, toastSteps } from './defaultData.ts'

export const ModalDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <Demo title="Modal" hint="Entra com pop e a mola gentle; sai mais rápido. Esc fecha.">
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Editar perfil">
        O painel nasce do centro com escala 0,96 e fade.
      </Modal>
    </Demo>
  )
}

export const TooltipDemo = () => (
  <Demo title="Tooltip" hint="Passe o mouse de um botão para o outro: o segundo abre sem animar.">
    <Tooltip text="Salvar alterações" position="top">
      <Button variant="outline">Salvar</Button>
    </Tooltip>
    <Tooltip text="Descartar alterações" position="top">
      <Button variant="outline">Descartar</Button>
    </Tooltip>
  </Demo>
)

export const ToastDemo = () => {
  const toast = useToast()

  const addAll = () => toastSteps.forEach((step) => toast.addToast(step.message, step.type, step.duration))

  return (
    <Demo title="Toast" hint="Entram com slide e a mola snappy. Quando um some, os outros reorganizam suavemente.">
      <Button onClick={addAll}>Adicionar três</Button>
      <Button variant="outline" onClick={() => toast.error('Algo deu errado', 5000)}>
        Erro
      </Button>
    </Demo>
  )
}

export const PopoverDemo = () => (
  <Demo title="Popover" hint="Cresce a partir do gatilho com a mola snappy.">
    <Popover label="Detalhes" content={<div style={{ padding: '0.25rem 0.5rem' }}>Três itens, entrega na sexta-feira.</div>}>
      <Button variant="outline">Abrir popover</Button>
    </Popover>
  </Demo>
)

export const SidebarDrawerDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <Demo title="Drawer da Sidebar" hint="Desliza pela borda inicial, os itens entram em cascata de 30 ms.">
      <Button onClick={() => setOpen(true)}>Abrir drawer</Button>
      <Sidebar variant="modal" open={open} onClose={() => setOpen(false)} sections={menuSections} ariaLabel="Menu de demonstração" />
    </Demo>
  )
}

export const NavbarDrawerDemo = () => (
  <Demo title="Drawer da Navbar" hint="A Navbar fica compacta nesta demonstração para mostrar o menu móvel.">
    <UIProvider breakpoints={{ xxl: '100000px' }}>
      <div style={{ inlineSize: '100%' }}>
        <Navbar logo="Enchase" sections={menuSections} breakpoint="xxl" />
      </div>
    </UIProvider>
  </Demo>
)
