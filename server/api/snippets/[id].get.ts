import { loadAllSnippets } from '~~/server/utils/snippets'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const snippets = await loadAllSnippets()
  const snippet = snippets.find(s => s.id === id)

  if (!snippet) {
    throw createError({ statusCode: 404, message: `Snippet '${id}' not found` })
  }

  return { snippet }
})
