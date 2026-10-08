import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import Tooltip from '@components/common/Tooltip/index.tsx'
import MenuToggleIcon from '../MenuToggleIcon/index.tsx'
import styles from './styles.module.css'

import type { AppBarProps } from './types.ts'

export const AppBar = ({ items, menuLabel, menuExpanded, menuControls, menuHasPopup = false, onMenuToggle, actions }: AppBarProps) => (
  <header className={styles.bar}>
    <Tooltip text={menuLabel} position="bottom" describe={false}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuToggle}
        aria-label={menuLabel}
        aria-expanded={menuExpanded}
        aria-controls={menuControls}
        aria-haspopup={menuHasPopup ? 'dialog' : undefined}
      >
        <MenuToggleIcon open={menuExpanded} />
      </button>
    </Tooltip>
    <div className={styles.trail}>{items.length > 1 && <Breadcrumbs items={items} />}</div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </header>
)

export default AppBar
