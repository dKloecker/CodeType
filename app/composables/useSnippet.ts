export interface Snippet {
  id: string
  title: string
  category: string
  language: string
  lines: number
  code: string
}

export function useSnippet(
  category: Ref<string>,
  language: Ref<string>,
  lineCount: Ref<number>
) {
  const snippet = ref<Snippet | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function refresh() {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (category.value) params.set('category', category.value)
      if (language.value) params.set('language', language.value)
      if (lineCount.value) params.set('lines', String(lineCount.value))

      const data = await $fetch<{ snippet: Snippet | null }>(`/api/snippets?${params.toString()}`)
      snippet.value = data.snippet
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch snippet'
      error.value = message
      snippet.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    snippet,
    loading,
    error,
    refresh
  }
}
