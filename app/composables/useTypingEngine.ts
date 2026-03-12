import { createHighlighter, type Highlighter } from 'shiki'
import type { Snippet } from './useSnippet'

export interface CharState {
  index: number
  char: string
  color: string
  status: 'untyped' | 'correct' | 'incorrect' | 'cursor'
  isNewline: boolean
  isIndent: boolean
}

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['vitesse-dark'],
      langs: ['typescript', 'python', 'cpp']
    })
  }
  return highlighterPromise
}

async function tokenizeCode(code: string, language: string): Promise<CharState[]> {
  const highlighter = await getHighlighter()

  const loadedLangs = highlighter.getLoadedLanguages()
  let lang = language
  if (!loadedLangs.includes(lang as never)) {
    try {
      await highlighter.loadLanguage(lang as never)
    } catch {
      lang = 'text'
    }
  }

  if (!highlighter.getLoadedLanguages().includes(lang as never)) {
    lang = 'text'
  }

  const result = highlighter.codeToTokens(code, {
    lang: lang as never,
    theme: 'vitesse-dark'
  })

  return buildCharStatesFromTokens(code, result.tokens)
}

function buildCharStatesFromTokens(
  code: string,
  tokenLines: { content: string; color?: string }[][]
): CharState[] {
  const defaultColor = '#d4d4d4'
  const codeLines = code.split('\n')
  const flatChars: CharState[] = []

  for (let lineIdx = 0; lineIdx < codeLines.length; lineIdx++) {
    const codeLine = codeLines[lineIdx]!
    const tokenLine = tokenLines[lineIdx] || []

    const lineColors: string[] = []
    for (const token of tokenLine) {
      const color = token.color || defaultColor
      for (let i = 0; i < token.content.length; i++) {
        lineColors.push(color)
      }
    }

    const firstNonWhitespace = codeLine.search(/\S/)
    const indentEnd = firstNonWhitespace === -1 ? codeLine.length : firstNonWhitespace

    for (let charIdx = 0; charIdx < codeLine.length; charIdx++) {
      flatChars.push({
        index: flatChars.length,
        char: codeLine[charIdx]!,
        color: lineColors[charIdx] || defaultColor,
        status: 'untyped',
        isNewline: false,
        isIndent: charIdx < indentEnd
      })
    }

    if (lineIdx < codeLines.length - 1) {
      flatChars.push({
        index: flatChars.length,
        char: '\n',
        color: defaultColor,
        status: 'untyped',
        isNewline: true,
        isIndent: false
      })
    }
  }

  if (flatChars.length > 0) {
    flatChars[0]!.status = 'cursor'
  }

  return flatChars
}

export function useTypingEngine(
  snippet: Ref<Snippet | null>,
  indentConfig: { indentStyle: Ref<'tabs' | 'spaces'>; spacesPerTab: Ref<number> }
) {
  const flatChars = ref<CharState[]>([])
  const cursorIndex = ref(0)
  const startTime = ref<number | null>(null)
  const finished = ref(false)
  const errors = ref(new Set<number>())
  const ready = ref(false)

  async function initialize(code: string, language: string) {
    ready.value = false

    const normalizedCode = normalizeIndentation(code, {
      indentStyle: indentConfig.indentStyle.value,
      spacesPerTab: indentConfig.spacesPerTab.value as 2 | 4
    })

    const chars = await tokenizeCode(normalizedCode, language)
    flatChars.value = chars
    cursorIndex.value = 0
    startTime.value = null
    finished.value = false
    errors.value = new Set<number>()
    ready.value = true
  }

  function reset(newSnippet?: Snippet) {
    const s = newSnippet || snippet.value
    if (s) {
      initialize(s.code, s.language)
    }
  }

  watch(snippet, (s) => {
    if (s) {
      initialize(s.code, s.language)
    }
  }, { immediate: true })

  function handleKeydown(event: KeyboardEvent) {
    if (!ready.value || finished.value) return
    const chars = flatChars.value
    if (chars.length === 0) return

    const key = event.key
    const idx = cursorIndex.value

    if (key === 'Escape') {
      reset()
      return
    }

    if (key === 'Tab') {
      event.preventDefault()
      const count = indentConfig.indentStyle.value === 'tabs'
        ? 1
        : indentConfig.spacesPerTab.value

      if (startTime.value === null && idx === 0) {
        startTime.value = Date.now()
      }

      for (let i = 0; i < count; i++) {
        const ci = cursorIndex.value
        if (ci >= chars.length) break

        const current = chars[ci]!
        const typed = indentConfig.indentStyle.value === 'tabs' ? '\t' : ' '

        if (typed === current.char) {
          current.status = 'correct'
        } else {
          current.status = 'incorrect'
          errors.value.add(ci)
        }
        cursorIndex.value++
      }

      if (cursorIndex.value < chars.length) {
        chars[cursorIndex.value]!.status = 'cursor'
      }
      if (cursorIndex.value >= chars.length) {
        finished.value = true
      }
      return
    }

    if (key === 'Backspace') {
      if (idx <= 0) return

      const prevIdx = idx - 1
      const prev = chars[prevIdx]!

      if (prev.isNewline && prev.status === 'correct') return

      if (prev.isIndent && prev.status === 'correct') {
        let scanIdx = prevIdx - 1
        while (scanIdx >= 0 && chars[scanIdx]!.isIndent && chars[scanIdx]!.status === 'correct') {
          scanIdx--
        }
        if (scanIdx >= 0 && chars[scanIdx]!.isNewline && chars[scanIdx]!.status === 'correct') {
          return
        }
      }

      if (idx < chars.length) {
        chars[idx]!.status = 'untyped'
      }

      prev.status = 'cursor'
      errors.value.delete(prevIdx)
      cursorIndex.value = prevIdx
      return
    }

    if (key === 'Enter') {
      if (idx >= chars.length) return

      if (startTime.value === null) {
        startTime.value = Date.now()
      }

      const current = chars[idx]!
      if (current.char === '\n') {
        current.status = 'correct'
        let nextIdx = idx + 1

        while (nextIdx < chars.length && chars[nextIdx]!.isIndent) {
          chars[nextIdx]!.status = 'correct'
          nextIdx++
        }

        cursorIndex.value = nextIdx
        if (nextIdx < chars.length) {
          chars[nextIdx]!.status = 'cursor'
        }
        if (nextIdx >= chars.length) {
          finished.value = true
        }
      } else {
        current.status = 'incorrect'
        errors.value.add(idx)
        cursorIndex.value = idx + 1
        if (idx + 1 < chars.length) {
          chars[idx + 1]!.status = 'cursor'
        }
        if (idx + 1 >= chars.length) {
          finished.value = true
        }
      }
      return
    }

    if (key.length !== 1) return
    event.preventDefault()

    if (startTime.value === null) {
      startTime.value = Date.now()
    }

    if (idx >= chars.length) return

    const current = chars[idx]!
    if (key === current.char) {
      current.status = 'correct'
    } else {
      current.status = 'incorrect'
      errors.value.add(idx)
    }

    cursorIndex.value = idx + 1
    if (idx + 1 < chars.length) {
      chars[idx + 1]!.status = 'cursor'
    }
    if (idx + 1 >= chars.length) {
      finished.value = true
    }
  }

  return {
    flatChars,
    cursorIndex,
    startTime,
    finished,
    errors,
    ready,
    handleKeydown,
    reset
  }
}
