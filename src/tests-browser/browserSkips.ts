import { it } from 'vitest'
import { server } from 'vitest/browser'

export const isChromium = server.browser === 'chromium'

export const isWebkit = server.browser === 'webkit'

export const browserSkips = {
  touchEmulation: 'touch pointer emulation uses a Chromium-only protocol call',
  rawMouseInput: 'raw mouse dispatch uses a Chromium-only protocol call',
  layoutMetrics: 'layout cost is read from Chromium performance metrics',
  webkitFocus: 'WebKit does not move focus to buttons and links on click or Tab by default, so focus return and Tab traps cannot be observed',
  webkitSelectPadding: 'the padding of the native select reads 0px in WebKit: to investigate'
} as const

export const chromiumOnly = (reason: keyof typeof browserSkips) => {
  void browserSkips[reason]

  return isChromium ? it : it.skip
}

export const exceptWebkit = (reason: keyof typeof browserSkips) => {
  void browserSkips[reason]

  return isWebkit ? it.skip : it
}
