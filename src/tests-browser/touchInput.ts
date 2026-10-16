import { it } from 'vitest'
import { cdp } from 'vitest/browser'
import { browserSkips, isChromium } from './browserSkips.ts'

const nativeTouch = matchMedia('(hover: none)').matches

export const touchCapable = (reason: keyof typeof browserSkips) => {
  void browserSkips[reason]

  return isChromium || nativeTouch ? it : it.skip
}

export const enableTouch = async () => {
  if (isChromium) await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
}

export const disableTouch = async () => {
  if (isChromium) await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
}
