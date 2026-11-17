import { Button, Tag, Tooltip } from 'enchase'
import { useState } from 'react'

import { PauseIcon, PlayIcon } from '../../icons.tsx'
import styles from './styles.module.css'
import { rows } from './defaultData.ts'

const Marquee = () => {
  const [paused, setPaused] = useState(false)
  const label = paused ? 'Retomar a animação' : 'Pausar a animação'

  return (
    <section className={styles.marquee} aria-labelledby="marquee-title" data-paused={paused ? '' : undefined}>
      <div className={styles.heading}>
        <h2 id="marquee-title" className={styles.title}>
          48 componentes, um import
        </h2>
        <span className={styles.toggle}>
          <Tooltip text={label} describe={false}>
            <Button variant="ghost" size="sm" iconOnly aria-label={label} onClick={() => setPaused(!paused)}>
              {paused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
            </Button>
          </Tooltip>
        </span>
      </div>

      {rows.map((names, index) => (
        <div key={names[0]} className={styles.row} data-reverse={index % 2 === 1 ? '' : undefined}>
          <ul className={styles.track}>
            {names.map((name) => (
              <li key={name}>
                <Tag className={styles.name}>{name}</Tag>
              </li>
            ))}
          </ul>
          <ul className={styles.track} aria-hidden="true">
            {names.map((name) => (
              <li key={name}>
                <Tag className={styles.name}>{name}</Tag>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

export default Marquee
