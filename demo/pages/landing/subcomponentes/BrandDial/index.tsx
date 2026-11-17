import { VisuallyHidden } from 'enchase'
import { useId } from 'react'

import { brands, defaultBrand } from '../../defaultData.ts'
import { useRevealOrigin } from '../../useRevealOrigin.ts'
import styles from './styles.module.css'

import type { BrandDialProps } from './types.ts'
import type { CSSProperties } from 'react'

const BrandDial = ({ look, onLookChange }: BrandDialProps) => {
  const labelId = useId()
  const name = useId()
  const { handlers, origin } = useRevealOrigin()

  return (
    <div className={styles.dial} role="radiogroup" aria-labelledby={labelId} {...handlers}>
      <span id={labelId} className={styles.label}>
        Pinte esta página
      </span>
      <div className={styles.options}>
        {brands.map(({ value, label }) => (
          <label key={value} className={styles.option} title={label}>
            <input type="radio" name={name} className={styles.input} value={value} checked={look.brand === value} onChange={() => onLookChange({ ...look, brand: value }, origin())} />
            <span className={styles.swatch} data-auto={value === defaultBrand ? '' : undefined} style={value === defaultBrand ? undefined : ({ '--landing-swatch': value } as CSSProperties)} aria-hidden="true" />
            <VisuallyHidden>{label}</VisuallyHidden>
          </label>
        ))}
      </div>
    </div>
  )
}

export default BrandDial
