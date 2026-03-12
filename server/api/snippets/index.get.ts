interface Snippet {
  id: string
  title: string
  category: string
  language: string
  lines: number
  code: string
}

async function loadAllSnippets(): Promise<Snippet[]> {
  const storage = useStorage('assets:server')
  const snippets: Snippet[] = []

  const keys = await storage.getKeys('snippets')
  for (const key of keys) {
    if (!key.endsWith('.json')) continue
    const data = await storage.getItem(key)
    if (data) {
      snippets.push(data as Snippet)
    }
  }

  return snippets
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = query.category as string | undefined
  const language = query.language as string | undefined
  const lines = query.lines ? Number(query.lines) : undefined

  let snippets = await loadAllSnippets()

  if (category) {
    snippets = snippets.filter(s => s.category === category)
  }

  if (language) {
    snippets = snippets.filter(s => s.language === language)
  }

  if (snippets.length === 0) {
    return { snippet: null }
  }

  if (lines) {
    const withinLimit = snippets.filter(s => s.lines <= lines)
    if (withinLimit.length > 0) {
      snippets = withinLimit
    }
  }

  const randomIndex = Math.floor(Math.random() * snippets.length)
  return { snippet: snippets[randomIndex] }
})
