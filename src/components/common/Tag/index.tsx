import { useId } from 'react'

import { CloseIcon } from '../Icon/icons/CloseIcon.tsx'
import { defaultSize } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { TagProps } from './types.ts'

export const Tag = ({ children, size = defaultSize, onRemove, ...props }: TagProps) => {
  const { labels } = useUIConfig()
  const id = useId()
  const labelId = `${id}-label`
  const removeId = `${id}-remove`
  const own = { ...slot('tag'), className: styles.tag, 'data-size': size, 'data-removable': onRemove ? '' : undefined }

  return (
    <span {...mergeProps(own, props)}>
      <span id={labelId} className={styles.label} {...slot('tag', 'label')}>
        {children}
      </span>
      {onRemove && (
        <button type="button" id={removeId} className={styles.remove} {...slot('tag', 'remove')} aria-label={labels.removeTag} aria-labelledby={`${removeId} ${labelId}`} onClick={() => onRemove()}>
          <CloseIcon size={14} />
        </button>
      )}
    </span>
  )
}

export default Tag
