import type { HrefCase } from './types.ts'

export const hrefCases: HrefCase[] = [
  { id: 'section', href: '#features', outcome: 'Page anchor: the browser scrolls to the element.' },
  { id: 'route', href: '/about', outcome: 'App route: goes to the navigate of the UIProvider.' },
  { id: 'route-hash', href: '/about#team', outcome: 'Route with a hash on another page: goes to the navigate, with the hash in the href.' },
  { id: 'same-page-hash', href: '/docs#props', outcome: 'Hash of the current page (currentHref="/docs"): the browser scrolls and the navigate is not called.' },
  { id: 'external', href: 'https://example.com', outcome: 'External URL: the browser.' },
  { id: 'mail', href: 'mailto:ada@example.com', outcome: 'mailto: and tel: go to the browser.' },
  { id: 'native', href: '/reference', native: true, outcome: 'native: the browser, even though it is a route. It is for routes of another app on the same domain.' },
  { id: 'blank', href: '/about', target: '_blank', outcome: 'target other than _self: the browser opens the destination.' },
  { id: 'download', href: '/manual.pdf', download: '', outcome: 'download: the browser downloads the file.' }
]
