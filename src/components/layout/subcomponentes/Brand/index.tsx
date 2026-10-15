import { VisuallyHidden } from '@components/common/VisuallyHidden/index.tsx'
import { initialOf } from '@utils/initial.ts'
import { Link } from '@components/common/Link/index.tsx'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { BrandProps } from './types.ts'

export const Brand = ({ name, logo, compact = false, ...props }: BrandProps) => {
  const own = { ...slot('brand'), className: styles.link }

  return (
    <Link href="/" {...mergeProps(own, props)}>
      {logo ? (
        <img src={logo} alt="" className={styles.image} {...slot('brand', 'image')} />
      ) : (
        <span className={styles.mark} {...slot('brand', 'mark')} aria-hidden="true">
          {initialOf(name)}
        </span>
      )}
      {compact ? <VisuallyHidden>{name}</VisuallyHidden> : name}
    </Link>
  )
}

export default Brand
