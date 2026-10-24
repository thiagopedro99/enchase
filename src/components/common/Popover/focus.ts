import { tabbablesIn } from '@utils/tabbable.ts'

export const focusFirst = (container: HTMLElement) => {
  const target = tabbablesIn(container)[0] ?? container
  target.focus({ preventScroll: true })
}

export const focusTrigger = (trigger: HTMLElement) => {
  const target = tabbablesIn(trigger)[0] ?? trigger
  target.focus({ preventScroll: true })
}

export const focusNextAfter = (trigger: HTMLElement, content: HTMLElement) => {
  const order = tabbablesIn(document.body).filter((element) => !content.contains(element))
  const anchor = tabbablesIn(trigger)
  const index = order.indexOf(anchor[anchor.length - 1])
  const target = index >= 0 ? order[index + 1] : undefined
  if (target) target.focus({ preventScroll: true })
}
