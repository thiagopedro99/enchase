import { Link } from 'react-router-dom'

import { VisuallyHidden } from '@components/common/VisuallyHidden/index.tsx'
import styles from './styles.module.css'

import type { BrandProps } from './types.ts'

export const Brand = ({ name, logo, compact = false }: BrandProps) => (
  <Link to="/" className={styles.link}>
    {logo ? <img src={logo} alt="" className={styles.image} /> : <span className={styles.mark} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>}
    {compact ? <VisuallyHidden>{name}</VisuallyHidden> : name}
  </Link>
)

export default Brand
