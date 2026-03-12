<script setup lang="ts">
defineProps<{
  wpm: number
  cpm: number
  lpm: number
  accuracy: number
  elapsedSeconds: number
  errorCount: number
}>()

const emit = defineEmits<{
  restart: []
}>()

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
  }
  if (e.key === 'Enter' && tabPressed) {
    emit('restart')
  }
}

let tabPressed = false

function handleKeydownGlobal(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    tabPressed = true
    e.preventDefault()
  } else if (e.key === 'Enter' && tabPressed) {
    emit('restart')
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
</script>

<template>
  <div
    class="results-overlay absolute inset-0 flex items-center justify-center z-10"
    style="background: color-mix(in srgb, var(--bg-base) 92%, transparent)"
    @keydown="handleKeydown"
  >
    <div class="text-center">
      <h2
        class="text-2xl font-light tracking-wider mb-8"
        style="color: var(--accent-primary)"
      >
        results
      </h2>

      <div class="grid grid-cols-3 gap-x-12 gap-y-6 mb-10">
        <div>
          <div class="text-3xl font-light" style="color: var(--text-primary)">
            {{ Math.round(wpm) }}
          </div>
          <div class="text-xs mt-1" style="color: var(--text-muted)">
            WPM
          </div>
        </div>

        <div>
          <div class="text-3xl font-light" style="color: var(--text-primary)">
            {{ Math.round(cpm) }}
          </div>
          <div class="text-xs mt-1" style="color: var(--text-muted)">
            CPM
          </div>
        </div>

        <div>
          <div class="text-3xl font-light" style="color: var(--text-primary)">
            {{ lpm.toFixed(1) }}
          </div>
          <div class="text-xs mt-1" style="color: var(--text-muted)">
            LPM
          </div>
        </div>

        <div>
          <div class="text-3xl font-light" style="color: var(--text-primary)">
            {{ accuracy.toFixed(1) }}%
          </div>
          <div class="text-xs mt-1" style="color: var(--text-muted)">
            accuracy
          </div>
        </div>

        <div>
          <div class="text-3xl font-light" style="color: var(--text-primary)">
            {{ formatTime(elapsedSeconds) }}
          </div>
          <div class="text-xs mt-1" style="color: var(--text-muted)">
            time
          </div>
        </div>

        <div>
          <div class="text-3xl font-light" style="color: var(--error-color)">
            {{ errorCount }}
          </div>
          <div class="text-xs mt-1" style="color: var(--text-muted)">
            errors
          </div>
        </div>
      </div>

      <p class="text-xs" style="color: var(--text-muted)">
        tab + enter — new snippet
      </p>
    </div>
  </div>
</template>
