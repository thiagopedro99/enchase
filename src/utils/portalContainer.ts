export type PortalContainer = HTMLElement | (() => HTMLElement | null) | null

export const resolvePortalContainer = (container: PortalContainer | undefined) => {
  const resolved = typeof container === 'function' ? container() : container

  return resolved ?? document.body
}
