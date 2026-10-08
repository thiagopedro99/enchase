import { hydrateRoot } from 'react-dom/client'
import { App } from './App.jsx'

window.__errors = []
window.__guard = !location.hash.includes("noguard")
hydrateRoot(document.getElementById('root'), <App {...window.__props} />, {
  onRecoverableError: (error) => window.__errors.push('recoverable: ' + String(error.message).slice(0, 160))
})
