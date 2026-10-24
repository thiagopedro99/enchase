import { commands } from 'vitest/browser'

type PointerCommands = { pressMouse: (selector: string) => Promise<void>; releaseMouse: () => Promise<void>; parkMouse: () => Promise<void> }

const pointer = commands as unknown as PointerCommands

export const pressMouse = (selector: string) => pointer.pressMouse(selector)

export const releaseMouse = () => pointer.releaseMouse()

export const parkMouse = () => pointer.parkMouse()

export const letGoOfTheMouse = async () => {
  await releaseMouse()
  await releaseMouse()
}
