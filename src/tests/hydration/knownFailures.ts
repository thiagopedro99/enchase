export const portalCause = 'portal created only on the client'

const portalCases = ['Modal open', 'ConfirmModal open', 'Loading overlay']

const portalFailures = Object.fromEntries(portalCases.map((name) => [name, portalCause]))

export const knownFailures: Record<string, Record<string, string>> = {
  'A desktop, dark saved': portalFailures,
  'B mobile, light, nothing saved': portalFailures,
  'C desktop, light': portalFailures,
  'D mobile, system dark': portalFailures,
  'F mobile, system light, dark saved': portalFailures
}

export const reducedMotionKnownFailures: Record<string, string> = portalFailures
