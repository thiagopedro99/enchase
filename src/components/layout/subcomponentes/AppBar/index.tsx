import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import Tooltip from '@components/common/Tooltip/index.tsx'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import MenuToggleIcon from '../MenuToggleIcon/index.tsx'
import { defaultTranslucent } from './defaultData.ts'
import styles from './styles.module.css'

import type { AppBarProps } from './types.ts'

export const AppBar = ({ items, menuLabel, menuExpanded, menuControls, menuHasPopup = false, onMenuToggle, actions, translucent = defaultTranslucent, ...props }: AppBarProps) => {
  const own = { ...slot('layout-header'), className: styles.bar, 'data-translucent': translucent ? '' : undefined }

  return (
    <header {...mergeProps(own, props)}>
      <Tooltip text={menuLabel} position="bottom" describe={false}>
        <button
          type="button"
          className={styles.menuButton}
          {...slot('layout-header', 'menu-button')}
          onClick={onMenuToggle}
          aria-label={menuLabel}
          aria-expanded={menuExpanded}
          aria-controls={menuControls}
          aria-haspopup={menuHasPopup ? 'dialog' : undefined}
        >
          <MenuToggleIcon open={menuExpanded} />
        </button>
      </Tooltip>
      <div className={styles.trail} {...slot('layout-header', 'trail')}>
        {items.length > 1 && <Breadcrumbs items={items} />}
      </div>
      {actions && (
        <div className={styles.actions} {...slot('layout-header', 'actions')}>
          {actions}
        </div>
      )}
    </header>
  )
}

export default AppBar
