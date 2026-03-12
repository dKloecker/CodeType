<script setup lang="ts">
import type { CharState } from '~/composables/useTypingEngine'
import type { CursorStyle } from '~/composables/useCursorConfig'

const props = defineProps<{
  flatChars: CharState[]
  cursorIndex: number
  loading: boolean
  cursorStyle: CursorStyle
}>()

const emit = defineEmits<{
  keydown: [event: KeyboardEvent]
}>()

const { codeColors, codeFontFamily } = useTheme()

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
      block: 'center',
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
    return base + ' cursor-' + props.cursorStyle
  }
  return base
}

// Compute inline style for each char, using the snippet theme for error/cursor colors
function charStyle(ch: CharState): Record<string, string> {
  if (ch.status === 'incorrect') {
    return {
      color: codeColors.value.error,
      textDecorationColor: codeColors.value.error
    }
  }
  if (ch.status === 'cursor') {
    return {
      color: ch.color || codeColors.value.text,
      background: codeColors.value.cursorBg
    }
  }
  // correct or untyped — use the syntax color from the snippet, or the theme text color
  return {
    color: ch.color || codeColors.value.text
  }
}

const snippetCssVars = computed(() => ({
  '--snippet-cursor': codeColors.value.cursor,
  '--snippet-error': codeColors.value.error
}))
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

    <div
      v-if="loading"
      class="text-center py-12"
      style="color: var(--text-muted)"
    >
      loading snippet...
    </div>

    <div
      v-else
      ref="scrollContainer"
      class="typing-scroll max-h-[60vh] overflow-y-auto"
      :style="snippetCssVars"
    >
      <pre
        class="leading-[1.8] text-[1.1rem] whitespace-pre-wrap break-all outline-none"
        :style="{ fontFamily: codeFontFamily }"
        @click="focusInput"
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
