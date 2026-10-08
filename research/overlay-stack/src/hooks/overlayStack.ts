import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export type OverlayLayer = {
  modal?: boolean
  contains: (node: Node) => boolean
  onEscape?: () => void
  onPointerDownOutside?: (event: PointerEvent) => void
}

const layers: OverlayLayer[] = []
let topAtPointerDown: OverlayLayer | undefined

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return
  const top = layers[layers.length - 1]
  if (!top) return
  event.preventDefault()
  top.onEscape?.()
}

const handlePointerDown = (event: PointerEvent) => {
  topAtPointerDown = layers[layers.length - 1]
  const target = event.target
  if (!(target instanceof Node)) return
  const outside = []
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index]
    if (layer.contains(target) || layer.modal) break
    outside.push(layer)
  }
  outside.forEach((layer) => layer.onPointerDownOutside?.(event))
}

export const wasTopAtPointerDown = (layer: OverlayLayer) => topAtPointerDown === layer

export const getLayerCount = () => layers.length

export const useOverlayLayer = (active: boolean, layer: OverlayLayer) => {
  const latest = useRef(layer)
  useLayoutEffect(() => {
    latest.current = layer
  })
  const [handle] = useState<OverlayLayer>(() => ({
    modal: layer.modal,
    contains: (node) => latest.current.contains(node),
    onEscape: () => latest.current.onEscape?.(),
    onPointerDownOutside: (event) => latest.current.onPointerDownOutside?.(event)
  }))

  useEffect(() => {
    if (!active) return
    if (layers.length === 0) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('pointerdown', handlePointerDown, true)
    }
    layers.push(handle)

    return () => {
      layers.splice(layers.indexOf(handle), 1)
      if (layers.length === 0) {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('pointerdown', handlePointerDown, true)
      }
    }
  }, [active, handle])

  return handle
}
