import { useLayoutEffect, useState } from 'react'

import { resolvePortalContainer } from '@utils/portalContainer.ts'

import type { PortalContainer } from '@utils/portalContainer.ts'

export const usePortalContainer = (container: PortalContainer | undefined) => {
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setTarget(resolvePortalContainer(container))
  }, [container])

  return target
}
