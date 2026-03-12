<script setup lang="ts">
import type { CharState } from '~/composables/useTypingEngine'

defineProps<{
  flatChars: CharState[]
  cursorIndex: number
  loading: boolean
}>()

const emit = defineEmits<{
  keydown: [event: KeyboardEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function focusInput() {
  inputRef.value?.focus()
}

onMounted(() => {
  focusInput()
  document.addEventListener('click', focusInput)
})

onUnmounted(() => {
  document.removeEventListener('click', focusInput)
})

// Group chars into lines for rendering
function getLines(chars: CharState[]): CharState[][] {
  const lines: CharState[][] = [[]]
  for (const ch of chars) {
    const currentLine = lines[lines.length - 1]!
    if (ch.isNewline) {
      currentLine.push(ch)
      lines.push([])
    } else {
      currentLine.push(ch)
    }
  }
  return lines
}
</script>

<template>
  <div class="relative w-full max-w-4xl mx-auto px-6 py-8">
    <input
      ref="inputRef"
      type="text"
      class="absolute opacity-0 w-0 h-0"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      :spellcheck="false"
      @keydown="emit('keydown', $event)"
    >

    <div v-if="loading" class="text-center py-12" style="color: var(--text-muted)">
      loading snippet...
    </div>

    <pre
      v-else
      class="font-mono leading-[1.8] text-[1.1rem] whitespace-pre-wrap break-all outline-none"
      @click="focusInput"
    ><template v-for="(line, lineIdx) in getLines(flatChars)" :key="lineIdx"><template v-for="ch in line" :key="ch.index"><span
          v-if="!ch.isNewline"
          :class="'char-' + ch.status"
          :style="ch.status === 'incorrect'
            ? { color: 'var(--error-color)' }
            : { color: ch.color }"
        >{{ ch.char }}</span><span
          v-else
          :class="'char-' + ch.status"
        >{{ '\n' }}</span></template></template></pre>
  </div>
</template>
