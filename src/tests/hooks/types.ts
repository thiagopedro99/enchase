export type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void

export type ObserverRecord = {
  callback: ObserverCallback
  observed: Element[]
  disconnected: boolean
  options?: IntersectionObserverInit
}
