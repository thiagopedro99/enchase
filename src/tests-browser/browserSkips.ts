import { it } from 'vitest'
import { server } from 'vitest/browser'

export const isChromium = server.browser === 'chromium'

export const isWebkit = server.browser === 'webkit'

export const isFirefox = server.browser === 'firefox'

export const browserSkips = {
  touchEmulation: 'touch pointer emulation uses a Chromium-only protocol call',
  rawMouseInput: 'raw mouse dispatch uses a Chromium-only protocol call',
  layoutMetrics: 'layout cost is read from Chromium performance metrics',
  webkitSelectPadding: 'WebKit base-select keeps the select padding on an inner part, so the element reads 0px although its text is indented like the input',
  forcedColors: 'WebKit has no forced colors emulation to switch on',
  reducedTransparency: 'reduced transparency is emulated through a Chromium-only protocol call',
  contrastEmulation: 'Firefox applies the contrast emulation to matchMedia only, so the style rules of prefers-contrast do not change',
  radioWrap: 'WebKit does not wrap the arrow keys around the ends of a native radio group'
} as const

export const chromiumOnly = (reason: keyof typeof browserSkips) => {
  void browserSkips[reason]

  return isChromium ? it : it.skip
}

export const unlessWebkit = (reason: keyof typeof browserSkips) => {
  void browserSkips[reason]

  return !isWebkit
}


export const unlessFirefox = (reason: keyof typeof browserSkips) => {
  void browserSkips[reason]

  return !isFirefox
}
