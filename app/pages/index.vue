<script setup lang="ts">
const category = ref('algorithm')
const language = ref('python')
const lineCount = ref(30)
const mode = ref<'until-finished' | 'timed'>('until-finished')
const timedDuration = ref<30 | 60 | 120>(60)

const { snippet, loading, refresh } = useSnippet(category, language, lineCount)
const { indentStyle, spacesPerTab } = useIndentConfig()
const { cursorStyle } = useCursorConfig()

const {
  flatChars,
  cursorIndex,
  startTime,
  finished,
  errors,
  handleKeydown,
  reset,
  ready,
  forceFinish
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

const remainingSeconds = computed(() =>
  timedDuration.value - elapsedSeconds.value
)

// Timed mode: force finish when time runs out
watch(elapsedSeconds, (elapsed) => {
  if (mode.value === 'timed' && elapsed >= timedDuration.value && !finished.value) {
    forceFinish()
  }
})

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
    class="min-h-screen flex flex-col pb-24"
    style="background: var(--bg-base)"
  >
    <AppHeader />

    <ModeSelector
      v-model:category="category"
      v-model:language="language"
      v-model:line-count="lineCount"
      v-model:mode="mode"
      v-model:timed-duration="timedDuration"
      v-model:indent-style="indentStyle"
      v-model:spaces-per-tab="spacesPerTab"
      v-model:cursor-style="cursorStyle"
    />

    <div class="flex-1 flex flex-col items-center justify-center relative pt-16">
      <TypingArea
        :flat-chars="flatChars"
        :cursor-index="cursorIndex"
        :loading="loading || !ready"
        :cursor-style="cursorStyle"
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
      :mode="mode"
      :remaining-seconds="remainingSeconds"
    />

    <footer class="text-center py-3 text-xs" style="color: var(--text-muted)">
      tab + enter — restart &nbsp;&bull;&nbsp; esc — reset
    </footer>
  </div>
</template>
