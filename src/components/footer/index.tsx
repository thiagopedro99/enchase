import { defaultCompanyName, defaultLinks, defaultNotice, getCurrentYear } from './defaultData.ts'
import { Container, Flex } from '@components/common/index.ts'
import { Link } from '@components/common/Link/index.tsx'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { FooterProps } from './types.ts'

const closeSentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`)

const Footer = ({ companyName = defaultCompanyName, notice = defaultNotice, year = getCurrentYear(), links = defaultLinks, ...props }: FooterProps) => {
  const own = { ...slot('footer'), className: styles.footer }

  return (
    <footer {...mergeProps(own, props)}>
      <Container maxWidth="xl">
        <Flex direction="row" justify="center" align="center" wrap className={styles.row}>
          {links.length > 0 && (
            <Flex wrap className={styles.links}>
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={styles.link} {...slot('footer', 'link')}>
                  {link.label}
                </Link>
              ))}
            </Flex>
          )}

          <p className={styles.copyright} {...slot('footer', 'copyright')}>
            {[`© ${year}`, companyName && closeSentence(companyName), notice].filter(Boolean).join(' ')}
          </p>
        </Flex>
      </Container>
    </footer>
  )
}

export default Footer
