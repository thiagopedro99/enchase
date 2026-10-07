import { FooterContainer, Link, Copyright } from './styles.ts'
import { defaultCompanyName, defaultLinks, defaultNotice, getCurrentYear } from './defaultData.ts'
import { Container, Flex } from '@components/common/index.ts'

import type { FooterProps } from './types.ts'

const Footer = ({ companyName = defaultCompanyName, notice = defaultNotice, year = getCurrentYear(), links = defaultLinks }: FooterProps) => (
  <FooterContainer>
    <Container $maxWidth="xl">
      <Flex $direction="row" $justify="center" $align="center" $wrap $gap="1.5rem">
        {links.length > 0 && (
          <Flex $gap="1.5rem" $wrap>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </Flex>
        )}

        <Copyright>
          © {year} {companyName}. {notice}
        </Copyright>
      </Flex>
    </Container>
  </FooterContainer>
)

export default Footer
