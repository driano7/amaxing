import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import { useLanguage } from '@/lib/hooks/useLanguage'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="mt-24 border-t border-zinc-200/50 dark:border-zinc-800/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400 sm:text-left">
            <div className="flex items-center justify-center space-x-2 sm:justify-start">
              <span>© {new Date().getFullYear()}</span>
              <span>•</span>
              <Link href="/" className="hover:text-orange-500">
                {siteMetadata.title}
              </Link>
            </div>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Hecho con <span className="text-red-500">❤</span> por:{' '}
              <a
                href="https://riano.netlify.app"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-orange-500 underline-offset-4 hover:underline"
              >
                Donovan Riaño
              </a>
            </p>
          </div>

          <div className="flex space-x-4">
            <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size="6" />
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
