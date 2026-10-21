// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Comprobaciones automaticas del Journey Chapultepec sobre la pagina ya
 * servida (no necesita la red).
 *
 *   node scripts/check-journey.mjs [url]
 *
 * Revisa:
 *  - errores de consola y de red
 *  - scroll horizontal involuntario en movil, tablet y escritorio
 *  - presencia de alt en todas las imagenes
 *  - jerarquia de encabezados
 *  - que el contenido principal este en el HTML (no solo tras clicar)
 *  - foco visible y navegacion por teclado en el indice de capitulos
 */
// Playwright no es dependencia del proyecto (se usa solo para verificar).
// Se instala aparte:  npm i -D playwright && npx playwright install chromium
let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  console.error(
    'playwright no esta instalado. Para correr esta comprobacion:\n' +
      '  npm i -D playwright && npx playwright install chromium'
  )
  process.exit(2)
}

const URL = process.argv[2] || 'http://localhost:3000/journeys/chapultepec'

// Frases que deben estar en el HTML de cada journey: comprueban que el
// contenido narrativo no dependa de que el script se ejecute.
const CONTENT_BY_SLUG = {
  chapultepec: [
    'In xochitl',
    'changuito mión',
    'A los defensores de la Patria',
    'no está demostrado por una fuente sólida',
    'es una relación de tradición',
  ],
  centro: [
    'Katharsis',
    'Lenin',
    '1629',
    'no están enfrentados',
    'Interpretación de Amaxing',
    'República de Uruguay 75',
  ],
}
const slug = (process.argv[3] || 'chapultepec').toLowerCase()
const failures = []
const notes = []

function check(ok, label, detail = '') {
  if (ok) {
    notes.push(`ok   ${label}`)
  } else {
    failures.push(`FALLA ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

const consoleErrors = []
const failedRequests = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`))
page.on('requestfailed', (req) => {
  failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`)
})
page.on('response', (res) => {
  if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`)
})

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(800)

// --- 1. Consola y red ---
check(consoleErrors.length === 0, 'sin errores de consola', consoleErrors.join(' | '))
check(failedRequests.length === 0, 'sin recursos fallidos', failedRequests.slice(0, 4).join(' | '))

// --- 2. Scroll horizontal en tres anchos ---
for (const viewport of [
  { name: 'movil 375', width: 375, height: 780 },
  { name: 'tablet 768', width: 768, height: 1024 },
  { name: 'escritorio 1440', width: 1440, height: 900 },
]) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height })
  await page.waitForTimeout(350)
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    return {
      scroll: doc.scrollWidth,
      client: doc.clientWidth,
      offenders: Array.from(document.querySelectorAll('body *'))
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 0 && r.right > doc.clientWidth + 1
        })
        .slice(0, 3)
        .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`),
    }
  })
  check(
    overflow.scroll <= overflow.client + 1,
    `sin scroll horizontal en ${viewport.name}`,
    `scroll=${overflow.scroll} client=${overflow.client} culpables=${overflow.offenders.join(',')}`
  )
}

// --- 3. Imagenes: alt y dimensiones ---
await page.setViewportSize({ width: 1440, height: 900 })
await page.waitForTimeout(300)
const images = await page.evaluate(() =>
  Array.from(document.images).map((img) => ({
    src: img.currentSrc || img.src,
    alt: img.getAttribute('alt'),
    hasAttr: img.hasAttribute('alt'),
    w: img.naturalWidth,
  }))
)
const sinAlt = images.filter((i) => !i.hasAttr)
check(
  sinAlt.length === 0,
  'todas las imagenes tienen atributo alt',
  sinAlt.map((i) => i.src).join(' | ')
)
const rotas = images.filter((i) => i.w === 0)
check(rotas.length === 0, 'ninguna imagen rota', rotas.map((i) => i.src).join(' | '))
notes.push(`     imagenes: ${images.length}`)

// --- 4. Jerarquia de encabezados ---
const headings = await page.evaluate(() =>
  Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h) => Number(h.tagName[1]))
)
let salto = null
for (let i = 1; i < headings.length; i += 1) {
  if (headings[i] - headings[i - 1] > 1) {
    salto = `de h${headings[i - 1]} a h${headings[i]}`
    break
  }
}
check(!salto, 'jerarquia de encabezados sin saltos', salto || '')
const h1 = await page.locator('h1').count()
check(h1 === 1, 'exactamente un h1', `h1=${h1}`)

// --- 5. El contenido esta en el HTML sin interactuar ---
const html = await page.content()
for (const texto of CONTENT_BY_SLUG[slug] || CONTENT_BY_SLUG.chapultepec) {
  check(html.includes(texto), `contenido en el HTML: "${texto.slice(0, 34)}"`)
}

// --- 6. Navegacion por teclado: el indice de capitulos ---
const linkCap = page.locator('nav[aria-label*="Cap"] a').first()
const tieneNav = (await linkCap.count()) > 0
if (tieneNav) {
  await linkCap.focus()
  const focoVisible = await page.evaluate(() => {
    const el = document.activeElement
    if (!el) return false
    const s = getComputedStyle(el)
    return Boolean(s.outlineWidth && s.outlineWidth !== '0px') || s.boxShadow !== 'none'
  })
  check(focoVisible, 'el enlace del capitulo muestra foco al recibirlo')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(600)
  const hash = await page.evaluate(() => window.location.hash)
  check(hash.length > 1, 'el enlace salta al capitulo', hash)
} else {
  notes.push('     (indice de capitulos en version movil: se omite la prueba de foco)')
}

// --- 7. Steps accesibles con <details> ---
const details = await page.locator('details').count()
check(details > 0, 'los pasos usan details nativo', `details=${details}`)
const cerrados = await page.evaluate(() => {
  const d = Array.from(document.querySelectorAll('details'))
  const cerrado = d.find((x) => !x.open)
  if (!cerrado) return null
  return cerrado.textContent.length
})
check(cerrados === null || cerrados > 40, 'el contenido cerrado sigue en el DOM', `len=${cerrados}`)

await browser.close()

console.log(notes.join('\n'))
if (failures.length) {
  console.log('\n' + failures.join('\n'))
  console.log(`\n${failures.length} fallo(s)`)
  process.exit(1)
}
console.log(`\n${notes.length} comprobaciones ok, 0 fallos`)
