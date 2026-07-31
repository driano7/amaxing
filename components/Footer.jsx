import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import { useTranslation } from '@/lib/hooks/useTranslationClient'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span>© {new Date().getFullYear()}</span>
              <span>•</span>
              <Link href="/" className="hover:text-orange-500">
                {siteMetadata.title}
              </Link>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              Hecho con <span className="text-red-500">❤</span> por:{' '}
              <a
                href="https://linkedin.com/in/donovanriano"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-orange-500 underline-offset-4 hover:underline"
              >
                Donovan Riaño
              </a>
            </p>
          </div>

          <div className="flex space-x-4">
            <SocialIcon kind="ethereum" href={siteMetadata.ethereum} size="6" />
            <SocialIcon kind="bitcoin" href={siteMetadata.bitcoin} size="6" />
            <SocialIcon kind="telegram" href={siteMetadata.telegram} size="6" />
            <SocialIcon kind="whatsapp" href={siteMetadata.whatsapp} size="6" />
            <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size="6" />
            <SocialIcon kind="tiktok" href={siteMetadata.tiktok} size="6" />
            <SocialIcon kind="instagram" href={siteMetadata.instagram} size="6" />
            <SocialIcon kind="facebook" href={siteMetadata.facebook} size="6" />
            <SocialIcon kind="twitter" href={siteMetadata.twitter} size="6" />
            <SocialIcon kind="youtube" href={siteMetadata.youtube} size="6" />
          </div>
        </div>
      </div>
    </footer>
  )
}
