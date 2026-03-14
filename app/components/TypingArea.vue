<script setup lang="ts">
import type { CharState } from '~/composables/useTypingEngine'

const props = defineProps<{
  flatChars: CharState[]
  cursorIndex: number
  loading: boolean
  noResults?: boolean
}>()

const emit = defineEmits<{
  keydown: [event: KeyboardEvent]
}>()

const { cursorStyle, codeColors, codeFontFamily } = useSettings()

const inputRef = ref<HTMLInputElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

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

watch(() => props.cursorIndex, () => {
  nextTick(() => {
    scrollContainer.value?.querySelector('.char-cursor')?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth'
    })
  })
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

function charClass(ch: CharState): string {
  const base = 'char-' + ch.status
  if (ch.status === 'cursor') {
    return base + ' cursor-' + cursorStyle.value
  }
  return base
}

function charStyle(ch: CharState): Record<string, string> {
  if (ch.status === 'incorrect') {
    return { color: codeColors.value.error, textDecorationColor: codeColors.value.error }
  }
  if (ch.status === 'cursor') {
    return { color: ch.color || codeColors.value.text, background: codeColors.value.cursorBg }
  }
  return { color: ch.color || codeColors.value.text }
}

const snippetCssVars = computed(() => ({
  '--snippet-cursor': codeColors.value.cursor,
  '--snippet-error': codeColors.value.error
}))
</script>

<template>
  <!-- Full-area click target so users can click anywhere to focus input -->
  <div
    class="relative w-full flex flex-col items-center px-4 py-8"
    @click="focusInput"
  >
    <input
      ref="inputRef"
      type="text"
      class="absolute opacity-0 w-0 h-0 pointer-events-none"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      :spellcheck="false"
      @keydown="emit('keydown', $event)"
    >

    <div
      v-if="loading"
      class="py-12 text-center text-sm"
      style="color: var(--text-muted)"
    >
      loading snippet...
    </div>

    <div
      v-else-if="noResults"
      class="py-12 text-center text-sm"
      style="color: var(--text-muted)"
    >
      no snippets match this filter
    </div>

    <div
      v-else-if="!noResults"
      ref="scrollContainer"
      class="typing-scroll w-full max-w-3xl max-h-[60vh] overflow-y-auto overflow-x-auto"
      :style="snippetCssVars"
    >
      <!--
        Code is displayed in a pre with left-alignment (indentation matters).
        Padding-left gives cursor border room so it doesn't get clipped.
      -->
      <pre
        class="leading-[1.8] text-[1.1rem] whitespace-pre-wrap outline-none pl-1"
        :style="{ fontFamily: codeFontFamily }"
      ><template
v-for="(line, lineIdx) in getLines(flatChars)"
:key="lineIdx"
><template
v-for="ch in line"
:key="ch.index"
><span
v-if="!ch.isNewline"
:class="charClass(ch)"
:style="charStyle(ch)"
>{{ ch.char }}</span><span
v-else
:class="charClass(ch)"
      >{{ '\n' }}</span></template></template></pre>
    </div>
  </div>
</template>
