import { useColorMode } from '@hooks/useColorMode.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { resolveButtonMotion } from '../Button/motion.ts'
import { MoonIcon } from '../Icon/icons/MoonIcon.tsx'
import { SunIcon } from '../Icon/icons/SunIcon.tsx'
import { IconSwap } from '../Icon/IconSwap.tsx'
import Tooltip from '../Tooltip/index.tsx'
import styles from './styles.module.css'

import type { ThemeToggleProps } from './types.ts'

const ThemeToggle = ({ animation, ...props }: ThemeToggleProps) => {
  const { resolvedMode, toggleMode } = useColorMode()
  const { labels, motion: settings } = useUIConfig()
  const { motion, style } = resolveButtonMotion(settings, animation)
  const label = resolvedMode === 'light' ? labels.switchToDark : labels.switchToLight
  const own = {
    ...slot('theme-toggle'),
    className: styles.button,
    style,
    type: 'button' as const,
    onClick: toggleMode,
    'aria-label': label,
    'data-motion': motion
  }

  return (
    <Tooltip text={label} position="bottom" describe={false}>
      <button {...mergeProps(own, props)}>
        <IconSwap className={styles.icon} data-slot="theme-toggle-icon" first={<MoonIcon size={20} />} second={<SunIcon size={20} />} showSecond={resolvedMode === 'dark'} />
      </button>
    </Tooltip>
  )
}

export default ThemeToggle
