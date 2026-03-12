import type { CharState } from './useTypingEngine'

export interface TimeSeriesPoint {
  time: number  // seconds since start
  wpm: number
  accuracy: number
}

export interface ErrorEvent {
  time: number  // seconds since start
  charIndex: number
}

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

  // Time-series data for the results chart
  const timeSeries = ref<TimeSeriesPoint[]>([])
  const errorEvents = ref<ErrorEvent[]>([])

  let intervalId: ReturnType<typeof setInterval> | null = null
  let lastErrorCount = 0

  function getStats(elapsed: number) {
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

    const currentCpm = elapsed > 0 ? (correctChars / elapsed) * 60 : 0
    const currentWpm = currentCpm / 5
    const currentLpm = elapsed > 0 ? (completedNewlines / elapsed) * 60 : 0
    const currentAcc = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 100

    return { cpm: currentCpm, wpm: currentWpm, lpm: currentLpm, accuracy: currentAcc, errorCount: errors.value.size }
  }

  function calculate() {
    if (!startTime.value) return

    const elapsed = (Date.now() - startTime.value) / 1000
    if (elapsed <= 0) return

    if (!finished.value) {
      elapsedSeconds.value = elapsed
    }

    const stats = getStats(finished.value ? elapsedSeconds.value : elapsed)

    cpm.value = stats.cpm
    wpm.value = stats.wpm
    lpm.value = stats.lpm
    accuracy.value = stats.accuracy
    errorCount.value = stats.errorCount

    // Record time-series sample (roughly every second — the interval is 250ms,
    // so we sample when the integer second changes)
    if (!finished.value) {
      const currentSecond = Math.floor(elapsed)
      const lastSample = timeSeries.value[timeSeries.value.length - 1]
      if (!lastSample || Math.floor(lastSample.time) < currentSecond) {
        timeSeries.value.push({
          time: currentSecond,
          wpm: stats.wpm,
          accuracy: stats.accuracy
        })
      }

      // Detect new errors since last check
      const currentErrorCount = errors.value.size
      if (currentErrorCount > lastErrorCount) {
        errorEvents.value.push({
          time: elapsed,
          charIndex: cursorIndex.value
        })
      }
      lastErrorCount = currentErrorCount
    }
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
      // Reset time-series on new run
      timeSeries.value = []
      errorEvents.value = []
      lastErrorCount = 0
      startInterval()
    } else {
      stopInterval()
      cpm.value = 0
      wpm.value = 0
      lpm.value = 0
      accuracy.value = 100
      elapsedSeconds.value = 0
      errorCount.value = 0
      timeSeries.value = []
      errorEvents.value = []
      lastErrorCount = 0
    }
  })

  watch(finished, (val) => {
    if (val) {
      if (startTime.value) {
        elapsedSeconds.value = (Date.now() - startTime.value) / 1000
      }
      // Record final data point
      const stats = getStats(elapsedSeconds.value)
      timeSeries.value.push({
        time: Math.floor(elapsedSeconds.value),
        wpm: stats.wpm,
        accuracy: stats.accuracy
      })
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
    errorCount,
    timeSeries,
    errorEvents
  }
}
