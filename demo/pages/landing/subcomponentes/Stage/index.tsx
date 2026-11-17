import { useEffect, useState } from 'react'

import { closedSplit, defaultSplit, description } from './defaultData.ts'
import { prefersReducedMotion } from '../../reveal.ts'
import StageApp from '../StageApp/index.tsx'
import { GripIcon } from '../../icons.tsx'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'

const Stage = () => {
  const [split, setSplit] = useState(() => (prefersReducedMotion() ? defaultSplit : closedSplit))
  const [opening, setOpening] = useState(true)
  const position = { '--landing-split': `${split}%` } as CSSProperties

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSplit((current) => (current === closedSplit ? defaultSplit : current)))

    return () => cancelAnimationFrame(frame)
  }, [])

  const drag = (value: number) => {
    setOpening(false)
    setSplit(value)
  }

  return (
    <div className={styles.stage} data-opening={opening ? '' : undefined}>
      <div className={styles.window}>
        <div className={styles.chrome} aria-hidden="true">
          <span className={styles.dots} />
          <span className={styles.address}>atlas.app/visao-geral</span>
        </div>

        <div className={styles.viewport}>
          <div className={styles.screen} role="img" aria-label={description}>
            <div className={styles.pane} data-theme="light" aria-hidden="true" inert>
              <StageApp />
            </div>
            <div className={styles.pane} data-theme="dark" data-layer="top" style={position} aria-hidden="true" inert onTransitionEnd={() => setOpening(false)}>
              <StageApp />
            </div>
          </div>

          <input
            type="range"
            className={styles.range}
            min={0}
            max={100}
            value={split}
            aria-label="Divisão entre o tema claro e o escuro"
            aria-valuetext={`${split}% no tema claro, ${100 - split}% no escuro`}
            onChange={({ target }) => drag(Number(target.value))}
          />

          <span className={styles.divider} style={position} aria-hidden="true">
            <span className={styles.grip}>
              <GripIcon size={18} />
            </span>
          </span>
        </div>
      </div>

      <p className={styles.hint}>Arraste a divisória: os mesmos componentes, no claro e no escuro.</p>
    </div>
  )
}

export default Stage
