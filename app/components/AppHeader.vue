<script setup lang="ts">
const showSettings = defineModel<boolean>('showSettings', { default: false })
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4">
    <span
      class="text-sm tracking-[0.2em] font-light"
      style="color: var(--text-muted)"
    >
      codetype
    </span>

    <button
      class="p-2 rounded transition-opacity duration-200 hover:opacity-70"
      style="color: var(--text-muted)"
      aria-label="Settings"
      @click="showSettings = !showSettings"
    >
      <UIcon name="i-lucide-settings" class="w-5 h-5" />
    </button>
  </header>
</template>
