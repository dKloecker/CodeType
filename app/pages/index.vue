<script setup lang="ts">
const category = ref<string[]>([])
const language = ref<string[]>([])
const lineCount = ref(20)
const mode = ref<'until-finished' | 'timed'>('until-finished')
const timedDuration = ref<10 | 30 | 60>(30)
const subcategory = ref('')
const difficulty = ref('')

const { indentStyle, spacesPerTab } = useSettings()
const { snippet, loading, refresh } = useSnippet(category, language, lineCount, {
  subcategory,
  difficulty
})

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

// True while the user has started but not yet finished — used to guard shortcuts
const isTyping = computed(() => startTime.value !== null && !finished.value)

const remainingSeconds = computed(() => timedDuration.value - elapsedSeconds.value)

// Timed mode: force finish when time runs out
watch(elapsedSeconds, (elapsed) => {
  if (mode.value === 'timed' && elapsed >= timedDuration.value && !finished.value) {
    forceFinish()
  }
})

const { handle: handleTabEnter } = useTabEnterShortcut(() => refresh())

function onKeydown(e: KeyboardEvent) {
  if (handleTabEnter(e)) return
  handleKeydown(e)
}

function handleTryLanguage(lang: string) {
  language.value = [lang]
  refresh()
}

// --- Shortcut handlers ---

function handleResetSession() {
  // Clear all filters back to defaults
  category.value = []
  language.value = []
  lineCount.value = 20
  mode.value = 'until-finished'
  timedDuration.value = 30
  subcategory.value = ''
  difficulty.value = ''
  // refresh() will be triggered by the watch on the filter refs above,
  // but we call it explicitly to be safe and immediate
  refresh()
}

function handleClearFilters() {
  // Clear filter state — the watch on these refs triggers refresh()
  category.value = []
  language.value = []
  subcategory.value = ''
  difficulty.value = ''
}

// Wire up defineShortcuts via the composable (r, shift_r, f)
useAppShortcuts({
  isTyping,
  onRestart: reset,
  onResetSession: handleResetSession,
  onClearFilters: handleClearFilters
})

onMounted(() => refresh())

watch([category, language, lineCount, subcategory, difficulty], () => refresh())
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
          v-model:subcategory="subcategory"
          v-model:difficulty="difficulty"
        />
      </UContainer>
    </div>

    <UContainer class="flex-1 flex flex-col items-center justify-center relative">
      <TypingArea
        :flat-chars="flatChars"
        :cursor-index="cursorIndex"
        :loading="loading || (!ready && snippet !== null)"
        :no-results="!loading && snippet === null"
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
        :snippet="snippet"
        @restart="reset()"
        @next="refresh()"
        @try-language="handleTryLanguage"
        @close="finished = false"
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

    <footer class="py-3">
      <ShortcutsLegend />
    </footer>
  </UMain>
</template>
