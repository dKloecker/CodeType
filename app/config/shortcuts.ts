/**
 * Shortcut legend config — drives both defineShortcuts wiring and the
 * ShortcutsLegend UI. Each entry maps a human-readable action label to
 * the key(s) shown in UKbd.
 *
 * `keys` is an array of strings rendered as individual UKbd chips side by side.
 * Multiple entries in the outer array are rendered as separate rows in the legend.
 */
export interface ShortcutLegendEntry {
  /** Unique id used as v-for key */
  id: string
  /** Label displayed next to the keys */
  label: string
  /** Each element is one UKbd chip; rendered joined by "+" */
  keys: string[]
}

export const shortcutLegend: ShortcutLegendEntry[] = [
  { id: 'next', label: 'next snippet', keys: ['tab', 'enter'] },
  { id: 'restart', label: 'restart', keys: ['ctrl', 'r'] },
  { id: 'reset', label: 'reset session', keys: ['ctrl', 'shift', 'r'] },
  { id: 'clear', label: 'clear filters', keys: ['ctrl', 'f'] }
]
