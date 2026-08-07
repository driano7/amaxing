import siteMetadata from '@/data/siteMetadata'
import Logo from '@/data/jaguarColor.svg'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import { Navbar } from './Navbar'
import dynamic from 'next/dynamic'
import JsonLd from './JsonLd'
import { buildOrganizationEntity, buildWebSiteEntity } from '@/lib/seo'

const MobileDock = dynamic(() => import('./MobileDock').then((m) => m.MobileDock), {
  loading: () => null,
})

const HubMenu = dynamic(() => import('./HubMenu').then((m) => m.HubMenu), {
  ssr: false,
  loading: () => null,
})

const LayoutWrapper = ({ children }) => {
  return (
    <SectionContainer>
      {/* Structured data global (Organization + WebSite), estilo Banff */}
      <JsonLd data={[buildOrganizationEntity(), buildWebSiteEntity()]} />
      <div className="relative flex min-h-screen flex-col justify-between pb-24 md:pb-0">
        <Navbar />
        <main className="mb-auto pt-20">{children}</main>
        <Footer />
      </div>
      <MobileDock />
      <HubMenu showTrigger={false} />
    </SectionContainer>
  )
}

export default LayoutWrapper
