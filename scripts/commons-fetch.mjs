// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Descarga de las fotografias verificadas del Journey "Chapultepec" y genera
 * el archivo de creditos.
 *
 *   node scripts/commons-fetch.mjs
 *
 * El manifiesto de abajo es la lista de archivos de Wikimedia Commons cuya
 * ficha se reviso (que representa realmente el lugar indicado, licencia
 * compatible y atribucion disponible). La licencia y el autor se leen de la
 * propia API en el momento de la descarga, no se escriben a mano: el CREDITS.md
 * que se genera sale de los metadatos reales.
 *
 * Las imagenes se guardan en public/static/images/journeys/chapultepec/ para
 * poder servirse con next/image (optimizadas y responsive) sin depender de un
 * host externo.
 */
import fs from 'node:fs'
import path from 'node:path'

const UA = 'AmaxingJourneyBuilder/1.0 (educational cultural site; local dev)'
const API = 'https://commons.wikimedia.org/w/api.php'
const DEST = path.resolve('public/static/images/journeys/chapultepec')

/** Archivo de Commons -> nombre local. */
const MANIFEST = [
  {
    file: 'File:Estación Chapultepec del Metro de la Ciudad de México 02.jpg',
    local: 'metro-chapultepec.jpg',
    place: 'Metro Chapultepec',
  },
  {
    file: 'File:Puerta de los leones en Chapultepec 5.jpg',
    local: 'puerta-de-los-leones.jpg',
    place: 'Puerta de los Leones',
  },
  {
    file: 'File:Bosque de Chapultepec IMG 8516 (25262610094).jpg',
    local: 'calzada-juventud-heroica.jpg',
    place: 'Calzada Juventud Heroica (acceso peatonal)',
  },
  {
    file: 'File:Monumento a los Niños Heroes - Mexico 2024.jpg',
    local: 'altar-a-la-patria.jpg',
    place: 'Altar a la Patria',
  },
  {
    file: 'File:Escultura central Altar a la Patria.jpg',
    local: 'altar-escultura-central.jpg',
    place: 'Altar a la Patria, escultura central',
  },
  {
    file: 'File:Audiorama de Chapultepec 1.jpg',
    local: 'audiorama.jpg',
    place: 'Audiorama',
  },
  {
    file: 'File:Audiorama de Chapultepec 3.jpg',
    local: 'cincalco-acceso.jpg',
    place: 'Acceso a la cueva conocida como Cincalco',
  },
  {
    file: 'File:Baños de Moctezuma 35.JPG',
    local: 'banos-de-moctezuma.jpg',
    place: 'Baños de Moctezuma',
  },
  {
    file: 'File:Escalinatas históricas en Baños de Moctezuma - Primera Sección del Bosque de Chapultepec - 6.jpg',
    local: 'banos-de-moctezuma-escalinatas.jpg',
    place: 'Baños de Moctezuma, escalinatas',
  },
  {
    file: 'File:Castillo de Chapultepec exterior.jpg',
    local: 'castillo-exterior.jpg',
    place: 'Castillo de Chapultepec, fachada',
  },
  {
    file: 'File:Vista aérea del Castillo de Chapultepec 1.jpg',
    local: 'castillo-aereo.jpg',
    place: 'Castillo de Chapultepec, vista aérea',
  },
  {
    file: 'File:Castillo de Chapultepec de día.jpg',
    local: 'castillo-de-dia.jpg',
    place: 'Castillo de Chapultepec',
  },
  {
    file: 'File:Lago Mayor de Chapultepec - 2.jpg',
    local: 'lago-chapultepec.jpg',
    place: 'Lago de Chapultepec',
  },
  {
    file: 'File:Bosque de Chapultepec Arboles.jpg',
    local: 'bosque-arboles.jpg',
    place: 'Bosque de Chapultepec',
  },
]

const strip = (v) =>
  String(v || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

async function fetchInfo(titles) {
  const params = new URLSearchParams({
    action: 'query',
    titles: titles.join('|'),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '1800',
    format: 'json',
  })
  const res = await fetch(`${API}?${params.toString()}`, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`API HTTP ${res.status}`)
  const data = await res.json()
  return Object.values(data?.query?.pages || {})
}

function creditsFor(title, entry) {
  const meta = entry.extmetadata || {}
  return {
    license: strip(meta.LicenseShortName?.value) || 'SIN LICENCIA',
    licenseUrl: strip(meta.LicenseUrl?.value) || '',
    author: strip(meta.Artist?.value) || 'Autor no indicado en Commons',
    description: strip(meta.ImageDescription?.value) || '',
    date: strip(meta.DateTimeOriginal?.value) || '',
    source: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  }
}

fs.mkdirSync(DEST, { recursive: true })

// Una consulta por archivo: el endpoint con titulos unidos por '|' es fragile
// con nombres largos y acentos, y asi cada problema se reporta por separado.
const byTitle = new Map()
for (const item of MANIFEST) {
  // Commons limita por caudal: se reintenta con espera creciente.
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      await new Promise((r) => setTimeout(r, 2000 * attempt))
      const [page] = await fetchInfo([item.file])
      if (page && page.imageinfo) {
        byTitle.set(page.title, page)
        break
      }
      if (page) {
        console.error(`sin imageinfo: ${item.file}`)
        break
      }
    } catch (error) {
      console.error(`consulta fallida ${item.file} (intento ${attempt}): ${error.message}`)
    }
  }
}

const credits = []
const problems = []

for (const item of MANIFEST) {
  const page = byTitle.get(item.file)
  const info = page?.imageinfo?.[0]

  if (!info) {
    problems.push(`${item.file}: no encontrada en Commons`)
    continue
  }

  const meta = creditsFor(page.title, info)
  if (meta.license === 'SIN LICENCIA') {
    problems.push(`${item.file}: sin licencia declarada, no se descarga`)
    continue
  }

  const url = info.thumburl || info.url
  let res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) {
    await new Promise((r) => setTimeout(r, 4000))
    res = await fetch(url, { headers: { 'User-Agent': UA } })
  }
  if (!res.ok) {
    problems.push(`${item.file}: descarga HTTP ${res.status}`)
    continue
  }

  const target = path.join(DEST, item.local)
  const buffer = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(target, buffer)

  credits.push({
    file: item.local,
    place: item.place,
    commons: meta.source,
    license: meta.license,
    licenseUrl: meta.licenseUrl,
    author: meta.author,
    date: meta.date,
    description: meta.description,
  })

  console.log(`ok  ${item.local}  ${meta.license}  ${(buffer.length / 1024).toFixed(0)} kB`)
}

// CREDITS.md
const lines = [
  '# Créditos fotográficos — Journey Chapultepec',
  '',
  'Todas las imágenes de este Journey provienen de Wikimedia Commons y se',
  'redistribuyen localmente para poder servirse optimizadas con `next/image`.',
  'La licencia y el autor se leyeron de la ficha de Commons en el momento de la',
  'descarga (ver `scripts/commons-fetch.mjs`).',
  '',
  '| Archivo local | Lugar | Licencia | Autor | Origen |',
  '| --- | --- | --- | --- | --- |',
  ...credits.map(
    (c) =>
      `| \`${c.file}\` | ${c.place} | ${c.license}${
        c.licenseUrl ? ` ([texto](${c.licenseUrl}))` : ''
      } | ${c.author} | [Commons](${c.commons}) |`
  ),
  '',
  '## Detalle por imagen',
  '',
  ...credits.flatMap((c) => [
    `### \`${c.file}\``,
    '',
    `- Lugar: ${c.place}`,
    `- Licencia: ${c.license}${c.licenseUrl ? ` — ${c.licenseUrl}` : ''}`,
    `- Autor: ${c.author}`,
    c.date ? `- Fecha: ${c.date}` : null,
    `- Ficha en Commons: ${c.commons}`,
    c.description ? `- Descripcion en Commons: ${c.description}` : null,
    '',
  ]),
].filter((l) => l !== null)

fs.writeFileSync(path.join(DEST, 'CREDITS.md'), lines.join('\n'))

console.log(`\n${credits.length} imagenes descargadas -> ${path.relative(process.cwd(), DEST)}`)
if (problems.length) {
  console.log('\nPendientes:')
  problems.forEach((p) => console.log(`  - ${p}`))
}
