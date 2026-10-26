export const configMeanings = {
  dir: 'text direction, set by the locale',
  closeModal: 'one of the accessibility texts, coming from the locale and from labels',
  breakpoint: 'width of the md breakpoint, used by the Container, the Layout and the Navbar',
  motion: 'mode and preset of the motion of all the components'
} as const

export const linkCases = [
  { href: '/about', outcome: 'app route: the click goes to the navigate' },
  { href: '/docs#props', outcome: 'hash of the /docs page: with currentHref="/docs" the browser scrolls the page; with another page, it goes to the navigate' },
  { href: 'https://example.com', outcome: 'external link: left to the browser' }
] as const
