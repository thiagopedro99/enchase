const fallbackLocale = 'en'

type LocaleConstructor = {
  supportedLocalesOf: (locales: string, options: { localeMatcher: 'lookup' }) => string[]
}

export const resolveLocale = (tag: string, constructor: LocaleConstructor) => {
  try {
    const [canonical] = Intl.getCanonicalLocales(tag)

    if (canonical !== undefined && constructor.supportedLocalesOf(canonical, { localeMatcher: 'lookup' }).length > 0) return canonical
  } catch (error) {
    if (!(error instanceof RangeError)) throw error
  }

  return fallbackLocale
}
