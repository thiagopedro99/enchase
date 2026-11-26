import { intentKey } from './defaultData.ts'

export const rememberIntent = () => {
  try {
    window.sessionStorage.setItem(intentKey, '1')
  } catch {
    return
  }
}

export const takeIntent = () => {
  try {
    const found = window.sessionStorage.getItem(intentKey) !== null

    window.sessionStorage.removeItem(intentKey)

    return found
  } catch {
    return false
  }
}
