// Manual note generation: npm run news:generate [locale] [count]
// locale: en | es (default en)  |  count: max 3 notes per day
const { generateNotes } = require('../lib/news-generators/autoNewsGenerator')

const locale = process.argv[2] || 'en'
const count = parseInt(process.argv[3] || '3', 10)

console.log(`Generating up to ${count} tourism notes (${locale})...`)

generateNotes(locale, count)
  .then((result) => {
    console.log('Done:', JSON.stringify(result, null, 2))
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
