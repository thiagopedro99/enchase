import { MenuOpenIcon } from '@components/common/Icon/icons/MenuOpenIcon.tsx'
import { MenuIcon } from '@components/common/Icon/icons/MenuIcon.tsx'
import { IconSwap } from '@components/common/Icon/IconSwap.tsx'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { MenuToggleIconProps } from './types.ts'

export const MenuToggleIcon = ({ open, ...props }: MenuToggleIconProps) => {
  const own = { ...slot('menu-toggle-icon'), className: styles.slot }

  return <IconSwap {...mergeProps(own, props)} first={<MenuIcon />} second={<MenuOpenIcon />} showSecond={open} />
}

export default MenuToggleIcon
