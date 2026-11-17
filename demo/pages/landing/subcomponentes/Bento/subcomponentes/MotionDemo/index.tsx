import { useState } from 'react'
import { Button } from 'enchase'

import { springs } from './defaultData.ts'
import styles from './styles.module.css'

const MotionDemo = () => {
  const [released, setReleased] = useState(false)

  return (
    <div className={styles.demo}>
      <ul className={styles.tracks} data-released={released ? '' : undefined}>
        {springs.map((spring) => (
          <li key={spring} className={styles.track}>
            <span className={styles.ball} data-spring={spring} aria-hidden="true" />
            <code className={styles.name}>{spring}</code>
          </li>
        ))}
      </ul>
      <Button size="sm" variant="secondary" onClick={() => setReleased(!released)}>
        {released ? 'Voltar' : 'Soltar as molas'}
      </Button>
    </div>
  )
}

export default MotionDemo
