import { useContext } from 'react'

import { NavigateContext } from '../components/uiProvider/navigationContext.ts'

export const useNavigator = () => useContext(NavigateContext)
