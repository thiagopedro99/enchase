export const portalCause = 'portal created only on the client'

export const browserStateCause = 'browser values read in the initial state'

export const reducedMotionCause = 'reduced motion unknown on the server'

const portalCases = ['Modal open', 'ConfirmModal open', 'Loading overlay']

const browserStateCases = ['ThemeToggle', 'Navbar', 'Layout']

const causes = (portals: string[], browserState: string[]) => ({
  ...Object.fromEntries(portals.map((name) => [name, portalCause])),
  ...Object.fromEntries(browserState.map((name) => [name, browserStateCause]))
})

export const knownFailures: Record<string, Record<string, string>> = {
  'A desktop, dark saved': causes(portalCases, browserStateCases),
  'B mobile, light, nothing saved': causes(portalCases, []),
  'C desktop, light': causes(portalCases, ['Layout']),
  'D mobile, system dark': causes(portalCases, browserStateCases),
  'F mobile, system light, dark saved': causes(portalCases, browserStateCases)
}

export const reducedMotionKnownFailures: Record<string, string> = {
  ...Object.fromEntries(['Button', 'Tooltip', 'ThemeToggle', 'Sidebar modal open', 'Navbar'].map((name) => [name, reducedMotionCause])),
  ...Object.fromEntries(portalCases.map((name) => [name, portalCause])),
  Layout: browserStateCause
}
