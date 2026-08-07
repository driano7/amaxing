// Manual note generation: npm run news:generate [count]
// Genera hasta `count` notas bilingües (en+es) con UN solo request de OpenRouter
// (patrón EarningsAI). Límite: 3 notas por mes.
const { generateNotes } = require('../lib/news-generators/autoNewsGenerator')

const count = parseInt(process.argv[2] || '3', 10)

console.log(`Generating up to ${count} bilingual tourism notes (single OpenRouter request)...`)

generateNotes('en', count)
  .then((result) => {
    console.log('Done:', JSON.stringify(result, null, 2))
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
