<script setup lang="ts">
const props = defineProps<{
  cpm: number
  wpm: number
  lpm: number
  accuracy: number
  elapsedSeconds: number
  active: boolean
  mode: 'until-finished' | 'timed'
  remainingSeconds: number
}>()

interface Stat {
  label: string
  value: string
  highlight?: boolean
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const stats = computed<Stat[]>(() => [
  { label: 'LPM', value: props.lpm.toFixed(1) },
  { label: 'WPM', value: String(Math.round(props.wpm)) },
  { label: 'CPM', value: String(Math.round(props.cpm)) },
  { label: 'ACC', value: `${props.accuracy.toFixed(1)}%` },
  props.mode === 'timed'
    ? { label: 'LEFT', value: formatTime(Math.max(0, props.remainingSeconds)), highlight: props.remainingSeconds < 10 }
    : { label: 'TIME', value: formatTime(props.elapsedSeconds) }
])
</script>

<template>
  <BasePill
    rounded="full"
    blur
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-200 font-mono text-sm"
    :class="active ? 'opacity-100' : 'opacity-40'"
  >
    <template
      v-for="(stat, i) in stats"
      :key="stat.label"
    >
      <div
        v-if="i > 0"
        class="w-px h-4 shrink-0"
        style="background: rgba(255,255,255,0.1)"
      />
      <div class="flex items-baseline gap-1.5 px-4 py-2.5">
        <span
          class="text-[10px] uppercase tracking-widest"
          style="color: var(--text-muted)"
        >{{ stat.label }}</span>
        <span
          class="font-semibold"
          :style="{ color: stat.highlight ? 'var(--accent-primary)' : 'var(--text-primary)' }"
        >{{ stat.value }}</span>
      </div>
    </template>
  </BasePill>
</template>
