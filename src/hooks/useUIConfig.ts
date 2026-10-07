import { useContext } from 'react'

import { UIContext } from '../components/uiProvider/context.ts'

export const useUIConfig = () => useContext(UIContext)
