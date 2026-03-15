/**
 * useAppShortcuts
 *
 * Wires up the four global keyboard shortcuts via NuxtUI's defineShortcuts.
 * All shortcuts use `usingInput: true` because the typing area keeps a hidden
 * <input> focused at all times. We guard each handler manually so they only
 * fire when the user is NOT actively typing (startTime is null OR finished).
 *
 * Shortcut map:
 *   ctrl_r         → restart current snippet
 *   ctrl_shift_r   → reset session (clear all filters + restart)
 *   ctrl_f         → clear filters only (keep current snippet)
 *
 * Tab + Enter (next snippet) is NOT handled here — it is a chained sequence
 * that conflicts with Tab's role as an indent key inside the typing engine,
 * so it stays in the manual onKeydown handler in index.vue.
 */
export function useAppShortcuts(options: {
  /** True while the user is mid-typing (startTime set and not finished) */
  isTyping: Readonly<Ref<boolean>>
  /** Restart the current snippet without changing filters */
  onRestart: () => void
  /** Reset all filters to defaults, then load a new snippet */
  onResetSession: () => void
  /** Clear all filters but stay on the current snippet */
  onClearFilters: () => void
}) {
  const { isTyping, onRestart, onResetSession, onClearFilters } = options

  defineShortcuts({
    // ctrl+r — restart current snippet (safe when idle or finished)
    ctrl_r: {
      usingInput: true,
      handler() {
        if (isTyping.value) return
        onRestart()
      }
    },

    // ctrl+shift+r — reset session: clear all filters and load fresh snippet
    ctrl_shift_r: {
      usingInput: true,
      handler() {
        if (isTyping.value) return
        onResetSession()
      }
    },

    // ctrl+f — clear filters only, keep the current snippet loaded
    ctrl_f: {
      usingInput: true,
      handler() {
        if (isTyping.value) return
        onClearFilters()
      }
    }
  })
}
