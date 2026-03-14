export interface SnippetMeta {
  id: string
  slug: string
  title: string
  language: string
  category: string
  subcategory?: string
  tags: string[]
  lines: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  source?: string
}

export interface Snippet extends SnippetMeta {
  code: string
  description?: string
}
