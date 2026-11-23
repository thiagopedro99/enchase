import styles from './styles.module.css'

import type { StatusDotProps } from './types.ts'

const StatusDot = ({ status }: StatusDotProps) => <span className={styles.dot} data-status={status} aria-hidden="true" />

export default StatusDot
