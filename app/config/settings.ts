export interface SettingOption<T = string> {
  value: T
  label: string
}

export const cursorOptions: SettingOption[] = [
  { value: 'line', label: 'line' },
  { value: 'block', label: 'block' },
  { value: 'underlined', label: 'underlined' }
]

export const indentOptions: SettingOption[] = [
  { value: 'tabs', label: 'tab' },
  { value: 'spaces-2', label: '2 spaces' },
  { value: 'spaces-4', label: '4 spaces' }
]

export const fontOptions = [
  { value: 'jetbrains', label: 'JetBrains Mono', family: '\'JetBrains Mono\', monospace' },
  { value: 'fira', label: 'Fira Code', family: '\'Fira Code\', monospace' },
  { value: 'source', label: 'Source Code Pro', family: '\'Source Code Pro\', monospace' },
  { value: 'ibm', label: 'IBM Plex Mono', family: '\'IBM Plex Mono\', monospace' },
  { value: 'roboto', label: 'Roboto Mono', family: '\'Roboto Mono\', monospace' }
] as const

export const themeOptions = [
  { value: 'matrix', label: 'matrix' },
  { value: 'dracula', label: 'dracula' },
  { value: 'monokai', label: 'monokai' },
  { value: 'nord', label: 'nord' },
  { value: 'solarized', label: 'solarized' },
  { value: 'catppuccin', label: 'catppuccin' }
] as const
