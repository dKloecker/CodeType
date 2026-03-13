import { fontOptions } from '~/config/settings'

const STORAGE_KEY = 'codetype-settings'

export type CursorStyle = 'line' | 'underlined' | 'block'
export type IndentStyle = 'tabs' | 'spaces'
export type SpacesPerTab = 2 | 4
export type IndentValue = 'tabs' | 'spaces-2' | 'spaces-4'
export type ThemeId = 'matrix' | 'dracula' | 'monokai' | 'nord' | 'solarized' | 'catppuccin'
export type FontId = 'jetbrains' | 'fira' | 'source' | 'ibm' | 'roboto'

export interface ThemeColors {
  text: string
  textDim: string
  error: string
  cursor: string
  cursorBg: string
}

const themeColorMap: Record<ThemeId, ThemeColors> = {
  matrix: { text: '#e5e5e5', textDim: 'rgba(229,229,229,0.35)', error: '#f87171', cursor: '#4ade80', cursorBg: 'rgba(74,222,128,0.08)' },
  dracula: { text: '#f8f8f2', textDim: 'rgba(248,248,242,0.35)', error: '#ff5555', cursor: '#bd93f9', cursorBg: 'rgba(189,147,249,0.08)' },
  monokai: { text: '#f8f8f2', textDim: 'rgba(248,248,242,0.35)', error: '#f92672', cursor: '#f9e64f', cursorBg: 'rgba(249,230,79,0.08)' },
  nord: { text: '#eceff4', textDim: 'rgba(236,239,244,0.35)', error: '#bf616a', cursor: '#88c0d0', cursorBg: 'rgba(136,192,208,0.08)' },
  solarized: { text: '#eee8d5', textDim: 'rgba(238,232,213,0.35)', error: '#dc322f', cursor: '#b58900', cursorBg: 'rgba(181,137,0,0.08)' },
  catppuccin: { text: '#cdd6f4', textDim: 'rgba(205,214,244,0.35)', error: '#f38ba8', cursor: '#cba6f7', cursorBg: 'rgba(203,166,247,0.08)' }
}

/**
 * Unified settings composable. Uses useState so all components share the same
 * reactive state without prop drilling. Persists to localStorage.
 */
export function useSettings() {
  const cursorStyle = useState<CursorStyle>('settings:cursor', () => 'line')
  const indentStyle = useState<IndentStyle>('settings:indent', () => 'spaces')
  const spacesPerTab = useState<SpacesPerTab>('settings:spacesPerTab', () => 4)
  const theme = useState<ThemeId>('settings:theme', () => 'matrix')
  const font = useState<FontId>('settings:font', () => 'jetbrains')

  // Load from localStorage once on client
  if (import.meta.client) {
    const loaded = useState('settings:loaded', () => false)
    if (!loaded.value) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const p = JSON.parse(stored)
          if (['line', 'underlined', 'block'].includes(p.cursor)) cursorStyle.value = p.cursor
          if (['tabs', 'spaces'].includes(p.indent)) indentStyle.value = p.indent
          if ([2, 4].includes(p.spacesPerTab)) spacesPerTab.value = p.spacesPerTab
          if (themeColorMap[p.theme as ThemeId]) theme.value = p.theme
          if (fontOptions.find(f => f.value === p.font)) font.value = p.font
        }
      } catch { /* ignore invalid stored data */ }
      loaded.value = true
    }
  }

  function save() {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cursor: cursorStyle.value,
        indent: indentStyle.value,
        spacesPerTab: spacesPerTab.value,
        theme: theme.value,
        font: font.value
      }))
    }
  }

  // Derived: combined indent value for config-driven UI
  const indentValue = computed<IndentValue>(() => {
    if (indentStyle.value === 'tabs') return 'tabs'
    return spacesPerTab.value === 2 ? 'spaces-2' : 'spaces-4'
  })

  function setIndent(val: IndentValue) {
    if (val === 'tabs') {
      indentStyle.value = 'tabs'
    } else if (val === 'spaces-2') {
      indentStyle.value = 'spaces'
      spacesPerTab.value = 2
    } else {
      indentStyle.value = 'spaces'
      spacesPerTab.value = 4
    }
    save()
  }

  function applyTheme(t: ThemeId) {
    theme.value = t
    save()
  }

  function applyFont(f: FontId) {
    font.value = f
    save()
  }

  function applyCursor(c: CursorStyle) {
    cursorStyle.value = c
    save()
  }

  const codeColors = computed<ThemeColors>(() => themeColorMap[theme.value])

  const codeFontFamily = computed(() => {
    const opt = fontOptions.find(o => o.value === font.value)
    return opt?.family ?? '\'JetBrains Mono\', monospace'
  })

  return {
    // Raw values (needed by typing engine)
    cursorStyle,
    indentStyle,
    spacesPerTab,
    theme,
    font,
    // Derived
    indentValue,
    codeColors,
    codeFontFamily,
    // Setters
    setIndent,
    applyTheme,
    applyFont,
    applyCursor
  }
}
