import { defaultCompanyName, defaultLinks, defaultNotice, getCurrentYear } from './defaultData.ts'
import { Container, Flex } from '@components/common/index.ts'
import styles from './styles.module.css'

import type { FooterProps } from './types.ts'

const Footer = ({ companyName = defaultCompanyName, notice = defaultNotice, year = getCurrentYear(), links = defaultLinks }: FooterProps) => (
  <footer className={styles.footer}>
    <Container maxWidth="xl">
      <Flex direction="row" justify="center" align="center" wrap gap="1.5rem">
        {links.length > 0 && (
          <Flex gap="1.5rem" wrap>
            {links.map((link) => (
              <a key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </a>
            ))}
          </Flex>
        )}

        <p className={styles.copyright}>
          © {year} {companyName}. {notice}
        </p>
      </Flex>
    </Container>
  </footer>
)

export default Footer
