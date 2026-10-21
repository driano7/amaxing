// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Comprueba que las utilidades de color que usa el proyecto existan de verdad
 * en el CSS generado.
 *
 *   npm run build && node scripts/check-tailwind-classes.mjs
 *
 * Motivo: Tailwind genera CSS por JIT a partir de lo que encuentra en el
 * codigo. Si una clase no existe (porque el valor no esta en la escala, o el
 * color no existe en esa version de Tailwind) NO se genera nada y el
 * elemento se queda sin la propiedad: no da error, simplemente no se ve.
 *
 * Esta clase de fallo es invisible en el codigo y solo se detecta mirando el
 * CSS resultante.
 */
import fs from 'node:fs'
import path from 'node:path'

const cssDir = 'public/.tmp-css'
const generated = path.join('.next/static/css')
const files = fs.readdirSync(generated).filter((f) => f.endsWith('.css'))
const css = files.map((f) => fs.readFileSync(path.join(generated, f), 'utf8')).join('\n')

const EXTS = ['.js', '.jsx', '.tsx', '.ts']
const ROOTS = ['components', 'pages', 'layouts', 'lib', 'data']

// Palabras que son nombres de propiedades CSS, no clases de Tailwind: el
// regex las puede encontrar dentro de strings de codigo.
const NOT_CLASSES = new Set([
  'border-radius',
  'border-color',
  'border-width',
  'border-style',
  'border-left',
  'border-right',
  'border-top',
  'border-bottom',
  'border-collapse',
  'text-align',
  'text-transform',
  'text-decoration',
  'text-overflow',
  'stroke-width',
  'stroke-linecap',
  'border-box',
  'placeholder-key',
  'text-underline-offset',
  'text-justify',
])

const hits = {}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!/node_modules|\.next/.test(full)) walk(full)
    } else if (EXTS.includes(path.extname(entry.name))) {
      const source = fs.readFileSync(full, 'utf8')
      const re =
        /(?:^|[\s"'`])((?:(?:dark|sm|md|lg|xl|2xl|hover|focus|focus-visible|active|group-hover|group-open|motion-reduce|print):)*(?:text|bg|border|from|via|to|ring|fill|stroke|divide|placeholder|decoration|shadow|accent|caret|outline)-[a-z0-9-]+)\b/g
      let m
      while ((m = re.exec(source))) {
        if (NOT_CLASSES.has(m[1])) continue
        hits[m[1]] = (hits[m[1]] || 0) + 1
      }
    }
  }
}
ROOTS.forEach((r) => fs.existsSync(r) && walk(r))

// Como aparece la clase en el CSS: .clase  con : y / escapados.
const escapeClass = (cls) => `.${cls.replace(/([:/])/g, '\\$1')}`

const dead = []
for (const [cls, count] of Object.entries(hits)) {
  if (!css.includes(escapeClass(cls))) dead.push([cls, count])
}
dead.sort((a, b) => b[1] - a[1])

console.log(`utilidades de color usadas en el codigo: ${Object.keys(hits).length}`)
console.log(`utilidades SIN css generado: ${dead.length}`)
dead.forEach(([cls, count]) => console.log(`  ${cls.padEnd(40)}${count}`))

if (dead.length) {
  console.log(
    '\nEstas clases no producen ningun estilo: revisa si el valor de opacidad existe en la escala o si el color existe en esta version de Tailwind.'
  )
  process.exit(1)
}
console.log('\nTodas las utilidades de color generan css.')
