<script setup lang="ts">
import type { TimeSeriesPoint, ErrorEvent } from '~/composables/useMetrics'

const props = defineProps<{
  wpm: number
  cpm: number
  lpm: number
  accuracy: number
  elapsedSeconds: number
  errorCount: number
  timeSeries: TimeSeriesPoint[]
  errorEvents: ErrorEvent[]
}>()

const emit = defineEmits<{
  restart: []
  next: []
}>()

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Tab+Enter restart ──
let tabPressed = false

function handleKeydownGlobal(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    tabPressed = true
    e.preventDefault()
  } else if (e.key === 'Enter' && tabPressed) {
    emit('next')
    tabPressed = false
  } else {
    tabPressed = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydownGlobal)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydownGlobal)
})

// ── SVG Chart computation ──
const chartWidth = 700
const chartHeight = 200
const padLeft = 48
const padRight = 16
const padTop = 20
const padBottom = 28

const plotW = chartWidth - padLeft - padRight
const plotH = chartHeight - padTop - padBottom

const chartData = computed(() => {
  const series = props.timeSeries
  if (series.length < 2) return null

  const maxTime = series[series.length - 1]!.time || 1
  const maxWpm = Math.max(...series.map(p => p.wpm), 10)
  // Round up to nice ceiling
  const wpmCeil = Math.ceil(maxWpm / 20) * 20

  function xPos(t: number) {
    return padLeft + (t / maxTime) * plotW
  }

  function yWpm(w: number) {
    return padTop + plotH - (w / wpmCeil) * plotH
  }

  function yAcc(a: number) {
    // accuracy is 0-100, map to full height
    return padTop + plotH - (a / 100) * plotH
  }

  // Build WPM path
  const wpmPoints = series.map(p => ({ x: xPos(p.time), y: yWpm(p.wpm) }))
  const wpmPath = buildSmoothPath(wpmPoints)

  // Build accuracy path
  const accPoints = series.map(p => ({ x: xPos(p.time), y: yAcc(p.accuracy) }))
  const accPath = buildSmoothPath(accPoints)

  // Error markers — snap to nearest time on the X axis
  const errorMarkers = props.errorEvents.map(e => ({
    x: xPos(e.time),
    yTop: padTop - 4
  }))

  // Y axis ticks for WPM (left side)
  const wpmTicks: { y: number; label: string }[] = []
  const tickStep = wpmCeil <= 40 ? 10 : 20
  for (let v = 0; v <= wpmCeil; v += tickStep) {
    wpmTicks.push({ y: yWpm(v), label: String(v) })
  }

  // X axis ticks
  const xTicks: { x: number; label: string }[] = []
  const timeStep = maxTime <= 10 ? 1 : maxTime <= 30 ? 5 : 10
  for (let t = 0; t <= maxTime; t += timeStep) {
    xTicks.push({ x: xPos(t), label: String(t) })
  }

  // Accuracy ticks (right side)
  const accTicks = [
    { y: yAcc(100), label: '1' },
    { y: yAcc(50), label: '.5' },
    { y: yAcc(0), label: '0' }
  ]

  return {
    wpmPath,
    accPath,
    errorMarkers,
    wpmTicks,
    xTicks,
    accTicks,
    wpmCeil,
    maxTime
  }
})

// Build a smooth catmull-rom-like SVG path
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`

  let d = `M ${points[0]!.x} ${points[0]!.y}`

  if (points.length === 2) {
    d += ` L ${points[1]!.x} ${points[1]!.y}`
    return d
  }

  // Use monotone cubic interpolation for a smooth, non-overshooting curve
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = points[Math.min(points.length - 1, i + 2)]!

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return d
}

// Characters breakdown: correct / incorrect / missed / extra
const charBreakdown = computed(() => {
  const total = props.cpm > 0 ? Math.round((props.cpm / 60) * props.elapsedSeconds) : 0
  const incorrect = props.errorCount
  const correct = Math.max(0, total - incorrect)
  return `${correct}/${incorrect}/0/0`
})

const consistency = computed(() => {
  if (props.timeSeries.length < 2) return 0
  const wpms = props.timeSeries.map(p => p.wpm).filter(w => w > 0)
  if (wpms.length < 2) return 100
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length
  const variance = wpms.reduce((a, w) => a + (w - mean) ** 2, 0) / wpms.length
  const stddev = Math.sqrt(variance)
  // Consistency = 100% when stddev is 0, decreases with more variation
  const cv = mean > 0 ? stddev / mean : 0
  return Math.max(0, Math.round((1 - cv) * 100))
})
</script>

<template>
  <div
    class="results-overlay absolute inset-0 flex items-center justify-center z-10"
    style="background: color-mix(in srgb, var(--bg-base) 95%, transparent)"
  >
    <div class="results-content w-full max-w-[780px] px-6">
      <!-- ═══ Top row: big WPM + ACC on the left ═══ -->
      <div class="flex items-start gap-12 mb-6">
        <!-- Left stats column -->
        <div class="shrink-0">
          <div class="text-xs mb-1" style="color: var(--text-muted)">wpm</div>
          <div class="text-5xl font-light leading-none mb-4" style="color: var(--accent-primary)">
            {{ Math.round(wpm) }}
          </div>
          <div class="text-xs mb-1" style="color: var(--text-muted)">acc</div>
          <div class="text-5xl font-light leading-none" style="color: var(--accent-primary)">
            {{ Math.round(accuracy) }}%
          </div>
        </div>

        <!-- Chart -->
        <div class="flex-1 min-w-0">
          <svg
            v-if="chartData"
            :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
            class="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- Grid lines -->
            <line
              v-for="tick in chartData.wpmTicks"
              :key="'grid-' + tick.label"
              :x1="padLeft"
              :y1="tick.y"
              :x2="chartWidth - padRight"
              :y2="tick.y"
              stroke="rgba(255,255,255,0.04)"
              stroke-width="1"
            />

            <!-- Y axis labels (WPM, left) -->
            <text
              v-for="tick in chartData.wpmTicks"
              :key="'ylabel-' + tick.label"
              :x="padLeft - 8"
              :y="tick.y + 3"
              text-anchor="end"
              fill="var(--text-muted)"
              font-size="9"
              font-family="inherit"
            >{{ tick.label }}</text>

            <!-- Y axis label text -->
            <text
              :x="8"
              :y="padTop + plotH / 2"
              text-anchor="middle"
              fill="var(--text-muted)"
              font-size="8"
              font-family="inherit"
              transform="rotate(-90, 8, 128)"
            >Words per Minute</text>

            <!-- X axis labels -->
            <text
              v-for="tick in chartData.xTicks"
              :key="'xlabel-' + tick.label"
              :x="tick.x"
              :y="chartHeight - 4"
              text-anchor="middle"
              fill="var(--text-muted)"
              font-size="9"
              font-family="inherit"
            >{{ tick.label }}</text>

            <!-- Right axis labels (accuracy 0-1) -->
            <text
              v-for="tick in chartData.accTicks"
              :key="'accl-' + tick.label"
              :x="chartWidth - padRight + 8"
              :y="tick.y + 3"
              text-anchor="start"
              fill="var(--text-muted)"
              font-size="9"
              font-family="inherit"
              opacity="0.5"
            >{{ tick.label }}</text>

            <!-- Right axis label text -->
            <text
              :x="chartWidth - 4"
              :y="padTop + plotH / 2"
              text-anchor="middle"
              fill="var(--text-muted)"
              font-size="8"
              font-family="inherit"
              :transform="`rotate(90, ${chartWidth - 4}, ${padTop + plotH / 2})`"
            >Errors</text>

            <!-- Accuracy line (subtle, behind WPM) -->
            <path
              :d="chartData.accPath"
              fill="none"
              stroke="var(--text-muted)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.35"
              class="chart-line chart-line-acc"
            />

            <!-- WPM line (prominent) -->
            <path
              :d="chartData.wpmPath"
              fill="none"
              stroke="var(--accent-primary)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="chart-line chart-line-wpm"
            />

            <!-- Data points on WPM -->
            <circle
              v-for="(p, i) in timeSeries"
              :key="'dot-' + i"
              :cx="padLeft + (p.time / (chartData.maxTime || 1)) * plotW"
              :cy="padTop + plotH - (p.wpm / (chartData.wpmCeil || 1)) * plotH"
              r="2.5"
              fill="var(--bg-surface)"
              stroke="var(--accent-primary)"
              stroke-width="1.5"
              class="chart-dot"
            />

            <!-- Error markers (small x's at top) -->
            <text
              v-for="(e, i) in chartData.errorMarkers"
              :key="'err-' + i"
              :x="e.x"
              :y="e.yTop"
              text-anchor="middle"
              fill="var(--error-color)"
              font-size="10"
              font-weight="500"
            >x</text>
          </svg>

          <!-- Fallback if not enough data -->
          <div
            v-else
            class="flex items-center justify-center h-32"
            style="color: var(--text-muted)"
          >
            not enough data to chart
          </div>
        </div>
      </div>

      <!-- ═══ Stats row (below chart) ═══ -->
      <div class="flex items-start justify-between gap-6 mb-8 px-1">
        <div>
          <div class="text-xs mb-0.5" style="color: var(--text-muted)">test type</div>
          <div class="text-sm font-medium" style="color: var(--text-primary)">code snippet</div>
        </div>
        <div class="text-center">
          <div class="text-xs mb-0.5" style="color: var(--text-muted)">raw</div>
          <div class="text-2xl font-light" style="color: var(--text-primary)">{{ Math.round(cpm / 5) }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs mb-0.5" style="color: var(--text-muted)">characters</div>
          <div class="text-2xl font-light" style="color: var(--text-primary)">{{ charBreakdown }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs mb-0.5" style="color: var(--text-muted)">consistency</div>
          <div class="text-2xl font-light" style="color: var(--text-primary)">{{ consistency }}%</div>
        </div>
        <div class="text-center">
          <div class="text-xs mb-0.5" style="color: var(--text-muted)">time</div>
          <div class="text-2xl font-light" style="color: var(--text-primary)">{{ Math.round(elapsedSeconds) }}s</div>
        </div>
      </div>

      <!-- ═══ Action footer ═══ -->
      <div class="flex items-center justify-center gap-8">
        <button
          class="action-icon"
          style="color: var(--text-muted)"
          title="Next test"
          @click="emit('next')"
        >
          <UIcon name="i-lucide-chevron-right" class="w-5 h-5" />
        </button>
        <button
          class="action-icon"
          style="color: var(--text-muted)"
          title="Redo"
          @click="emit('restart')"
        >
          <UIcon name="i-lucide-rotate-ccw" class="w-5 h-5" />
        </button>
        <button
          class="action-icon"
          style="color: var(--text-muted)"
          title="Practice errors"
        >
          <UIcon name="i-lucide-triangle-alert" class="w-5 h-5" />
        </button>
        <button
          class="action-icon"
          style="color: var(--text-muted)"
          title="Toggle line chart"
        >
          <UIcon name="i-lucide-align-justify" class="w-5 h-5" />
        </button>
        <button
          class="action-icon"
          style="color: var(--text-muted)"
          title="Rewind"
        >
          <UIcon name="i-lucide-rewind" class="w-5 h-5" />
        </button>
        <button
          class="action-icon"
          style="color: var(--text-muted)"
          title="Share / export"
        >
          <UIcon name="i-lucide-download" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* ── Chart line draw-in animation ── */
.chart-line {
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: drawLine 1.2s ease-out forwards;
}

.chart-line-acc {
  animation-delay: 0.15s;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

/* ── Data dots fade in ── */
.chart-dot {
  opacity: 0;
  animation: dotFadeIn 0.3s ease forwards;
}

.chart-dot:nth-child(1) { animation-delay: 0.6s; }
.chart-dot:nth-child(2) { animation-delay: 0.65s; }
.chart-dot:nth-child(3) { animation-delay: 0.7s; }
.chart-dot:nth-child(4) { animation-delay: 0.75s; }
.chart-dot:nth-child(5) { animation-delay: 0.8s; }
.chart-dot:nth-child(6) { animation-delay: 0.85s; }
.chart-dot:nth-child(7) { animation-delay: 0.9s; }
.chart-dot:nth-child(8) { animation-delay: 0.95s; }
.chart-dot:nth-child(9) { animation-delay: 1.0s; }
.chart-dot:nth-child(10) { animation-delay: 1.05s; }
.chart-dot:nth-child(n+11) { animation-delay: 1.1s; }

@keyframes dotFadeIn {
  to {
    opacity: 1;
  }
}

/* ── Results content fade-slide in ── */
.results-content {
  animation: resultSlideIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes resultSlideIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Action footer icons ── */
.action-icon {
  padding: 8px;
  border-radius: 8px;
  transition: color 150ms ease, background 150ms ease;
}

.action-icon:hover {
  color: var(--text-primary) !important;
  background: rgba(255, 255, 255, 0.04);
}
</style>
