<script setup lang="ts">
import {
  VisXYContainer,
  VisLine,
  VisArea,
  VisAxis,
  VisCrosshair,
  VisTooltip
} from '@unovis/vue'
import { CurveType } from '@unovis/ts'
import type { TimeSeriesPoint, ErrorEvent } from '~/composables/useMetrics'
import type { Snippet } from '~~/server/types/snippet'
import { downsampleLTTB } from '~/utils/downsample'

const DOWNSAMPLE_THRESHOLD = 35

const props = defineProps<{
  wpm: number
  cpm: number
  lpm: number
  accuracy: number
  elapsedSeconds: number
  errorCount: number
  timeSeries: TimeSeriesPoint[]
  errorEvents: ErrorEvent[]
  snippet: Snippet | null
}>()

const emit = defineEmits<{
  restart: []
  next: []
  tryLanguage: [language: string]
  close: []
}>()

const showDescription = ref(false)

// ── Tab+Enter → next snippet ──
const { handle: handleTabEnter } = useTabEnterShortcut(() => emit('next'))

function handleKeydownGlobal(e: KeyboardEvent) {
  handleTabEnter(e)
}

onMounted(() => window.addEventListener('keydown', handleKeydownGlobal))
onUnmounted(() => window.removeEventListener('keydown', handleKeydownGlobal))

// ── Chart ──

const chartPoints = computed(() => {
  if (props.timeSeries.length < 2) return []
  return downsampleLTTB(
    props.timeSeries,
    DOWNSAMPLE_THRESHOLD,
    d => d.time,
    d => d.wpm
  )
})

const maxWpm = computed(() => {
  const max = Math.max(...props.timeSeries.map(p => p.wpm), 10)
  return Math.ceil(max / 20) * 20
})

// Accessors
const x = (_d: TimeSeriesPoint, i: number) => i
const yWpm = (d: TimeSeriesPoint) => d.wpm
const yAcc = (d: TimeSeriesPoint) => (d.accuracy / 100) * maxWpm.value

// Error markers — map error timestamps to nearest downsampled chart index
const chartContainerRef = useTemplateRef<HTMLElement>('chartContainerRef')
const containerWidth = ref(0)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (chartContainerRef.value) {
    containerWidth.value = chartContainerRef.value.offsetWidth
    resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) containerWidth.value = entry.contentRect.width
    })
    resizeObserver.observe(chartContainerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

const CHART_HEIGHT = 200
const CHART_PADDING = { top: 20, left: 42, right: 10, bottom: 36 }

const errorMarkers = computed(() => {
  const pts = chartPoints.value
  if (!props.errorEvents.length || pts.length < 2 || !containerWidth.value) return []
  const n = pts.length - 1
  const innerW = containerWidth.value - CHART_PADDING.left - CHART_PADDING.right

  return props.errorEvents.map((e) => {
    let nearest = 0
    let minDiff = Infinity
    pts.forEach((cp, i) => {
      const diff = Math.abs(cp.time - e.time)
      if (diff < minDiff) {
        minDiff = diff
        nearest = i
      }
    })
    return {
      cx: CHART_PADDING.left + (nearest / n) * innerW,
      cy: CHART_PADDING.top + 4
    }
  })
})

const xTickFormat = (i: number) => {
  const point = chartPoints.value[i]
  if (!point) return ''
  return `${Math.round(point.time)}s`
}

const tooltipTemplate = (d: { data: TimeSeriesPoint }) => {
  const p = d.data
  if (!p) return ''
  return `<div style="font-size:12px;font-family:inherit;padding:4px 8px">
    <div style="color:var(--accent-primary);font-weight:600">${Math.round(p.wpm)} WPM</div>
    <div style="color:var(--text-muted)">${Math.round(p.accuracy)}% acc</div>
    <div style="color:var(--text-muted)">${p.time.toFixed(1)}s</div>
  </div>`
}

// ── Stats row (config-driven) ──
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
  const cv = mean > 0 ? stddev / mean : 0
  return Math.max(0, Math.round((1 - cv) * 100))
})

const statsRow = computed(() => [
  {
    label: 'test type',
    value: props.snippet?.title ?? 'code snippet',
    sub: props.snippet?.category
      ? `${props.snippet.category}${props.snippet.subcategory ? ` / ${props.snippet.subcategory}` : ''}${props.snippet.difficulty ? ` · ${props.snippet.difficulty}` : ''}`
      : undefined,
    align: 'left' as const,
    size: 'sm' as const
  },
  { label: 'raw', value: String(Math.round(props.cpm / 5)) },
  { label: 'characters', value: charBreakdown.value },
  { label: 'consistency', value: `${consistency.value}%` },
  { label: 'time', value: `${Math.round(props.elapsedSeconds)}s` }
])

// Fetch other languages for the same slug
const otherLanguages = ref<string[]>([])

watchEffect(async () => {
  if (!props.snippet?.slug) {
    otherLanguages.value = []
    return
  }
  try {
    const data = await $fetch<{ catalog: { id: string, language: string, slug: string }[] }>('/api/snippets/catalog')
    otherLanguages.value = data.catalog
      .filter(s => s.slug === props.snippet!.slug && s.id !== props.snippet!.id)
      .map(s => s.language)
  } catch {
    otherLanguages.value = []
  }
})
</script>

<template>
  <div
    class="results-overlay absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm"
    style="background: color-mix(in srgb, var(--bg-base) 85%, transparent)"
    @click.self="emit('close')"
  >
    <div class="results-content w-full max-w-[780px] px-6">
      <!-- ═══ Top row: big WPM + ACC on the left ═══ -->
      <div class="flex items-start gap-12 mb-6">
        <!-- Left stats column -->
        <div class="shrink-0">
          <div
            class="text-xs mb-1"
            style="color: var(--text-muted)"
          >
            wpm
          </div>
          <div
            class="text-5xl font-light leading-none mb-4"
            style="color: var(--accent-primary)"
          >
            {{ Math.round(wpm) }}
          </div>
          <div
            class="text-xs mb-1"
            style="color: var(--text-muted)"
          >
            acc
          </div>
          <div
            class="text-5xl font-light leading-none"
            style="color: var(--accent-primary)"
          >
            {{ Math.round(accuracy) }}%
          </div>
        </div>

        <!-- Chart -->
        <div
          ref="chartContainerRef"
          class="chart-container flex-1 min-w-0"
        >
          <template v-if="chartPoints.length >= 2">
            <VisXYContainer
              :data="chartPoints"
              :padding="{ top: 20 }"
              :height="200"
            >
              <VisArea
                :x="x"
                :y="yWpm"
                color="var(--accent-primary)"
                :opacity="0.08"
                :curve-type="CurveType.MonotoneX"
              />
              <VisLine
                :x="x"
                :y="yWpm"
                color="var(--accent-primary)"
                :line-width="2.5"
                :curve-type="CurveType.MonotoneX"
              />
              <VisLine
                :x="x"
                :y="yAcc"
                color="var(--text-muted)"
                :line-width="1.5"
                :curve-type="CurveType.MonotoneX"
                :opacity="0.35"
              />
              <VisAxis
                type="x"
                :tick-format="xTickFormat"
              />
              <VisAxis
                type="y"
                label="WPM"
              />
              <VisCrosshair
                color="var(--accent-primary)"
                :template="tooltipTemplate"
              />
              <VisTooltip />
            </VisXYContainer>

            <!-- Error markers (SVG overlay) -->
            <svg
              v-if="errorMarkers.length"
              class="absolute inset-0 pointer-events-none"
              :width="containerWidth"
              :height="CHART_HEIGHT"
            >
              <g
                v-for="(m, i) in errorMarkers"
                :key="i"
              >
                <line
                  :x1="m.cx - 4"
                  :y1="m.cy - 4"
                  :x2="m.cx + 4"
                  :y2="m.cy + 4"
                  stroke="var(--error-color)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <line
                  :x1="m.cx + 4"
                  :y1="m.cy - 4"
                  :x2="m.cx - 4"
                  :y2="m.cy + 4"
                  stroke="var(--error-color)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </g>
            </svg>

            <!-- Legend -->
            <div
              class="flex items-center gap-4 mt-2"
              style="color: var(--text-muted); font-size: 10px"
            >
              <span class="flex items-center gap-1">
                <span
                  class="inline-block w-2.5 h-0.5 rounded-full"
                  style="background: var(--accent-primary)"
                />
                WPM
              </span>
              <span class="flex items-center gap-1">
                <span
                  class="inline-block w-2.5 h-0.5 rounded-full opacity-35"
                  style="background: var(--text-muted)"
                />
                Accuracy
              </span>
              <span
                v-if="errorEvents.length"
                class="flex items-center gap-1"
              >
                <span
                  class="inline-block w-2 h-2"
                  style="color: var(--error-color)"
                >✕</span>
                Errors
              </span>
            </div>
          </template>

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

      <!-- ═══ Stats row (config-driven) ═══ -->
      <div class="flex items-start justify-between gap-6 mb-4 px-1">
        <div
          v-for="stat in statsRow"
          :key="stat.label"
          :class="stat.align === 'left' ? '' : 'text-center'"
        >
          <div
            class="text-xs mb-0.5"
            style="color: var(--text-muted)"
          >
            {{ stat.label }}
          </div>
          <div
            :class="stat.size === 'sm' ? 'text-sm font-medium' : 'text-2xl font-light'"
            style="color: var(--text-primary)"
          >
            {{ stat.value }}
          </div>
          <div
            v-if="stat.sub"
            class="text-xs mt-0.5"
            style="color: var(--text-muted)"
          >
            {{ stat.sub }}
          </div>
        </div>
      </div>

      <!-- ═══ Tags ═══ -->
      <div
        v-if="snippet?.tags?.length"
        class="flex flex-wrap gap-1.5 mb-4 px-1"
      >
        <span
          v-for="tag in snippet.tags"
          :key="tag"
          class="text-[11px] px-2 py-0.5 rounded-full"
          style="background: rgba(255,255,255,0.06); color: var(--text-muted)"
        >
          {{ tag }}
        </span>
      </div>

      <!-- ═══ Description (collapsible) ═══ -->
      <div
        v-if="snippet?.description"
        class="mb-4 px-1"
      >
        <button
          class="text-xs mb-2 flex items-center gap-1"
          style="color: var(--text-muted)"
          @click="showDescription = !showDescription"
        >
          <UIcon
            :name="showDescription ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
            class="w-3 h-3"
          />
          about this snippet
        </button>
        <div v-if="showDescription">
          <MarkdownDescription :content="snippet.description" />
        </div>
      </div>

      <!-- ═══ Try in another language ═══ -->
      <div
        v-if="otherLanguages.length > 0"
        class="flex items-center gap-2 mb-4 px-1"
      >
        <span
          class="text-xs"
          style="color: var(--text-muted)"
        >try in</span>
        <button
          v-for="lang in otherLanguages"
          :key="lang"
          class="text-xs px-2 py-0.5 rounded"
          style="color: var(--accent-primary); background: rgba(255,255,255,0.04)"
          @click="emit('tryLanguage', lang)"
        >
          {{ lang === 'cpp' ? 'c++' : lang }}
        </button>
      </div>

      <!-- ═══ Action footer ═══ -->
      <div class="flex items-center justify-center gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-chevron-right"
          title="Next test"
          @click="emit('next')"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-rotate-ccw"
          title="Redo"
          @click="emit('restart')"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-triangle-alert"
          title="Practice errors"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-align-justify"
          title="Toggle line chart"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-rewind"
          title="Rewind"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-download"
          title="Share / export"
        />
      </div>
    </div>
  </div>
</template>

<style>
/* ── Chart container fade-in ── */
.chart-container {
  animation: chartFadeIn 600ms ease-out both;
  animation-delay: 200ms;
  position: relative;
}

@keyframes chartFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ── Results content slide-in ── */
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

/* ── Unovis dark theme overrides ── */
.unovis-xy-container {
  --vis-axis-grid-color: rgba(255, 255, 255, 0.04);
  --vis-axis-tick-color: var(--text-muted);
  --vis-axis-label-color: var(--text-muted);
  --vis-axis-tick-label-color: var(--text-muted);
  --vis-axis-tick-label-font-size: 9px;
  --vis-axis-label-font-size: 8px;
  --vis-tooltip-background-color: var(--bg-surface);
  --vis-tooltip-border-color: rgba(255, 255, 255, 0.08);
  --vis-tooltip-text-color: var(--text-primary);
  --vis-crosshair-line-stroke-color: var(--accent-primary);
  --vis-crosshair-line-stroke-opacity: 0.3;
  font-family: 'JetBrains Mono', monospace;
}
</style>
