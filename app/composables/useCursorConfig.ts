const STORAGE_KEY = 'codetype-cursor-config'

export type CursorStyle = 'line' | 'underline' | 'box'

export function useCursorConfig() {
  const cursorStyle = ref<CursorStyle>('line')

  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as { cursorStyle: CursorStyle }
        if (['line', 'underline', 'box'].includes(parsed.cursorStyle)) {
          cursorStyle.value = parsed.cursorStyle
        }
      }
    } catch {
      // Ignore invalid stored data
    }
  }

  watch(cursorStyle, () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cursorStyle: cursorStyle.value
      }))
    }
  })

  return {
    cursorStyle
  }
}
