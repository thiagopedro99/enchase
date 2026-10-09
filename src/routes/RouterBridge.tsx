import { useLocation, useNavigate } from 'react-router-dom'

import UIProvider from '@components/uiProvider/index.tsx'

import type { UIProviderProps } from '@components/uiProvider/types.ts'

export const RouterBridge = ({ children, ...props }: UIProviderProps) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <UIProvider {...props} navigate={navigate} currentHref={pathname}>
      {children}
    </UIProvider>
  )
}

export default RouterBridge
