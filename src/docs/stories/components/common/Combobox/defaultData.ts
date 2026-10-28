import type { ComboboxOption } from 'enchase'

export const defaultMultiple = false

export const defaultFullWidth = false

export const defaultLoading = false

export const defaultOpen = false

export const frameworks: ComboboxOption[] = [
  { value: 'angular', label: 'Angular' },
  { value: 'astro', label: 'Astro' },
  { value: 'next', label: 'Next.js' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'react', label: 'React' },
  { value: 'remix', label: 'Remix', disabled: true },
  { value: 'solid', label: 'SolidJS' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'vue', label: 'Vue' }
]

export const countries: ComboboxOption[] = [
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'China',
  'Colombia',
  'Denmark',
  'Egypt',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'India',
  'Ireland',
  'Italy',
  'Japan',
  'Kenya',
  'Mexico',
  'Netherlands',
  'New Zealand',
  'Norway',
  'Peru',
  'Poland',
  'Portugal',
  'South Africa',
  'South Korea',
  'Spain',
  'Sweden',
  'Switzerland',
  'Turkey',
  'Uruguay'
].map((name) => ({ value: name.toLowerCase().replace(/\s+/g, '-'), label: name }))

export const searchDelay = 600

export const searchCountries = (query: string) => countries.filter((country) => country.label.toLowerCase().includes(query.trim().toLowerCase()))
