import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, KeyboardEvent as ReactKeyboardEvent } from 'react'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { GlobalStyles } from '@styles/react.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { useOverlayLayer, getLayerCount } from '@hooks/overlayStack.ts'

declare global {
  interface Window {
    __log: string[]
  }
}

window.__log = []
;(window as unknown as { __layers: () => number }).__layers = () => getLayerCount()
const log = (s: string) => window.__log.push(s)
const params = new URLSearchParams(location.search)
const scene = params.get('scene') ?? 'modal'
const escMode = params.get('esc') ?? 'doc'
const focusOnOpen = params.get('focus') === '1'
const tabMode = params.get('tab') ?? 'native'
const tabbableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const tabbables = (root: ParentNode) => [...root.querySelectorAll<HTMLElement>(tabbableSelector)].filter((el) => !el.closest('[inert], [hidden]'))

const describe = (n: EventTarget | null) => {
  if (!(n instanceof Element)) return String(n)
  return n.id ? '#' + n.id : n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).split(' ')[0] : '')
}

const Popover = ({ label, children, width = 300, triggerId = 'pop-trigger', contentId }: { label: string; children: ReactNode; width?: number; triggerId?: string; contentId?: string }) => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useOverlayLayer(open && escMode === 'stack', {
    contains: (node) => Boolean(contentRef.current?.contains(node) || triggerRef.current?.contains(node)),
    onEscape: () => {
      log('popover:close:esc:stack:' + triggerId)
      setOpen(false)
      triggerRef.current?.focus()
    },
    onPointerDownOutside: (e) => {
      log('popover:close:outside:stack:' + triggerId + ':' + describe(e.target))
      setOpen(false)
    }
  })

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left })
  }, [open])

  useEffect(() => {
    if (!open || escMode === 'stack') return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (contentRef.current?.contains(t) || triggerRef.current?.contains(t)) return
      log('popover:close:outside:' + triggerId + ':' + describe(e.target))
      setOpen(false)
    }
    const onKeyDoc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      log('popover:close:esc:' + escMode + ':' + triggerId)
      if (escMode === 'docstop' || escMode === 'capture') e.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    if (escMode === 'doc' || escMode === 'docstop') document.addEventListener('keydown', onKeyDoc)
    if (escMode === 'capture') document.addEventListener('keydown', onKeyDoc, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDoc)
      document.removeEventListener('keydown', onKeyDoc, true)
    }
  }, [open])

  useEffect(() => {
    if (!open || tabMode !== 'preserve') return
    const onKey = (e: KeyboardEvent) => {
      const content = contentRef.current
      const trigger = triggerRef.current
      if (e.key !== 'Tab' || !content || !trigger) return
      const inside = tabbables(content)
      const outside = tabbables(document).filter((el) => !content.contains(el))
      const afterTrigger = outside[outside.indexOf(trigger) + 1] ?? outside[0]
      const active = document.activeElement
      if (!inside.length) return
      if (!e.shiftKey && active === trigger) {
        e.preventDefault()
        inside[0].focus()
      } else if (e.shiftKey && active === inside[0]) {
        e.preventDefault()
        trigger.focus()
      } else if (!e.shiftKey && active === inside[inside.length - 1]) {
        e.preventDefault()
        log('popover:close:tab-out')
        setOpen(false)
        afterTrigger?.focus()
      } else if (e.shiftKey && active === afterTrigger) {
        e.preventDefault()
        inside[inside.length - 1].focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open])

  useEffect(() => {
    if (open && focusOnOpen) contentRef.current?.querySelector<HTMLElement>('button, a[href], input')?.focus()
  }, [open])

  const onContentKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Escape') return
    if (escMode !== 'react' && escMode !== 'reactstop') return
    log('popover:close:esc:' + escMode)
    if (escMode === 'reactstop') e.stopPropagation()
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={open ? (contentId ?? id) : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onContentKeyDown}
      >
        {label}
      </button>
      {mounted &&
        open &&
        createPortal(
          <div
            id={contentId ?? id}
            ref={contentRef}
            data-popover=""
            onKeyDown={onContentKeyDown}
            style={{ position: 'fixed', top: pos.top, left: pos.left, width, zIndex: 'var(--enchase-z-popover)' as unknown as number, background: '#ffe', border: '1px solid #333', padding: 8, display: 'flex', gap: 8 }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  )
}

const ModalScene = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button id="page-before" type="button">
        Page before
      </button>
      <button id="open-modal" type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <button id="page-after" type="button">
        Page after
      </button>
      <Modal
        isOpen={open}
        onClose={() => {
          log('modal:onClose')
          setOpen(false)
        }}
        title="Dialog"
        size="sm"
        animation={false}
      >
        <input id="m-input" aria-label="Name" />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Popover label="Options" width={560}>
            <button id="p1" type="button">
              P1
            </button>
            <button id="p2" type="button">
              P2
            </button>
            <span id="p-far" style={{ marginLeft: 'auto', padding: 8 }}>
              far area
            </span>
          </Popover>
          <button id="m-last" type="button">
            Modal last
          </button>
        </div>
        <p id="m-text" style={{ marginTop: 40, height: 80 }}>
          Modal body text
        </p>
      </Modal>
    </>
  )
}

const PageScene = () => (
  <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'start' }}>
    <button id="page-before" type="button">
      Page before
    </button>
    <Popover label="Options">
      <button id="p1" type="button">
        P1
      </button>
      <button id="p2" type="button">
        P2
      </button>
    </Popover>
    <button id="page-after" type="button">
      Page after
    </button>
    <a id="page-last" href="#x">
      Page last link
    </a>
  </div>
)

const NestedScene = () => {
  const [a, setA] = useState(false)
  const [b, setB] = useState(false)
  return (
    <>
      <button id="open-modal" type="button" onClick={() => setA(true)}>
        Open A
      </button>
      <Modal isOpen={a} onClose={() => { log('modalA:onClose'); setA(false) }} title="A" animation={false}>
        <button id="open-b" type="button" onClick={() => setB(true)}>
          Open B
        </button>
        <Modal isOpen={b} onClose={() => { log('modalB:onClose'); setB(false) }} title="B" size="sm" animation={false}>
          <button id="b-btn" type="button">
            In B
          </button>
        </Modal>
      </Modal>
    </>
  )
}

const NestedStableScene = () => {
  const [a, setA] = useState(false)
  const [b, setB] = useState(false)
  const closeA = useCallback(() => { log('modalA:onClose'); setA(false) }, [])
  const closeB = useCallback(() => { log('modalB:onClose'); setB(false) }, [])
  return (
    <>
      <button id="open-modal" type="button" onClick={() => setA(true)}>
        Open A
      </button>
      <Modal isOpen={a} onClose={closeA} title="A" animation={false}>
        <button id="open-b" type="button" onClick={() => setB(true)}>
          Open B
        </button>
        <Modal isOpen={b} onClose={closeB} title="B" size="sm" animation={false}>
          <button id="b-btn" type="button">
            In B
          </button>
        </Modal>
      </Modal>
    </>
  )
}

const NestedPopScene = () => (
  <div style={{ padding: 40, display: 'flex', gap: 12 }}>
    <button id="page-before" type="button">
      Page before
    </button>
    <Popover label="A" triggerId="pa" contentId="pa-content" width={200}>
      <button id="a1" type="button">
        A1
      </button>
      <Popover label="B" triggerId="pb" contentId="pb-content" width={160}>
        <button id="b1" type="button">
          B1
        </button>
      </Popover>
    </Popover>
  </div>
)

const TooltipScene = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button id="open-modal" type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal isOpen={open} onClose={() => { log('modal:onClose'); setOpen(false) }} title="Dialog" animation={false}>
        <Tooltip text="Tip text" animation={false}>
          <button id="tt-trigger" type="button">
            Has tooltip
          </button>
        </Tooltip>
      </Modal>
    </>
  )
}

const PopModalScene = () => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ padding: 40 }}>
      <Popover label="Menu">
        <button id="p-open-modal" type="button" onClick={() => setOpen(true)}>
          Delete
        </button>
      </Popover>
      <Modal isOpen={open} onClose={() => { log('modal:onClose'); setOpen(false) }} title="Confirm" size="sm" animation={false}>
        <button id="m-ok" type="button" onClick={() => { log('modal:ok'); setOpen(false) }}>
          OK
        </button>
      </Modal>
    </div>
  )
}

const scenes: Record<string, () => ReactNode> = { modal: ModalScene, page: PageScene, nested: NestedScene, nestedstable: NestedStableScene, tooltip: TooltipScene, popmodal: PopModalScene, nestedpop: NestedPopScene }
const Scene = scenes[scene]

createRoot(document.getElementById('root')!).render(
  <ColorModeProvider mode="light">
    <GlobalStyles />
    <UIProvider motion={{ mode: 'never' }}>
      <Scene />
    </UIProvider>
  </ColorModeProvider>
)
