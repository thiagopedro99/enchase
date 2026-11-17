export const hookCode = `import { useTabs } from 'enchase/headless/tabs'

const tabs = useTabs({ items })

<button {...tabs.getTabProps('um')}>Um</button>`

export const ejectCode = '$ npx enchase eject Button Tabs'
