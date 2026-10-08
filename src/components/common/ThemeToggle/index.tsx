import { AnimatePresence, motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'

import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useColorMode } from '@hooks/useColorMode.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import Tooltip from '../Tooltip/index.tsx'
import styles from './styles.module.css'

const ThemeToggle = () => {
  const { resolvedMode, toggleMode } = useColorMode()
  const { labels } = useUIConfig()
  const pressMotion = useMotionRecipe('press')
  const iconMotion = useMotionRecipe('pop')
  const label = resolvedMode === 'light' ? labels.switchToDark : labels.switchToLight

  return (
    <Tooltip text={label} position="bottom" describe={false}>
      <motion.button {...pressMotion} type="button" className={styles.button} onClick={toggleMode} aria-label={label}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={resolvedMode} {...iconMotion} className={styles.icon} aria-hidden="true">
            {resolvedMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </Tooltip>
  )
}

export default ThemeToggle
