type Segmenter = new (locale: undefined, options: { granularity: 'grapheme' }) => { segment: (text: string) => Iterable<{ segment: string }> }

const firstGrapheme = (text: string) => {
  const Segmenter = (Intl as unknown as { Segmenter?: Segmenter }).Segmenter

  if (Segmenter) {
    const [first] = new Segmenter(undefined, { granularity: 'grapheme' }).segment(text)

    return first?.segment ?? ''
  }

  return Array.from(text)[0] ?? ''
}

export const initialOf = (name: string, fallback = '?') => {
  const first = firstGrapheme(name.trim())

  return first ? first.toLocaleUpperCase() : fallback
}
