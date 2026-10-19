import { it } from 'vitest'
import { server } from 'vitest/browser'

export const isChromium = server.browser === 'chromium'

export const isWebkit = server.browser === 'webkit'

export const browserSkips = {
  touchEmulation: 'touch pointer emulation uses a Chromium-only protocol call',
  rawMouseInput: 'raw mouse dispatch uses a Chromium-only protocol call',
  layoutMetrics: 'layout cost is read from Chromium performance metrics',
  webkitSelectPadding: 'WebKit base-select keeps the select padding on an inner part, so the element reads 0px although its text is indented like the input',
  forcedColors: 'WebKit has no forced colors emulation to switch on'
} as const

export const chromiumOnly = (reason: keyof typeof browserSkips) => {
  void browserSkips[reason]

  return isChromium ? it : it.skip
}

export const unlessWebkit = (reason: keyof typeof browserSkips) => {
  void browserSkips[reason]

  return !isWebkit
}

