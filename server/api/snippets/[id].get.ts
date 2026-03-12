interface Snippet {
  id: string
  title: string
  category: string
  language: string
  lines: number
  code: string
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const storage = useStorage('assets:server')

  const keys = await storage.getKeys('snippets')
  for (const key of keys) {
    if (!key.endsWith('.json')) continue
    const data = await storage.getItem(key) as Snippet | null
    if (data && data.id === id) {
      return { snippet: data }
    }
  }

  throw createError({ statusCode: 404, message: `Snippet '${id}' not found` })
})
