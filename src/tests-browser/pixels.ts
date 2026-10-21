import { page } from 'vitest/browser'

import type { Rgba } from './color.ts'

export const capture = async () => {
  const base64 = await page.screenshot({ save: false })
  const image = new Image()

  image.src = `data:image/png;base64,${base64}`
  await image.decode()

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  context.drawImage(image, 0, 0)

  const scale = window.devicePixelRatio

  return (x: number, y: number): Rgba => {
    const [r, g, b, a] = context.getImageData(Math.floor(x * scale), Math.floor(y * scale), 1, 1).data

    return { r, g, b, a: a / 255 }
  }
}
