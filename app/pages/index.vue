<script setup lang="ts">
const category = ref('algorithm')
const language = ref('python')
const lineCount = ref(30)
const showSettings = ref(false)

const { snippet, loading, refresh } = useSnippet(category, language, lineCount)
const { indentStyle, spacesPerTab } = useIndentConfig()

const {
  flatChars,
  cursorIndex,
  startTime,
  finished,
  errors,
  handleKeydown,
  reset,
  ready
} = useTypingEngine(snippet, { indentStyle, spacesPerTab })

const {
  cpm,
  wpm,
  lpm,
  accuracy,
  elapsedSeconds,
  errorCount
} = useMetrics(startTime, flatChars, cursorIndex, finished, errors)

const isActive = computed(() => startTime.value !== null)

// Tab+Enter restart detection
let tabPressed = false

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    tabPressed = true
  } else if (e.key === 'Enter' && tabPressed) {
    e.preventDefault()
    tabPressed = false
    refresh()
    return
  } else {
    tabPressed = false
  }

  handleKeydown(e)
}

// Fetch initial snippet
onMounted(() => {
  refresh()
})

// Refetch on filter change
watch([category, language, lineCount], () => {
  refresh()
})
</script>

<template>
  <div
    class="min-h-screen flex flex-col"
    style="background: var(--bg-base)"
  >
    <AppHeader v-model:show-settings="showSettings" />
    <IndentSettings v-model:open="showSettings" />

    <ModeSelector
      v-model:category="category"
      v-model:language="language"
      v-model:line-count="lineCount"
    />

    <div class="flex-1 flex flex-col items-center justify-center relative">
      <TypingArea
        :flat-chars="flatChars"
        :cursor-index="cursorIndex"
        :loading="loading || !ready"
        @keydown="onKeydown"
      />

      <ResultsOverlay
        v-if="finished"
        :wpm="wpm"
        :cpm="cpm"
        :lpm="lpm"
        :accuracy="accuracy"
        :elapsed-seconds="elapsedSeconds"
        :error-count="errorCount"
        @restart="refresh()"
      />
    </div>

    <StatsBar
      :cpm="cpm"
      :wpm="wpm"
      :lpm="lpm"
      :accuracy="accuracy"
      :elapsed-seconds="elapsedSeconds"
      :active="isActive"
    />

    <footer class="text-center py-3 text-xs" style="color: var(--text-muted)">
      tab + enter — restart &nbsp;&bull;&nbsp; esc — reset
    </footer>
  </div>
</template>
