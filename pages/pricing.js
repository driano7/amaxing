import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import Link from '@/components/Link'
import {
  Clock,
  Users,
  Gem,
  Compass,
  Star,
  Sparkles,
  MapPin,
  Wine,
  Crown,
  ConciergeBell,
} from 'lucide-react'

const pricingTiers = [
  {
    name: 'Basic Experience',
    price: '$250',
    description: 'Perfect for short cultural encounters',
    features: [
      { icon: Clock, text: 'Duration: 2-3 hours' },
      { icon: Users, text: '1-2 guests' },
      { icon: Gem, text: 'Basic amenities' },
      { icon: Compass, text: 'Local guide' },
    ],
  },
  {
    name: 'Premium Experience',
    price: '$450',
    description: 'Our most popular luxury tour option',
    features: [
      { icon: Clock, text: 'Duration: 4-6 hours' },
      { icon: Users, text: 'Up to 4 guests' },
      { icon: Star, text: 'Premium amenities' },
      { icon: Sparkles, text: 'Expert local guide' },
    ],
    featured: true,
  },
  {
    name: 'Private Experience',
    price: '$850',
    description: 'Fully customized private tour',
    features: [
      { icon: MapPin, text: 'Duration: Full day' },
      { icon: Users, text: 'Up to 6 guests' },
      { icon: Crown, text: 'VIP amenities' },
      { icon: ConciergeBell, text: 'Personal concierge' },
    ],
  },
]

export default function Pricing() {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="bg-white py-20 text-gray-900 dark:bg-black dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold md:text-5xl">Experience Pricing</h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-gray-300">
              Curated luxury tours designed for discerning travelers. Each experience includes
              expert guides, premium amenities, and authentic cultural immersion.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border transition-all duration-300 ${
                  tier.featured
                    ? 'border-orange-500 bg-zinc-100 shadow-xl shadow-orange-500/20 dark:bg-zinc-900'
                    : 'border-zinc-200 bg-white hover:border-orange-500/50 dark:border-white/10 dark:bg-zinc-900'
                }`}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                  <div className="mt-4 text-4xl font-extrabold text-orange-500">{tier.price}</div>
                  <p className="mt-4 text-zinc-500 dark:text-gray-400">{tier.description}</p>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature) => {
                      const Icon = feature.icon
                      return (
                        <li
                          key={feature.text}
                          className="flex items-start gap-2 text-zinc-600 dark:text-gray-300"
                        >
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                          <span>{feature.text}</span>
                        </li>
                      )
                    })}
                  </ul>
                  <Link
                    href="https://wa.me/525512291607"
                    className="mt-6 block w-full rounded-full bg-orange-500 py-3 text-center font-medium text-white transition-colors hover:bg-orange-600"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
