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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-6 text-sm rounded-full px-6 py-3 transition-opacity duration-200"
    :class="active ? 'stats-active' : 'stats-idle'"
    style="background: var(--bg-surface); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.06)"
  >
    <div>
      <span style="color: var(--text-muted)">LPM: </span>
      <span style="color: var(--text-primary)">{{ lpm.toFixed(1) }}</span>
    </div>
    <span style="color: rgba(255,255,255,0.08)">|</span>
    <div>
      <span style="color: var(--text-muted)">WPM: </span>
      <span style="color: var(--text-primary)">{{ Math.round(wpm) }}</span>
    </div>
    <span style="color: rgba(255,255,255,0.08)">|</span>
    <div>
      <span style="color: var(--text-muted)">CPM: </span>
      <span style="color: var(--text-primary)">{{ Math.round(cpm) }}</span>
    </div>
    <span style="color: rgba(255,255,255,0.08)">|</span>
    <div>
      <span style="color: var(--text-muted)">ACC: </span>
      <span style="color: var(--text-primary)">{{ accuracy.toFixed(1) }}%</span>
    </div>
    <span style="color: rgba(255,255,255,0.08)">|</span>
    <div v-if="props.mode === 'timed'">
      <span style="color: var(--text-muted)">LEFT: </span>
      <span
        :style="{ color: remainingSeconds < 10 ? 'var(--accent-primary)' : 'var(--text-primary)' }"
      >{{ formatTime(Math.max(0, remainingSeconds)) }}</span>
    </div>
    <div v-else>
      <span style="color: var(--text-muted)">TIME: </span>
      <span style="color: var(--text-primary)">{{ formatTime(elapsedSeconds) }}</span>
    </div>
  </div>
</template>
