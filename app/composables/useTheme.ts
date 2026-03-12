export type ThemeId = 'matrix' | 'dracula' | 'monokai' | 'nord' | 'solarized' | 'catppuccin'
export type FontId = 'jetbrains' | 'fira' | 'source' | 'ibm' | 'roboto'

export interface ThemeColors {
  text: string
  textDim: string
  error: string
  cursor: string
  cursorBg: string
}

export const themeOptions: { value: ThemeId, label: string }[] = [
  { value: 'matrix', label: 'matrix' },
  { value: 'dracula', label: 'dracula' },
  { value: 'monokai', label: 'monokai' },
  { value: 'nord', label: 'nord' },
  { value: 'solarized', label: 'solarized' },
  { value: 'catppuccin', label: 'catppuccin' }
]

export const themeColorMap: Record<ThemeId, ThemeColors> = {
  matrix: {
    text: '#e5e5e5',
    textDim: 'rgba(229,229,229,0.35)',
    error: '#f87171',
    cursor: '#4ade80',
    cursorBg: 'rgba(74,222,128,0.08)'
  },
  dracula: {
    text: '#f8f8f2',
    textDim: 'rgba(248,248,242,0.35)',
    error: '#ff5555',
    cursor: '#bd93f9',
    cursorBg: 'rgba(189,147,249,0.08)'
  },
  monokai: {
    text: '#f8f8f2',
    textDim: 'rgba(248,248,242,0.35)',
    error: '#f92672',
    cursor: '#f9e64f',
    cursorBg: 'rgba(249,230,79,0.08)'
  },
  nord: {
    text: '#eceff4',
    textDim: 'rgba(236,239,244,0.35)',
    error: '#bf616a',
    cursor: '#88c0d0',
    cursorBg: 'rgba(136,192,208,0.08)'
  },
  solarized: {
    text: '#eee8d5',
    textDim: 'rgba(238,232,213,0.35)',
    error: '#dc322f',
    cursor: '#b58900',
    cursorBg: 'rgba(181,137,0,0.08)'
  },
  catppuccin: {
    text: '#cdd6f4',
    textDim: 'rgba(205,214,244,0.35)',
    error: '#f38ba8',
    cursor: '#cba6f7',
    cursorBg: 'rgba(203,166,247,0.08)'
  }
}

export const fontOptions: { value: FontId, label: string, family: string }[] = [
  { value: 'jetbrains', label: 'jetbrains', family: '\'JetBrains Mono\', monospace' },
  { value: 'fira', label: 'fira code', family: '\'Fira Code\', monospace' },
  { value: 'source', label: 'source code', family: '\'Source Code Pro\', monospace' },
  { value: 'ibm', label: 'ibm plex', family: '\'IBM Plex Mono\', monospace' },
  { value: 'roboto', label: 'roboto', family: '\'Roboto Mono\', monospace' }
]

export function useTheme() {
  const theme = useState<ThemeId>('theme', () => 'matrix')
  const font = useState<FontId>('font', () => 'jetbrains')

  const codeColors = computed<ThemeColors>(() => themeColorMap[theme.value])

  const codeFontFamily = computed(() => {
    const opt = fontOptions.find(o => o.value === font.value)
    return opt?.family ?? '\'JetBrains Mono\', monospace'
  })

  function applyTheme(t: ThemeId) {
    theme.value = t
  }

  function applyFont(f: FontId) {
    font.value = f
  }

  return {
    theme,
    font,
    codeColors,
    codeFontFamily,
    applyTheme,
    applyFont
  }
}
