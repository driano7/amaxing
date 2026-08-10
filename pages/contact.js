import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import Link from '@/components/Link'
import { MessageCircle, Mail, Send, Clock, HeartHandshake } from 'lucide-react'

const contactMethods = [
  {
    title: 'WhatsApp',
    description: 'Send us a message directly',
    href: 'https://wa.me/525512291607',
    icon: MessageCircle,
    accent: '#25D366',
  },
  {
    title: 'Email',
    description: 'Get in touch via email',
    href: `mailto:${siteMetadata.email}`,
    icon: Mail,
    accent: '#DE1D8D',
  },
  {
    title: 'Telegram',
    description: 'Join our Telegram community',
    href: siteMetadata.telegram,
    icon: Send,
    accent: '#26A5E4',
  },
]

const officeHours = [
  { days: 'Monday - Friday', hours: '9:00 AM - 7:00 PM (CST)' },
  { days: 'Saturday', hours: '10:00 AM - 4:00 PM (CST)' },
  { days: 'Sunday', hours: 'Closed (Emergency support available)' },
]

export default function Contact() {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="bg-white py-20 dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <section
            className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl px-6 py-12 text-white shadow-2xl"
            style={{
              background:
                'linear-gradient(135deg, #DE1D8D 0%, #BE1588 25%, #9F0E7F 50%, #7B2BD9 75%, #6A0568 100%)',
            }}
          >
            <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="bg-white/15 flex h-14 w-14 items-center justify-center rounded-full text-3xl backdrop-blur-sm">
                  <HeartHandshake className="h-7 w-7" aria-hidden />
                </span>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
                  Contact Us
                </h1>
                <p className="max-w-lg text-lg font-medium leading-relaxed text-white/90">
                  Ready to plan your luxury Mexican adventure? Reach out to us and we'll craft the
                  perfect itinerary for you.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {contactMethods.map((method) => {
                  const MethodIcon = method.icon
                  return (
                    <Link
                      key={method.title}
                      href={method.href}
                      className="bg-black/15 flex flex-col items-center gap-3 rounded-2xl p-5 text-center backdrop-blur-sm transition-all duration-300 hover:bg-black/20 sm:flex-row sm:gap-4 sm:text-left"
                    >
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/25"
                        style={{ color: method.accent }}
                      >
                        <MethodIcon className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="font-bold text-white">{method.title}</h3>
                        <p className="text-sm text-white/80">{method.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="bg-black/15 flex flex-col gap-3 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white">
                    <Clock className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
                    Office Hours
                  </span>
                </div>
                <div className="flex flex-col gap-2 text-sm text-white/80">
                  {officeHours.map((slot) => (
                    <div key={slot.days} className="flex justify-between gap-3">
                      <span className="font-semibold text-white/90">{slot.days}</span>
                      <span className="text-right">{slot.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
