import { createRoot } from 'react-dom/client'
import { useLayoutEffect, useRef } from 'react'
const D = () => {
  const ref = useRef(null)
  useLayoutEffect(() => { ref.current.showModal() }, [])
  return <dialog ref={ref}><button id="first">First</button><button id="cancel" autoFocus>Cancel</button></dialog>
}
createRoot(document.getElementById('root')).render(<D />)
setTimeout(() => { window.__af = { hasAttr: document.getElementById('cancel').hasAttribute('autofocus'), active: document.activeElement?.id } }, 300)
