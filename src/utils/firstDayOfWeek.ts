const fallbackLocale = 'en'

const sundayRegions = new Set(['AG', 'AS', 'BD', 'BR', 'BS', 'BT', 'BW', 'BZ', 'CA', 'CO', 'DM', 'DO', 'ET', 'GT', 'GU', 'HK', 'HN', 'ID', 'IL', 'IN', 'JM', 'JP', 'KE', 'KH', 'KR', 'LA', 'MH', 'MM', 'MO', 'MT', 'MX', 'MZ', 'NI', 'NP', 'PA', 'PE', 'PH', 'PK', 'PR', 'PT', 'PY', 'SA', 'SG', 'SV', 'TH', 'TT', 'TW', 'UM', 'US', 'VE', 'VI', 'WS', 'YE', 'ZA', 'ZW'])

const saturdayRegions = new Set(['AF', 'BH', 'DJ', 'DZ', 'EG', 'IQ', 'IR', 'JO', 'KW', 'LY', 'OM', 'QA', 'SD', 'SY'])

const fridayRegions = new Set(['MV'])

type WeekInfoLocale = Intl.Locale & { getWeekInfo?: (() => { firstDay: number }) | undefined; weekInfo?: { firstDay: number } | undefined }

const construct = (locale: string) => {
  try {
    return new Intl.Locale(locale)
  } catch (error) {
    if (error instanceof RangeError && locale !== fallbackLocale) return new Intl.Locale(fallbackLocale)

    throw error
  }
}

export const firstDayByRegion = (region: string | undefined) => {
  if (region !== undefined && sundayRegions.has(region)) return 0
  if (region !== undefined && saturdayRegions.has(region)) return 6
  if (region !== undefined && fridayRegions.has(region)) return 5

  return 1
}

export const firstDayOfWeek = (locale: string) => {
  const parsed = construct(locale) as WeekInfoLocale
  const info = parsed.getWeekInfo?.() ?? parsed.weekInfo

  if (info) return info.firstDay % 7

  return firstDayByRegion(parsed.maximize().region)
}
