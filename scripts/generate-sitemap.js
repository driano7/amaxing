const fs = require('fs')
const globby = require('globby')
const matter = require('gray-matter')
const prettier = require('prettier')
const siteMetadata = require('../data/siteMetadata')

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

;(async () => {
  const prettierConfig = await prettier.resolveConfig('./.prettierrc.js')

  // Rutas estáticas (pages + blog mdx + tags)
  const pages = await globby([
    'pages/*.js',
    'pages/*.tsx',
    'data/blog/**/*.mdx',
    'data/blog/**/*.md',
    'public/tags/**/*.xml',
    '!pages/_*.js',
    '!pages/_*.tsx',
    '!pages/api',
  ])

  // Rutas dinámicas (tour catalog desde toursData)
  let { tours = [] } = {}
  try {
    const toursData = require('../data/toursData')
    tours = toursData.tours || []
  } catch {
    tours = []
  }
  const tourRoutes = tours.map((tour) => ({ slug: String(tour.id) }))

  // Experiencias y stories (globy de mdx en data/)
  const mdxSubRoutes = await globby(['data/experiences/**/*.mdx', 'data/stories/**/*.mdx'])

  const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${pages
              .map((page) => {
                if (page.search('.md') >= 1 && fs.existsSync(page)) {
                  const source = fs.readFileSync(page, 'utf8')
                  const fm = matter(source)
                  if (fm.data.draft) return
                  if (fm.data.canonicalUrl) return
                }
                const path = page
                  .replace('pages/', '/')
                  .replace('data/blog', '/blog')
                  .replace('public/', '/')
                  .replace('.js', '')
                  .replace('.tsx', '')
                  .replace('.mdx', '')
                  .replace('.md', '')
                  .replace('/feed.xml', '')
                const route = path === '/index' ? '' : path

                if (page.search('pages/404.') > -1 || page.search(`pages/blog/[...slug].`) > -1) {
                  return
                }
                return `
                        <url>
                            <loc>${siteMetadata.siteUrl}${route}</loc>
                        </url>
                    `
              })
              .join('')}
            ${tourRoutes
              .map(
                (tour) => `
                        <url>
                            <loc>${siteMetadata.siteUrl}/tours/${tour.slug}</loc>
                        </url>
                    `
              )
              .join('')}
            ${mdxSubRoutes
              .map((page) => {
                const source = fs.readFileSync(page, 'utf8')
                const fm = matter(source)
                if (fm.data.draft) return
                const slug = page
                  .split('/')
                  .pop()
                  .replace(/\.(mdx|md)$/, '')
                const base = page.indexOf('data/experiences/') > -1 ? '/experiences' : '/stories'
                return `
                        <url>
                            <loc>${siteMetadata.siteUrl}${base}/${slug}</loc>
                        </url>
                    `
              })
              .join('')}
        </urlset>
    `

  const formatted = prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  })

  // eslint-disable-next-line no-sync
  fs.writeFileSync('public/sitemap.xml', formatted)
})()
