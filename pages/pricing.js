import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import Link from '@/components/Link'

const pricingTiers = [
  {
    name: 'Basic Experience',
    price: '$250',
    description: 'Perfect for short cultural encounters',
    features: ['Duration: 2-3 hours', '1-2 guests', 'Basic amenities', 'Local guide'],
  },
  {
    name: 'Premium Experience',
    price: '$450',
    description: 'Our most popular luxury tour option',
    features: ['Duration: 4-6 hours', 'Up to 4 guests', 'Premium amenities', 'Expert local guide'],
    featured: true,
  },
  {
    name: 'Private Experience',
    price: '$850',
    description: 'Fully customized private tour',
    features: ['Duration: Full day', 'Up to 6 guests', 'VIP amenities', 'Personal concierge'],
  },
]

export default function Pricing() {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="bg-black py-20 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold md:text-5xl">Experience Pricing</h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-300">
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
                    ? 'border-orange-500 bg-zinc-900 shadow-xl shadow-orange-500/20'
                    : 'border-white/10 bg-zinc-900 hover:border-orange-500/50'
                }`}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                  <div className="mt-4 text-4xl font-extrabold text-orange-500">{tier.price}</div>
                  <p className="mt-4 text-gray-400">{tier.description}</p>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-300">
                        ✓ {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="https://wa.me/525512291607"
                    className="mt-6 block w-full rounded-full bg-orange-500 py-3 text-center font-medium text-gray-900 transition-colors hover:bg-orange-600 dark:text-white"
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
