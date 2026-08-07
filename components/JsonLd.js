import Head from 'next/head'
import { normalizeJsonLdInput, serializeJsonLd } from '@/lib/seo'

// Inyecta bloques de JSON-LD (structured data) en el <head>, estilo Banff.
const JsonLd = ({ data }) => {
  const blocks = normalizeJsonLdInput(data)
  return (
    <Head>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(block) }}
        />
      ))}
    </Head>
  )
}

export default JsonLd
