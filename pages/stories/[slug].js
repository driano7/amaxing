import Link from '@/components/Link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  Check,
  ArrowLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { PageSEO } from '@/components/SEO'

export default function StoryDetail({ story, locale }) {
  const { t, currentLanguage } = useLanguage()

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <PageSEO title={story.title} description={story.excerpt} />
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        {/* Hero Image */}
        <section className="relative h-[50vh] min-h-[350px]">
          <Image
            src={story.image}
            alt={story.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-6 pb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="max-w-3xl"
              >
                <div className="mb-4 flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium uppercase tracking-wider text-gray-200">
                    {locale === 'es' ? 'Historia' : 'Story'}
                  </span>
                </div>
                <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
                  {story.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-200">
                  {story.author && (
                    <div className="flex items-center gap-2">
                      {story.author.avatar && (
                        <Image
                          src={story.author.avatar}
                          alt={story.author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <span className="font-medium">{story.author.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
                  </div>
                  {story.readTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>{story.readTime}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-6 lg:py-24">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-zinc max-w-none leading-relaxed text-gray-700 dark:prose-invert dark:text-gray-300"
            >
              <div dangerouslySetInnerHTML={{ __html: story.content }} />
            </motion.div>

            {story.tags && story.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 border-t border-zinc-200 pt-8 dark:border-white/10"
              >
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600 transition-colors hover:bg-orange-500/20 hover:text-orange-500 dark:bg-white/5 dark:text-gray-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 border-t border-zinc-200 pt-8 dark:border-white/10"
            >
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 font-medium text-orange-500 hover:text-orange-400"
              >
                <ArrowLeft className="h-4 w-4" />
                {locale === 'es' ? 'Volver a Historias' : 'Back to Stories'}
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  // These would come from your CMS or data source
  const stories = [
    { id: 'hidden-cenotes-yucatan' },
    { id: 'oaxaca-night-markets' },
    { id: 'lost-temples-palenque' },
  ]

  return {
    paths: stories.map((s) => ({ params: { slug: s.id } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const slug = params?.slug

  // In production, fetch from CMS/API
  // For now, return mock data based on slug
  const storiesData = {
    'hidden-cenotes-yucatan': {
      id: 'hidden-cenotes-yucatan',
      title: 'Hidden Cenotes of the Yucatán',
      excerpt: 'Exploring secret swimming spots known only to locals.',
      content: `
        <p>Deep in the Yucatán Peninsula, beyond the tourist-packed cenotes of Ik Kil and Dos Ojos, lies a network of hidden swimming holes that few visitors ever discover.</p>
        <p>Our guide, Carlos, a third-generation Maya from a nearby pueblo, led us through dense jungle foliage. "The ancient Maya believed these were portals to Xibalba, the underworld," he explained as we descended a wooden ladder into the cool darkness.</p>
        <h2>The First Cenote: Sacred Waters</h2>
        <p>The first cenote we visited had no name on any map. Sunlight pierced through a narrow opening in the limestone ceiling, creating a turquoise beam that illuminated the crystalline water below. We were completely alone.</p>
        <p>The water was impossibly clear—visibility extended 50 meters down into the abyss. Small fish darted between submerged tree roots, and stalactites hung like chandeliers from the ceiling.</p>
        <h2>The Second Cenote: The Cathedral</h2>
        <p>A short walk through the jungle brought us to a massive cavern. The ceiling had collapsed millennia ago, creating a natural skylight the size of a tennis court. Vines cascaded down the walls like green curtains.</p>
        <p>"This is where the Maya came to pray for rain," Carlos said, his voice hushed. "You can still feel the energy."</p>
        <p>We swam in silence, the only sounds being our breathing and the distant drip of water echoing through the chamber.</p>
        <h2>Why This Matters</h2>
        <p>These hidden cenotes represent a Mexico that most travelers never see—one of mystery, spirituality, and raw natural beauty. They remind us that the most profound experiences often lie beyond the guidebook.</p>
        <blockquote>
          "The best journeys answer questions that in the beginning you didn't even think to ask." — Jeff Johnson
        </blockquote>
      `,
      image: 'https://images.unsplash.com/photo-1589652731220-a5a7d2b8b4b2?w=1200&q=80',
      author: {
        name: 'Sarah Mitchell',
      },
      publishedAt: '2024-01-15',
      readTime: '8 min read',
      tags: ['Yucatán', 'Cenotes', 'Adventure', 'Hidden Gems'],
    },
    'oaxaca-night-markets': {
      id: 'oaxaca-night-markets',
      title: "Oaxaca's Night Markets",
      excerpt: 'A culinary journey through the vibrant night markets of Oaxaca.',
      content: `
        <p>When the sun sets over Oaxaca's colonial center, the city transforms. The zócalo quiets down, but in the neighborhoods, a different energy awakens.</p>
        <p>We started at Mercado 20 de Noviembre, where the famous "pasillo de humo" (hall of smoke) fills the air with the scent of grilled meats. Tasajo, cecina, chorizo—each vendor has their specialty, their secret marinade passed down through generations.</p>
        <h2>Tlayudas: The Oaxacan Pizza</h2>
        <p>A massive, crispy tortilla spread with asiento (unrefined pork lard), black beans, quesillo (Oaxacan string cheese), avocado, and your choice of meat. Folded and grilled until the cheese pulls in impossibly long strands.</p>
        <p>"Mi abuela me enseñó," the vendor told us. "My grandmother taught me." She didn't need to say more. The flavor spoke for itself.</p>
        <h2>Beyond the Food</h2>
        <p>The night markets aren't just about eating. They're community gatherings. Families share tables. Strangers become friends over shared plates of chapulines (grasshoppers) and mezcal tastings.</p>
        <p>We ended the night at a tiny mezcalería tucked behind an unmarked door. The mezcalero poured three expressions: a bright, citrusy espadín; a smoky, complex tobala; and a rare, wild tepeztate that tasted of earth and lightning.</p>
        <blockquote>
          "Oaxaca doesn't just feed your body. It feeds your soul." — Our guide, Miguel
        </blockquote>
      `,
      image: 'https://images.unsplash.com/photo-1550966871-3ed3-cafe8e9d5c7?w=1200&q=80',
      author: {
        name: 'Carlos Mendoza',
      },
      publishedAt: '2024-02-20',
      readTime: '10 min read',
      tags: ['Oaxaca', 'Food', 'Markets', 'Mezcal', 'Culture'],
    },
    'lost-temples-palenque': {
      id: 'lost-temples-palenque',
      title: 'The Lost Temples of Palenque',
      excerpt: 'Venturing deep into the jungle to discover Mayan ruins.',
      content: `
        <p>At 6 AM, the gates of Palenque open to a handful of early visitors. The morning mist clings to the Temple of the Inscriptions, and howler monkeys roar from the canopy above.</p>
        <p>Unlike Chichén Itzá or Tulum, Palenque feels discovered rather than visited. Only about 10% of the city has been excavated; the rest sleeps under centuries of jungle growth.</p>
        <h2>The Palace: A Royal Residence</h2>
        <p>The Palace complex sprawls across a massive artificial platform. Its most distinctive feature—a four-story tower—served as an astronomical observatory. From here, Maya priests tracked Venus and planned agricultural cycles.</p>
        <p>We climbed the narrow stairs, emerging onto a platform with 360-degree views of the jungle. In every direction, green mounds hinted at pyramids yet to be uncovered.</p>
        <h2>The Temple of the Cross Group</h2>
        <p>Three temples form a sacred triad: the Temple of the Cross, Temple of the Foliated Cross, and Temple of the Sun. Each houses a sanctuary panel depicting the maize god's rebirth—a metaphor for the agricultural cycle that sustained Maya civilization.</p>
        <p>The carvings are astonishingly well-preserved. Glyphs record the accession of King Pakal the Great in 615 AD and his 68-year reign, one of the longest in Maya history.</p>
        <h2>Pakal's Tomb</h2>
        <p>Deep within the Temple of the Inscriptions lies the tomb of Pakal. Discovered in 1952 by Alberto Ruz Lhuillier, it remains one of archaeology's greatest finds. The sarcophagus lid—often misinterpreted as an "astronaut"—actually depicts Pakal's descent into Xibalba and his rebirth as the maize god.</p>
        <p>We couldn't enter the tomb (it's closed for preservation), but standing at the base of the temple, knowing what lies beneath, was profound.</p>
        <blockquote>
          "The Maya didn't build pyramids to be seen. They built them to be experienced." — Archaeologist's note
        </blockquote>
      `,
      image: 'https://images.unsplash.com/photo-1578662996442-9db785d1c6fd?w=1200&q=80',
      author: {
        name: 'Dr. Elena Ruiz',
      },
      publishedAt: '2024-03-10',
      readTime: '12 min read',
      tags: ['Palenque', 'Maya', 'Archaeology', 'History', 'Jungle'],
    },
  }

  const story = storiesData[slug]

  if (!story) {
    return { notFound: true }
  }

  return {
    props: {
      story,
      locale: 'en',
    },
    revalidate: 3600,
  }
}
