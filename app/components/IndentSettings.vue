<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { indentStyle, spacesPerTab } = useIndentConfig()
const { cursorStyle } = useCursorConfig()

const cursorStyles = ['line', 'underline', 'box'] as const
</script>

<template>
  <div
    v-if="props.open"
    class="absolute right-6 top-14 z-20 p-4 rounded"
    style="background: var(--bg-overlay); border: 1px solid #333"
  >
    <div class="flex items-center justify-between mb-4">
      <span
        class="text-sm"
        style="color: var(--text-muted)"
      >settings</span>
      <button
        class="p-1 transition-opacity duration-200 hover:opacity-70"
        style="color: var(--text-muted)"
        @click="emit('update:open', false)"
      >
        <UIcon
          name="i-lucide-x"
          class="w-4 h-4"
        />
      </button>
    </div>

    <div class="mb-3">
      <label
        class="text-xs block mb-2"
        style="color: var(--text-muted)"
      >indent style</label>
      <div class="flex gap-2">
        <button
          class="px-3 py-1 text-xs rounded transition-all duration-200"
          :style="{
            background: indentStyle === 'spaces' ? 'var(--accent-muted)' : 'transparent',
            color: indentStyle === 'spaces' ? 'var(--accent-primary)' : 'var(--text-muted)',
            border: '1px solid ' + (indentStyle === 'spaces' ? 'var(--accent-primary)' : '#333')
          }"
          @click="indentStyle = 'spaces'"
        >
          spaces
        </button>
        <button
          class="px-3 py-1 text-xs rounded transition-all duration-200"
          :style="{
            background: indentStyle === 'tabs' ? 'var(--accent-muted)' : 'transparent',
            color: indentStyle === 'tabs' ? 'var(--accent-primary)' : 'var(--text-muted)',
            border: '1px solid ' + (indentStyle === 'tabs' ? 'var(--accent-primary)' : '#333')
          }"
          @click="indentStyle = 'tabs'"
        >
          tabs
        </button>
      </div>
    </div>

    <div
      v-if="indentStyle === 'spaces'"
      class="mb-3"
    >
      <label
        class="text-xs block mb-2"
        style="color: var(--text-muted)"
      >spaces per tab</label>
      <div class="flex gap-2">
        <button
          v-for="n in ([2, 4] as const)"
          :key="n"
          class="px-3 py-1 text-xs rounded transition-all duration-200"
          :style="{
            background: spacesPerTab === n ? 'var(--accent-muted)' : 'transparent',
            color: spacesPerTab === n ? 'var(--accent-primary)' : 'var(--text-muted)',
            border: '1px solid ' + (spacesPerTab === n ? 'var(--accent-primary)' : '#333')
          }"
          @click="spacesPerTab = n"
        >
          {{ n }}
        </button>
      </div>
    </div>

    <div>
      <label
        class="text-xs block mb-2"
        style="color: var(--text-muted)"
      >caret style</label>
      <div class="flex gap-2">
        <button
          v-for="style in cursorStyles"
          :key="style"
          class="px-3 py-1 text-xs rounded transition-all duration-200"
          :style="{
            background: cursorStyle === style ? 'var(--accent-muted)' : 'transparent',
            color: cursorStyle === style ? 'var(--accent-primary)' : 'var(--text-muted)',
            border: '1px solid ' + (cursorStyle === style ? 'var(--accent-primary)' : '#333')
          }"
          @click="cursorStyle = style"
        >
          {{ style }}
        </button>
      </div>
    </div>
  </div>
</template>
