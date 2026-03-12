import type { CharState } from './useTypingEngine'

export function useMetrics(
  startTime: Ref<number | null>,
  flatChars: Ref<CharState[]>,
  cursorIndex: Ref<number>,
  finished: Ref<boolean>,
  errors: Ref<Set<number>>
) {
  const cpm = ref(0)
  const wpm = ref(0)
  const lpm = ref(0)
  const accuracy = ref(100)
  const elapsedSeconds = ref(0)
  const errorCount = ref(0)

  let intervalId: ReturnType<typeof setInterval> | null = null

  function calculate() {
    if (!startTime.value) return

    const elapsed = (Date.now() - startTime.value) / 1000
    if (elapsed <= 0) return

    if (!finished.value) {
      elapsedSeconds.value = elapsed
    }

    const chars = flatChars.value
    let correctChars = 0
    let totalTyped = 0
    let completedNewlines = 0

    for (const c of chars) {
      if (c.status === 'correct') {
        correctChars++
        totalTyped++
        if (c.isNewline) completedNewlines++
      } else if (c.status === 'incorrect') {
        totalTyped++
      }
    }

    const t = finished.value ? elapsedSeconds.value : elapsed

    cpm.value = t > 0 ? (correctChars / t) * 60 : 0
    wpm.value = cpm.value / 5
    lpm.value = t > 0 ? (completedNewlines / t) * 60 : 0
    accuracy.value = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 100
    errorCount.value = errors.value.size
  }

  function startInterval() {
    stopInterval()
    intervalId = setInterval(calculate, 250)
  }

  function stopInterval() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  watch(startTime, (val) => {
    if (val !== null) {
      startInterval()
    } else {
      stopInterval()
      cpm.value = 0
      wpm.value = 0
      lpm.value = 0
      accuracy.value = 100
      elapsedSeconds.value = 0
      errorCount.value = 0
    }
  })

  watch(finished, (val) => {
    if (val) {
      if (startTime.value) {
        elapsedSeconds.value = (Date.now() - startTime.value) / 1000
      }
      calculate()
      stopInterval()
    }
  })

  onUnmounted(() => {
    stopInterval()
  })

  return {
    cpm,
    wpm,
    lpm,
    accuracy,
    elapsedSeconds,
    errorCount
  }
}
