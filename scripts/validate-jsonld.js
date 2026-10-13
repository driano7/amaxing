// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Audita JSON-LD generado: IDs estables, URLs canónicas, relaciones, consistencia.
// Uso: npm run validate:jsonld
// Exit 1 si encuentra errores.
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

function loadLib() {
  const esbuild = require(path.join(root, 'node_modules', 'esbuild'))
  const entry = `
export { buildTourEntity, buildItemListEntity, buildFAQPageEntity, buildBreadcrumbList, buildOrganizationEntity, buildWebSiteEntity, getSiteUrl } from ${JSON.stringify(
    path.join(root, 'lib/seo.js')
  )};
`
  const tmp = path.join(root, `.jsonld-entry-${Date.now()}.mjs`)
  fs.writeFileSync(tmp, entry)
  return esbuild
    .build({
      entryPoints: [tmp],
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node18',
      write: false,
    })
    .then((r) => {
      const tmpBundle = path.join(root, `.jsonld-bundle-${Date.now()}.mjs`)
      fs.writeFileSync(tmpBundle, r.outputFiles[0].text)
      return import(tmpBundle).then((mod) => {
        fs.unlinkSync(tmpBundle)
        return mod
      })
    })
    .finally(() => {
      try {
        fs.unlinkSync(tmp)
      } catch {
        /* noop */
      }
    })
}

function auditTours(lib) {
  const { tours } = require(path.join(root, 'data/toursData.js'))
  const errors = []
  const warnings = []
  const seenIds = new Set()

  for (const tour of tours) {
    const entity = lib.buildTourEntity(tour, 'en')

    if (entity['@context'] !== 'https://schema.org') {
      errors.push(`tour ${tour.id}: @context no es https://schema.org`)
    }
    if (!entity.name) errors.push(`tour ${tour.id}: name vacío`)
    if (!entity.description) errors.push(`tour ${tour.id}: description vacía`)
    if (!entity.url) errors.push(`tour ${tour.id}: url vacía`)
    if (entity.image === undefined) warnings.push(`tour ${tour.id}: sin image`)
    if (!entity.offers && tour.price) errors.push(`tour ${tour.id}: price existe pero offers no`)
    if (entity.offers && !entity.offers.price) errors.push(`tour ${tour.id}: offers sin price`)

    const canonicalPath = `/tours/${tour.id}`
    if (entity.url && !entity.url.endsWith(canonicalPath)) {
      errors.push(`tour ${tour.id}: url no termina en ${canonicalPath}`)
    }

    const key = `${entity['@type']}:${entity.url}`
    if (seenIds.has(key)) errors.push(`tour ${tour.id}: ID duplicado ${key}`)
    else seenIds.add(key)

    if (!entity.provider?.['@id']) {
      errors.push(`tour ${tour.id}: provider sin @id`)
    } else if (!entity.provider['@id'].endsWith('#organization')) {
      errors.push(`tour ${tour.id}: provider @id no apunta a organization`)
    }

    if (entity.duration && !/^PT\d+H/.test(entity.duration)) {
      errors.push(`tour ${tour.id}: duration no es ISO 8601 (${entity.duration})`)
    }

    if (tour.faq?.length) {
      const faq = lib.buildFAQPageEntity(tour.faq)
      if (!faq.mainEntity?.length) errors.push(`tour ${tour.id}: faq existe pero FAQPage vacío`)
      for (const q of faq.mainEntity) {
        if (!q.name || !q.acceptedAnswer?.text) {
          errors.push(`tour ${tour.id}: FAQ con pregunta o respuesta vacía`)
        }
      }
    }

    const bc = lib.buildBreadcrumbList([
      { name: 'Home', path: '/' },
      { name: 'Tours', path: '/tours' },
      { name: tour.title, path: `/tours/${tour.id}` },
    ])
    if (bc.itemListElement.length !== 3)
      errors.push(`tour ${tour.id}: breadcrumb con ${bc.itemListElement.length} items (esperado 3)`)
    const lastItem = bc.itemListElement[2]
    if (!lastItem.item?.endsWith(`/tours/${tour.id}`))
      errors.push(`tour ${tour.id}: breadcrumb no apunta a la URL canónica`)
  }

  const listItems = tours.map((t) => ({ name: t.title, url: `/tours/${t.id}` }))
  const itemList = lib.buildItemListEntity(listItems, 'Calpulli CDMX Tours')
  if (itemList.itemListElement.length !== tours.length) {
    errors.push(`ItemList tiene ${itemList.itemListElement.length} items, esperado ${tours.length}`)
  }
  const listUrls = new Set(itemList.itemListElement.map((i) => i.url))
  if (listUrls.size !== itemList.itemListElement.length)
    errors.push('ItemList tiene URLs duplicadas')

  const org = lib.buildOrganizationEntity()
  const site = lib.buildWebSiteEntity()
  if (!org['@id']) errors.push('Organization sin @id')
  if (!site['@id']) errors.push('WebSite sin @id')
  if (!org['@id']?.endsWith('#organization'))
    errors.push('Organization @id no termina en #organization')
  if (!site['@id']?.endsWith('#website')) errors.push('WebSite @id no termina en #website')

  return {
    errors,
    warnings,
    tourCount: tours.length,
    itemListCount: itemList.itemListElement.length,
  }
}

async function main() {
  const lib = await loadLib()
  const result = auditTours(lib)
  console.log(`JSON-LD audit: ${result.tourCount} tours, ${result.itemListCount} items en ItemList`)
  if (result.warnings.length) {
    console.log(`warnings (${result.warnings.length}):`)
    for (const w of result.warnings) console.log(`  - ${w}`)
  }
  if (result.errors.length) {
    console.error(`JSON-LD audit FAILED: ${result.errors.length} error(es)`)
    for (const e of result.errors) console.error(` - ${e}`)
    process.exit(1)
  }
  console.log('JSON-LD audit: OK')
}

main().catch((e) => {
  console.error('validate-jsonld failed:', e.message)
  process.exit(1)
})
