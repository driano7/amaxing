import siteMetadata from '@/data/siteMetadata'
import Logo from '@/data/jaguarColor.svg'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import { Navbar } from './Navbar'
import MobileNav from './MobileNav'

const LayoutWrapper = ({ children }) => {
  return (
    <SectionContainer>
      <div className="relative flex h-screen flex-col justify-between">
        <Navbar />
        <main className="mb-auto pt-20">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
