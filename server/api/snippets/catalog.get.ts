import type { SnippetMeta } from '~~/server/types/snippet'
import { loadAllSnippets } from '~~/server/utils/snippets'

export default defineEventHandler(async () => {
  const snippets = await loadAllSnippets()

  const catalog: SnippetMeta[] = snippets.map(({ code, description, ...meta }) => meta)

  return { catalog }
})
