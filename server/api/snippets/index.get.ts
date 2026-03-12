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
    // Find snippets closest to the requested line count
    const sorted = [...snippets].sort(
      (a, b) => Math.abs(a.lines - lines) - Math.abs(b.lines - lines)
    )
    const closestDistance = Math.abs(sorted[0]!.lines - lines)
    // Keep all snippets tied for closest match
    snippets = sorted.filter(s => Math.abs(s.lines - lines) === closestDistance)
  }

  const randomIndex = Math.floor(Math.random() * snippets.length)
  return { snippet: snippets[randomIndex] }
})
