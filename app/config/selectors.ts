export interface SelectorOption<T = string> {
  value: T
  label: string
}

export const languageOptions: SelectorOption[] = [
  { value: '', label: 'random' },
  { value: 'python', label: 'python' },
  { value: 'typescript', label: 'typescript' },
  { value: 'cpp', label: 'c++' }
]

export const categoryOptions: SelectorOption[] = [
  { value: 'algorithm', label: 'algorithms' },
  { value: 'leetcode', label: 'leetcode' },
  { value: 'oss', label: 'oss' }
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
