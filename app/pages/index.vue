<script setup lang="ts">
const category = ref('algorithm')
const language = ref('')
const lineCount = ref(10)
const mode = ref<'until-finished' | 'timed'>('until-finished')
const timedDuration = ref<10 | 30 | 60>(30)

const { indentStyle, spacesPerTab } = useSettings()
const { snippet, loading, refresh } = useSnippet(category, language, lineCount)

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
  errorCount,
  timeSeries,
  errorEvents
} = useMetrics(startTime, flatChars, cursorIndex, finished, errors)

const isActive = computed(() => startTime.value !== null)

const remainingSeconds = computed(() => timedDuration.value - elapsedSeconds.value)

// Timed mode: force finish when time runs out
watch(elapsedSeconds, (elapsed) => {
  if (mode.value === 'timed' && elapsed >= timedDuration.value && !finished.value) {
    forceFinish()
  }
})

// Tab+Enter = new snippet, Esc = reset (handled in typing engine)
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

onMounted(() => refresh())

watch([category, language, lineCount], () => refresh())
</script>

<template>
  <UMain class="flex flex-col pb-24">
    <AppHeader />

    <!-- Top padding to clear the fixed header -->
    <div class="pt-16">
      <UContainer>
        <ModeSelector
          v-model:category="category"
          v-model:language="language"
          v-model:line-count="lineCount"
          v-model:mode="mode"
          v-model:timed-duration="timedDuration"
        />
      </UContainer>
    </div>

    <UContainer class="flex-1 flex flex-col items-center justify-center relative">
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
        :time-series="timeSeries"
        :error-events="errorEvents"
        @restart="reset()"
        @next="refresh()"
      />
    </UContainer>

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

    <footer
      class="text-center py-3 text-xs"
      style="color: var(--text-muted)"
    >
      tab + enter — restart &nbsp;&bull;&nbsp; esc — reset
    </footer>
  </UMain>
</template>
