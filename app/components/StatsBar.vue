<script setup lang="ts">
defineProps<{
  cpm: number
  wpm: number
  lpm: number
  accuracy: number
  elapsedSeconds: number
  active: boolean
}>()

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div
    class="flex items-center justify-center gap-6 py-4 text-sm transition-opacity duration-200"
    :class="active ? 'stats-active' : 'stats-idle'"
  >
    <div>
      <span style="color: var(--text-muted)">LPM: </span>
      <span style="color: var(--text-primary)">{{ lpm.toFixed(1) }}</span>
    </div>
    <span style="color: #333">|</span>
    <div>
      <span style="color: var(--text-muted)">WPM: </span>
      <span style="color: var(--text-primary)">{{ Math.round(wpm) }}</span>
    </div>
    <span style="color: #333">|</span>
    <div>
      <span style="color: var(--text-muted)">CPM: </span>
      <span style="color: var(--text-primary)">{{ Math.round(cpm) }}</span>
    </div>
    <span style="color: #333">|</span>
    <div>
      <span style="color: var(--text-muted)">ACC: </span>
      <span style="color: var(--text-primary)">{{ accuracy.toFixed(1) }}%</span>
    </div>
    <span style="color: #333">|</span>
    <div>
      <span style="color: var(--text-muted)">TIME: </span>
      <span style="color: var(--text-primary)">{{ formatTime(elapsedSeconds) }}</span>
    </div>
  </div>
</template>
