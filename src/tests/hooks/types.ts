export type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void

export type ObserverRecord = {
  callback: ObserverCallback
  observed: Element[]
  unobserved: Element[]
  disconnected: boolean
  options?: IntersectionObserverInit
}
