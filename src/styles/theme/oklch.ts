import type { Rgba } from './rgb.ts'

export type Oklch = { lightness: number; chroma: number; hue: number }

type Channels = [number, number, number]

type RgbChannels = Pick<Rgba, 'r' | 'g' | 'b'>

const gamutTolerance = 0.00001

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum)

const toLinear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)

const fromLinear = (channel: number) => (channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055)

export const rgbToOklch = ({ r, g, b }: RgbChannels): Oklch => {
  const [red, green, blue] = [r, g, b].map((channel) => toLinear(channel / 255))
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)
  const redGreen = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const yellowBlue = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s

  return {
    lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    chroma: Math.hypot(redGreen, yellowBlue),
    hue: (((Math.atan2(yellowBlue, redGreen) * 180) / Math.PI) + 360) % 360
  }
}

const toLinearRgb = ({ lightness, chroma, hue }: Oklch): Channels => {
  const radians = (hue * Math.PI) / 180
  const redGreen = chroma * Math.cos(radians)
  const yellowBlue = chroma * Math.sin(radians)
  const l = (lightness + 0.3963377774 * redGreen + 0.2158037573 * yellowBlue) ** 3
  const m = (lightness - 0.1055613458 * redGreen - 0.0638541728 * yellowBlue) ** 3
  const s = (lightness - 0.0894841775 * redGreen - 1.291485548 * yellowBlue) ** 3

  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}

const inGamut = (color: Oklch) => toLinearRgb(color).every((channel) => channel >= -gamutTolerance && channel <= 1 + gamutTolerance)

const fitChroma = (color: Oklch): Oklch => {
  if (inGamut(color)) return color

  const [chroma] = Array.from({ length: 24 }).reduce<[number, number]>(
    ([low, high]) => {
      const middle = (low + high) / 2

      return inGamut({ ...color, chroma: middle }) ? [middle, high] : [low, middle]
    },
    [0, color.chroma]
  )

  return { ...color, chroma }
}

const toHex = (channels: number[]) => `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`

export const rgbToHex = ({ r, g, b }: RgbChannels) => toHex([r, g, b].map((channel) => Math.round(channel)))

export const oklchToHex = (color: Oklch) => toHex(toLinearRgb(fitChroma({ ...color, lightness: clamp(color.lightness, 0, 1) })).map((channel) => Math.round(fromLinear(clamp(channel, 0, 1)) * 255)))
