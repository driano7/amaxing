import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const notesDir = path.join(process.cwd(), 'data', 'notes')

export function getNoteFiles() {
  if (!fs.existsSync(notesDir)) return []
  return fs
    .readdirSync(notesDir)
    .filter((file) => file.endsWith('.mdx'))
    .sort()
    .reverse()
}

export function noteSlugFromFile(file) {
  return file.replace(/\.(en|es)\.mdx$/, '')
}

export function noteLocaleFromFile(file) {
  const match = file.match(/\.(en|es)\.mdx$/)
  return match ? match[1] : 'en'
}

export function getAllNotes(locale = 'en') {
  return getNoteFiles()
    .filter((file) => noteLocaleFromFile(file) === locale)
    .map((file) => {
      const raw = fs.readFileSync(path.join(notesDir, file), 'utf8')
      const { data } = matter(raw)
      return {
        ...data,
        slug: noteSlugFromFile(file),
        fileName: file,
        date: data.date ? new Date(data.date).toISOString() : null,
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getNoteBySlug(slug, locale = 'en') {
  const candidates = [`${slug}.${locale}.mdx`, `${slug}.en.mdx`, `${slug}.es.mdx`]

  for (const candidate of candidates) {
    const filePath = path.join(notesDir, candidate)
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(raw)
      return {
        frontMatter: {
          ...data,
          slug,
          fileName: candidate,
          date: data.date ? new Date(data.date).toISOString() : null,
        },
        content,
      }
    }
  }

  return null
}

export function getAllNoteSlugs() {
  return [...new Set(getNoteFiles().map(noteSlugFromFile))]
}
