import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import Link from '@/components/Link'

const contactMethods = [
  {
    title: 'WhatsApp',
    description: 'Send us a message directly',
    href: 'https://wa.me/525512291607',
    icon: '💬',
  },
  {
    title: 'Email',
    description: 'Get in touch via email',
    href: `mailto:${siteMetadata.email}`,
    icon: '📧',
  },
  {
    title: 'Telegram',
    description: 'Join our Telegram community',
    href: siteMetadata.telegram,
    icon: '📱',
  },
]

export default function Contact() {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="bg-zinc-950 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold text-white md:text-5xl">Contact Us</h1>
            <p className="mt-4 text-lg text-gray-300">
              Ready to plan your luxury Mexican adventure? Reach out to us and we'll craft the
              perfect itinerary for you.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6">
              {contactMethods.map((method) => (
                <Link
                  key={method.title}
                  href={method.href}
                  className="flex items-center gap-6 rounded-xl border border-white/10 bg-zinc-900 p-6 transition-colors hover:border-orange-500/30"
                >
                  <div className="text-3xl">{method.icon}</div>
                  <div>
                    <h3 className="font-bold text-white">{method.title}</h3>
                    <p className="text-gray-400">{method.description}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="mb-4 text-2xl font-bold text-white">Office Hours</h2>
              <div className="text-gray-300">
                <p>Monday - Friday: 9:00 AM - 7:00 PM (CST)</p>
                <p>Saturday: 10:00 AM - 4:00 PM (CST)</p>
                <p>Sunday: Closed (Emergency support available)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
