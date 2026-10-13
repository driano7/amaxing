// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Genera exports públicos derivados de la fuente de verdad (lib/knowledge).
// Uso: npm run knowledge:export  →  public/knowledge/*.json
// No hay mantenimiento manual: todo se deriva en cada ejecución.
// Usa esbuild (ya dependencia del repo) para resolver el alias @/ y ESM.
const fs = require('fs')
const path = require('path')
const os = require('os')

const root = path.join(__dirname, '..')
const outDir = path.join(root, 'public', 'knowledge')
fs.mkdirSync(outDir, { recursive: true })

async function main() {
  const esbuild = require(path.join(root, 'node_modules', 'esbuild'))
  const atAlias = {
    name: 'at-alias',
    setup(build) {
      build.onResolve({ filter: /^@\// }, (args) => {
        const base = path.join(root, args.path.slice(2))
        for (const cand of [base, `${base}.js`, `${base}.ts`, path.join(base, 'index.js')]) {
          try {
            if (fs.statSync(cand).isFile()) return { path: cand }
          } catch {
            /* probar siguiente */
          }
        }
        return { path: base, external: false }
      })
    },
  }
  const entry = `
import { getTourEntities, getGuideEntities, getMapEntities, getLocalPickEntities, getNeighborhoodEntities, getCategoryEntities, getPlaceEntities, getGraphMeta } from ${JSON.stringify(
    path.join(root, 'lib/knowledge/graph.js')
  )};
import * as service from ${JSON.stringify(path.join(root, 'lib/knowledge/service.js'))};
const dump = {
  tours: getTourEntities('all'),
  guides: getGuideEntities('all'),
  maps: getMapEntities('all'),
  picks: getLocalPickEntities('all'),
  neighborhoods: getNeighborhoodEntities('all'),
  categories: getCategoryEntities('all'),
  places: getPlaceEntities(),
  index: service.getGraphIndex(),
  meta: getGraphMeta(),
};
console.log(JSON.stringify(dump));
`
  const tmpEntry = path.join(os.tmpdir(), `Calpulli CDMX-kg-export-${Date.now()}.mjs`)
  fs.writeFileSync(tmpEntry, entry)
  try {
    const result = await esbuild.build({
      entryPoints: [tmpEntry],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18',
      write: false,
      plugins: [atAlias],
    })
    const tmpBundle = path.join(root, `.kg-bundle-${Date.now()}.cjs`)
    fs.writeFileSync(tmpBundle, result.outputFiles[0].text)
    try {
      const { execFileSync } = require('child_process')
      const json = execFileSync(process.execPath, [tmpBundle], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      })
      return JSON.parse(json)
    } finally {
      try {
        fs.unlinkSync(tmpBundle)
      } catch {
        /* noop */
      }
    }
  } finally {
    try {
      fs.unlinkSync(tmpEntry)
    } catch {
      /* noop */
    }
  }
}

function write(outDir, dump, name, payload) {
  const doc = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    meta: dump.meta,
    ...payload,
  }
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(doc, null, 2) + '\n')
  console.log(`wrote public/knowledge/${name}`)
}

main()
  .then((dump) => {
    write(outDir, dump, 'tours.json', {
      entity: 'tours',
      total: dump.tours.length,
      count: dump.tours.length,
      data: dump.tours,
    })
    write(outDir, dump, 'itineraries.json', {
      entity: 'itineraries',
      total: dump.guides.length,
      count: dump.guides.length,
      data: dump.guides,
    })
    write(outDir, dump, 'places.json', {
      entity: 'places',
      total: dump.places.length,
      count: dump.places.length,
      data: dump.places,
    })
    write(outDir, dump, 'neighborhoods.json', {
      entity: 'neighborhoods',
      total: dump.neighborhoods.length,
      count: dump.neighborhoods.length,
      data: dump.neighborhoods,
    })
    write(outDir, dump, 'index.json', {
      entity: 'index',
      counts: dump.index.counts,
      relationships: dump.index.relationships,
    })
    write(outDir, dump, 'taxonomies.json', {
      entity: 'taxonomies',
      data: { version: '1.0.0', note: 'Full taxonomies at /api/v1/metadata' },
    })
    write(outDir, dump, 'relationships.json', {
      entity: 'relationships',
      total: dump.index.relationships.length,
      count: dump.index.relationships.length,
      data: dump.index.relationships,
    })
    console.log(
      'done. maps/local-picks disponibles vía /api/knowledge/maps y /api/knowledge/local-picks'
    )
  })
  .catch((e) => {
    console.error('export-knowledge failed:', e.message)
    process.exit(1)
  })
