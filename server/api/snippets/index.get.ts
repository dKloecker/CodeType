import type { Snippet } from '~~/server/types/snippet'
import { loadAllSnippets } from '~~/server/utils/snippets'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const language = query.language as string | undefined
  const category = query.category as string | undefined
  const subcategory = query.subcategory as string | undefined
  const tags = query.tags as string | undefined
  const maxLines = query.maxLines ? Number(query.maxLines) : undefined
  const difficulty = query.difficulty as string | undefined
  const slug = query.slug as string | undefined
  const excludeId = query.excludeId as string | undefined

  let snippets = await loadAllSnippets()

  if (slug) {
    snippets = snippets.filter(s => s.slug === slug)
  }

  if (category) {
    const cats = category.split(',')
    snippets = snippets.filter(s => cats.includes(s.category))
  }

  if (language) {
    const langs = language.split(',')
    snippets = snippets.filter(s => langs.includes(s.language))
  }

  if (subcategory) {
    snippets = snippets.filter(s => s.subcategory === subcategory)
  }

  if (tags) {
    const tagList = tags.split(',')
    snippets = snippets.filter(s => s.tags.some(t => tagList.includes(t)))
  }

  if (maxLines) {
    snippets = snippets.filter(s => s.lines <= maxLines)
  }

  if (difficulty) {
    snippets = snippets.filter(s => s.difficulty === difficulty)
  }

  if (excludeId) {
    snippets = snippets.filter(s => s.id !== excludeId)
  }

  if (snippets.length === 0) {
    return { snippet: null }
  }

  const randomIndex = Math.floor(Math.random() * snippets.length)
  return { snippet: snippets[randomIndex] as Snippet }
})
