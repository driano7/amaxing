import siteMetadata from '@/data/siteMetadata'
import Logo from '@/data/jaguarColor.svg'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import { Navbar } from './Navbar'
import { MobileDock } from './MobileDock'

const LayoutWrapper = ({ children }) => {
  return (
    <SectionContainer>
      <div className="relative flex min-h-screen flex-col justify-between pb-24 md:pb-0">
        <Navbar />
        <main className="mb-auto pt-20">{children}</main>
        <Footer />
      </div>
      <MobileDock />
    </SectionContainer>
  )
}

export default LayoutWrapper
