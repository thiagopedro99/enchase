import { useEffect } from 'react'
import { Layout } from 'enchase'

import { brand, footerProps, siteNavigation } from '../../defaultData.ts'
import styles from './styles.module.css'

import type { SitePageProps } from './types.ts'

const SitePage = ({ title, children }: SitePageProps) => {
  useEffect(() => {
    document.title = `${title} · ${brand}`
  }, [title])

  return (
    <Layout className={styles.page} navigation="navbar" translucent maxWidth="full" padding={false} brand={brand} navigationSections={siteNavigation} footerProps={footerProps}>
      {children}
    </Layout>
  )
}

export default SitePage
