import type { Snippet } from '~~/server/types/snippet'

export type { Snippet }

export function useSnippet(
  category: Ref<string[]>,
  language: Ref<string[]>,
  lineCount: Ref<number>,
  options?: {
    subcategory?: Ref<string>
    difficulty?: Ref<string>
    tags?: Ref<string[]>
    slug?: Ref<string>
  }
) {
  const snippet = ref<Snippet | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function refresh() {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()

      const cats = category.value.filter(Boolean)
      if (cats.length) params.set('category', cats.join(','))

      const langs = language.value.filter(Boolean)
      if (langs.length) params.set('language', langs.join(','))

      if (lineCount.value) params.set('maxLines', String(lineCount.value))

      if (options?.subcategory?.value) params.set('subcategory', options.subcategory.value)
      if (options?.difficulty?.value) params.set('difficulty', options.difficulty.value)
      if (options?.slug?.value) params.set('slug', options.slug.value)

      const tagValues = options?.tags?.value?.filter(Boolean)
      if (tagValues?.length) params.set('tags', tagValues.join(','))

      if (snippet.value) params.set('excludeId', snippet.value.id)

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
