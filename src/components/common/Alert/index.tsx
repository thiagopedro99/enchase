import { AlertTriangleIcon } from '../Icon/icons/AlertTriangleIcon.tsx'
import { CloseIcon } from '../Icon/icons/CloseIcon.tsx'
import { CheckIcon } from '../Icon/icons/CheckIcon.tsx'
import { InfoIcon } from '../Icon/icons/InfoIcon.tsx'

import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { defaultVariant } from './defaultData.ts'
import styles from './styles.module.css'

import type { AlertProps } from './types.ts'

const variantIcons = {
  info: <InfoIcon size={20} />,
  success: <CheckIcon size={20} />,
  warning: <AlertTriangleIcon size={20} />,
  error: <CloseIcon size={20} />
}

export const Alert = ({ children, variant = defaultVariant, title, icon, onClose, ...props }: AlertProps) => {
  const { labels } = useUIConfig()
  const symbol = icon === undefined ? variantIcons[variant] : icon
  const own = {
    ...slot('alert'),
    className: styles.alert,
    role: variant === 'error' ? 'alert' : 'status',
    'data-variant': variant
  }

  return (
    <div {...mergeProps(own, props)}>
      {symbol && (
        <span {...slot('alert', 'icon')} className={styles.icon} aria-hidden="true">
          {symbol}
        </span>
      )}

      <div {...slot('alert', 'content')} className={styles.content}>
        {title && (
          <p {...slot('alert', 'title')} className={styles.title}>
            {title}
          </p>
        )}

        <div {...slot('alert', 'message')} className={styles.message}>
          {children}
        </div>
      </div>

      {onClose && (
        <button {...slot('alert', 'close')} type="button" className={styles.close} onClick={onClose} aria-label={labels.closeToast}>
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  )
}

export default Alert
