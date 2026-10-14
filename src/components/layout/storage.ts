const getStorage = () => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export const readStoredCollapsed = (key: string): boolean | null => {
  try {
    const value = getStorage()?.getItem(key)

    return value === 'true' ? true : value === 'false' ? false : null
  } catch {
    return null
  }
}

export const writeStoredCollapsed = (key: string, collapsed: boolean) => {
  try {
    getStorage()?.setItem(key, String(collapsed))
  } catch {
    return
  }
}
