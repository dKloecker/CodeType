const STORAGE_KEY = 'codetype-indent-config'

type IndentStyle = 'tabs' | 'spaces'
type SpacesPerTab = 2 | 4

interface IndentConfig {
  indentStyle: IndentStyle
  spacesPerTab: SpacesPerTab
}

export function normalizeIndentation(code: string, config: IndentConfig): string {
  const lines = code.split('\n')

  return lines.map((line) => {
    const match = line.match(/^(\s+)/)
    if (!match || !match[1]) return line

    const leading = match[1]
    const rest = line.slice(leading.length)

    let level: number
    if (leading.includes('\t')) {
      level = (leading.match(/\t/g) || []).length
    } else {
      const spaceCount = leading.length
      const sourceIndent = spaceCount % 4 === 0 ? 4 : 2
      level = Math.round(spaceCount / sourceIndent)
    }

    const indent = config.indentStyle === 'tabs'
      ? '\t'.repeat(level)
      : ' '.repeat(level * config.spacesPerTab)

    return indent + rest
  }).join('\n')
}

export function useIndentConfig() {
  const indentStyle = ref<IndentStyle>('spaces')
  const spacesPerTab = ref<SpacesPerTab>(4)

  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as IndentConfig
        if (parsed.indentStyle === 'tabs' || parsed.indentStyle === 'spaces') {
          indentStyle.value = parsed.indentStyle
        }
        if (parsed.spacesPerTab === 2 || parsed.spacesPerTab === 4) {
          spacesPerTab.value = parsed.spacesPerTab
        }
      }
    } catch {
      // Ignore invalid stored data
    }
  }

  watch([indentStyle, spacesPerTab], () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        indentStyle: indentStyle.value,
        spacesPerTab: spacesPerTab.value
      }))
    }
  })

  return {
    indentStyle,
    spacesPerTab
  }
}
