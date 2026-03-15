/**
 * Detects a Tab → Enter key sequence and calls the provided callback.
 * Tab is also a valid indent key in the typing engine, so we track it
 * manually rather than using defineShortcuts.
 */
export function useTabEnterShortcut(onTrigger: () => void) {
  let tabPressed = false

  function handle(e: KeyboardEvent): boolean {
    if (e.key === 'Tab') {
      tabPressed = true
      return false
    }
    if (e.key === 'Enter' && tabPressed) {
      e.preventDefault()
      tabPressed = false
      onTrigger()
      return true
    }
    tabPressed = false
    return false
  }

  return { handle }
}
