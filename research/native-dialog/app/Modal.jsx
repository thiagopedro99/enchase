import { AnimatePresence, useAnimate, usePresence } from 'motion/react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const useIsoLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

const NativeDialog = ({ onClose, label, children }) => {
  const [scope, animate] = useAnimate()
  const [isPresent, safeToRemove] = usePresence()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useIsoLayoutEffect(() => {
    const dialog = scope.current
    if (!dialog.open) dialog.showModal()
    animate(dialog, { opacity: [0, 1], transform: ['scale(0.96)', 'scale(1)'] }, { duration: 0.2 })
  }, [])

  useEffect(() => {
    if (isPresent) return
    const dialog = scope.current
    window.__exit = { startedModal: dialog.matches(':modal'), samples: [] }
    const timer = setInterval(() => window.__exit.samples.push({ modal: dialog.matches(':modal'), opacity: getComputedStyle(dialog).opacity }), 40)
    animate(dialog, { opacity: 0, transform: 'scale(0.96)' }, { duration: 0.3 }).then(() => {
      clearInterval(timer)
      if (dialog.open) dialog.close()
      safeToRemove()
    })
  }, [isPresent])

  return (
    <dialog
      ref={scope}
      aria-label={label}
      onCancel={(event) => {
        if (window.__guard && event.target !== event.currentTarget) return
        if (event.cancelable) {
          event.preventDefault()
          onCloseRef.current()
        }
      }}
      onClose={(event) => {
        if (window.__guard && event.target !== event.currentTarget) return
        onCloseRef.current()
      }}
    >
      {children}
    </dialog>
  )
}

export const Modal = ({ isOpen, onClose, label, children }) => (
  <AnimatePresence>
    {isOpen && (
      <NativeDialog key="dialog" onClose={onClose} label={label}>
        {children}
      </NativeDialog>
    )}
  </AnimatePresence>
)

export const PortalModal = ({ isOpen, children }) => {
  if (typeof document === 'undefined') return null
  return createPortal(isOpen ? <div role="dialog" aria-modal="true">{children}</div> : null, document.body)
}
