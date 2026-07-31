import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import Image from '@/components/Image'

const experiences = [
  {
    title: 'Sacred Temazcal Ceremony',
    excerpt: 'Ancient purification ritual in a traditional temazcal with a shaman guide.',
    price: '$350',
    duration: '4 hours',
    image: 'https://images.unsplash.com/photo-1581091012172-8a9d4a6f4d7d',
  },
  {
    title: 'VIP Sian Kaán Biosphere Tour',
    excerpt: 'Private boat tour through the UNESCO World Heritage reef lagoon.',
    price: '$650',
    duration: '6 hours',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  },
  {
    title: 'Culinary Secrets of Oaxaca',
    excerpt: 'Hands-on cooking class with local grandmothers and market tour.',
    price: '$450',
    duration: '5 hours',
    image: 'https://images.unsplash.com/photo-1550966650-04de4a29e9c1',
  },
]

export default function Experiences() {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="bg-zinc-950 py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Curated Experiences</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            Handpicked journeys that transcend the ordinary and reveal the authentic heart of
            Mexico.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {experiences.map((experience) => (
              <div
                key={experience.title}
                className="group rounded-xl border border-white/10 bg-zinc-900 transition-all duration-300 hover:border-orange-500/30"
              >
                <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                  <Image
                    src={`${experience.image}?w=800&q=80`}
                    alt={experience.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-500">
                    {experience.title}
                  </h3>
                  <p className="mt-2 text-gray-300">{experience.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-500">{experience.price}</span>
                    <span className="text-sm text-gray-400">{experience.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
