interface IndentConfig {
  indentStyle: 'tabs' | 'spaces'
  spacesPerTab: 2 | 4
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
