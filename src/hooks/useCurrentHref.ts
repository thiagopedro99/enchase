import { useContext } from 'react'

import { CurrentHrefContext } from '../components/uiProvider/navigationContext.ts'

export const useCurrentHref = () => useContext(CurrentHrefContext)
