export interface SelectorOption<T = string> {
  value: T
  label: string
}

export const languageOptions: SelectorOption[] = [
  { value: '', label: 'all' },
  { value: 'python', label: 'python' },
  { value: 'typescript', label: 'typescript' },
  { value: 'cpp', label: 'c++' }
]

export const categoryOptions: SelectorOption[] = [
  { value: '', label: 'all' },
  { value: 'algorithm', label: 'algorithms' },
  { value: 'leetcode', label: 'leetcode' },
  { value: 'pattern', label: 'patterns' },
  { value: 'oss', label: 'oss' }
]

export const subcategoryMap: Record<string, SelectorOption[]> = {
  algorithm: [
    { value: '', label: 'all' },
    { value: 'graph', label: 'graph' },
    { value: 'sorting', label: 'sorting' },
    { value: 'searching', label: 'searching' }
  ],
  leetcode: [
    { value: '', label: 'all' },
    { value: 'array', label: 'array' },
    { value: 'string', label: 'string' },
    { value: 'linked-list', label: 'linked list' },
    { value: 'dynamic-programming', label: 'dp' }
  ]
}

export const difficultyOptions: SelectorOption[] = [
  { value: '', label: 'all' },
  { value: 'beginner', label: 'beginner' },
  { value: 'intermediate', label: 'intermediate' },
  { value: 'advanced', label: 'advanced' }
]

export const lineSizeOptions: SelectorOption<number>[] = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' }
]

export const timedDurationOptions: SelectorOption<number>[] = [
  { value: 10, label: '10s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1m' }
]

export const knownTags = [
  'graph', 'shortest-path', 'greedy', 'heap', 'traversal', 'queue',
  'searching', 'divide-and-conquer', 'array', 'sorting', 'comparison',
  'in-place', 'recursion', 'hash-map', 'stack', 'string',
  'dynamic-programming', 'math', 'linked-list', 'design-pattern',
  'metaprogramming', 'functional', 'generics', 'type-system',
  'memory-management', 'raii', 'middleware', 'error-handling', 'web',
  'async', 'validation', 'data-structure', 'kernel'
] as const
