import { Tag } from 'enchase'

import { facts, size } from './defaultData.ts'
import styles from './styles.module.css'

const WeightDemo = () => (
  <div className={styles.weight}>
    <p className={styles.figure}>
      <span className={styles.value}>{size.value}</span>
      <span className={styles.unit}>{size.unit}</span>
      <span className={styles.label}>{size.label}</span>
    </p>
    <ul className={styles.facts}>
      {facts.map((fact) => (
        <li key={fact}>
          <Tag size="sm">{fact}</Tag>
        </li>
      ))}
    </ul>
  </div>
)

export default WeightDemo
