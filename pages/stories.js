import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import Image from '@/components/Image'

const stories = [
  {
    title: 'Hidden Cenotes of the Yucatán',
    excerpt: 'Exploring secret swimming spots known only to locals.',
    image: 'https://images.unsplash.com/photo-1589652731220-a5a7d2b8b4b2',
  },
  {
    title: "Oaxaca's Night Markets",
    excerpt: 'A culinary journey through the vibrant night markets of Oaxaca.',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3-cafe8e9d5c7',
  },
  {
    title: 'The Lost Temples of Palenque',
    excerpt: 'Venturing deep into the jungle to discover Mayan ruins.',
    image: 'https://images.unsplash.com/photo-1578662996442-9db785d1c6fd',
  },
]

export default function Stories() {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="bg-zinc-950 py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Traveler Stories</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            Real stories from real travelers experiencing the magic of Mexico with Amaxing.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
            {stories.map((story) => (
              <div key={story.title} className="group">
                <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={`${story.image}?w=800&q=80`}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-500">
                  {story.title}
                </h3>
                <p className="mt-2 text-gray-300">{story.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
