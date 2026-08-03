import siteMetadata from '@/data/siteMetadata'
import Logo from '@/data/jaguarColor.svg'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import { Navbar } from './Navbar'
import MobileNav from './MobileNav'
import { HeadingTypewriter } from './HeadingTypewriter'

const LayoutWrapper = ({ children }) => {
  return (
    <SectionContainer>
      <div className="relative flex h-screen flex-col justify-between">
        <Navbar />
        {/* Global typewriter animation for all headings in the blog */}
        <HeadingTypewriter />
        <main className="mb-auto pt-20">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
