import { SegmentedControl, useColorMode } from 'enchase'

import { useRevealOrigin } from '../../../../useRevealOrigin.ts'
import { revealFrom } from '../../../../reveal.ts'
import { modes, roles } from './defaultData.tsx'
import styles from './styles.module.css'

import type { ColorMode } from 'enchase'

const ModeDemo = () => {
  const { mode, setMode } = useColorMode()
  const { handlers, origin } = useRevealOrigin()

  return (
    <div className={styles.demo} {...handlers}>
      <SegmentedControl ariaLabel="Modo de cor da página" items={modes} value={mode} onValueChange={(next: string) => revealFrom(origin(), () => setMode(next as ColorMode))} size="sm" fullWidth />
      <ul className={styles.roles} aria-hidden="true">
        {roles.map((role) => (
          <li key={role} className={styles.role} data-role={role} />
        ))}
      </ul>
    </div>
  )
}

export default ModeDemo
