import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div className="mb-1 flex space-x-4">
          <SocialIcon kind="ethereum" href={siteMetadata.ethereum} size="6" />
          <SocialIcon kind="bitcoin" href={siteMetadata.bitcoin} size="6" />
        </div>
        <div className="mb-3 flex space-x-4">
          <SocialIcon kind="telegram" href={siteMetadata.telegram} size="6" />
          <SocialIcon kind="whatsapp" href={siteMetadata.whatsapp} size="6" />
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size="6" />
          <SocialIcon kind="tiktok" href={siteMetadata.tiktok} size="6" />
          <SocialIcon kind="instagram" href={siteMetadata.instagram} size="6" />
          <SocialIcon kind="facebook" href={siteMetadata.facebook} size="6" />
          <SocialIcon kind="twitter" href={siteMetadata.twitter} size="6" />
          <SocialIcon kind="youtube" href={siteMetadata.youtube} size="6" />
        </div>
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{siteMetadata.author}</div>
          <div>{` • `}</div>
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{` • `}</div>
          <Link href="/">{siteMetadata.title}</Link>
        </div>
        <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <Link href="https://linktr.ee/donovan_amx">Linktree</Link>
        </div>
      </div>
    </footer>
  )
}
