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

type Point = { x: number; y: number }

const toPage = ({ x, y }: Point): Point => {
  const frame = window.frameElement as HTMLElement | null

  if (!frame) return { x, y }

  const box = frame.getBoundingClientRect()
  const scale = box.width / frame.offsetWidth

  return { x: box.left + x * scale, y: box.top + y * scale }
}

export const dragFinger = async (path: Point[]) => {
  const [first, ...rest] = path

  await cdp().send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...toPage(first), id: 1 }] })

  for (const point of rest) await cdp().send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...toPage(point), id: 1 }] })

  await cdp().send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
