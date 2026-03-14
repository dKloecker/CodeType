import type { Snippet } from '~~/server/types/snippet'

let cachedSnippets: Snippet[] | null = null

export function invalidateSnippetCache() {
  cachedSnippets = null
}

export async function loadAllSnippets(): Promise<Snippet[]> {
  if (cachedSnippets && process.env.NODE_ENV === 'production') return cachedSnippets

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

  cachedSnippets = snippets
  return snippets
}
