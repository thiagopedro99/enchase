import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import { Actions, Bar, MenuButton, Trail } from './styles.ts'
import Tooltip from '@components/common/Tooltip/index.tsx'
import MenuToggleIcon from '../MenuToggleIcon/index.tsx'

import type { AppBarProps } from './types.ts'

export const AppBar = ({ items, menuLabel, menuExpanded, menuControls, menuHasPopup = false, onMenuToggle, actions }: AppBarProps) => (
  <Bar>
    <Tooltip text={menuLabel} position="bottom" describe={false}>
      <MenuButton
        type="button"
        onClick={onMenuToggle}
        aria-label={menuLabel}
        aria-expanded={menuExpanded}
        aria-controls={menuControls}
        aria-haspopup={menuHasPopup ? 'dialog' : undefined}
      >
        <MenuToggleIcon open={menuExpanded} />
      </MenuButton>
    </Tooltip>
    <Trail>
      {items.length > 1 && <Breadcrumbs items={items} />}
    </Trail>
    {actions && <Actions>{actions}</Actions>}
  </Bar>
)

export default AppBar
