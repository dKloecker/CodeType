<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { cursorOptions, indentOptions, fontOptions, themeOptions } from '~/config/settings'
import type { CursorStyle, IndentValue, FontId, ThemeId } from '~/composables/useSettings'

const { cursorStyle, indentValue, setIndent, theme, font, applyTheme, applyFont, applyCursor } = useSettings()

const items = computed<DropdownMenuItem[][]>(() => [
  [
    { label: 'Cursor', type: 'label' },
    ...cursorOptions.map(opt => ({
      label: opt.label,
      type: 'checkbox' as const,
      checked: cursorStyle.value === opt.value,
      onUpdateChecked: (checked: boolean) => {
        if (checked) applyCursor(opt.value as CursorStyle)
      }
    }))
  ],
  [
    { label: 'Indent', type: 'label' },
    ...indentOptions.map(opt => ({
      label: opt.label,
      type: 'checkbox' as const,
      checked: indentValue.value === opt.value,
      onUpdateChecked: (checked: boolean) => {
        if (checked) setIndent(opt.value as IndentValue)
      }
    }))
  ],
  [
    { label: 'Font', type: 'label' },
    ...fontOptions.map(opt => ({
      label: opt.label,
      type: 'checkbox' as const,
      checked: font.value === opt.value,
      onUpdateChecked: (checked: boolean) => {
        if (checked) applyFont(opt.value as FontId)
      }
    }))
  ],
  [
    { label: 'Theme', type: 'label' },
    ...themeOptions.map(opt => ({
      label: opt.label,
      type: 'checkbox' as const,
      checked: theme.value === opt.value,
      onUpdateChecked: (checked: boolean) => {
        if (checked) applyTheme(opt.value as ThemeId)
      }
    }))
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :modal="false"
    :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
  >
    <button
      class="pill-btn flex items-center px-3 py-2"
      style="color: var(--text-muted)"
      aria-label="Settings"
    >
      <UIcon
        name="i-lucide-settings-2"
        class="w-3.5 h-3.5"
      />
    </button>
  </UDropdownMenu>
</template>
