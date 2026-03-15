<script setup lang="ts">
import { shortcutLegend } from '~/config/shortcuts'
</script>

<template>
  <!-- Shortcuts legend — renders each shortcut as UKbd chips + label -->
  <div class="flex items-center justify-center flex-wrap gap-x-5 gap-y-1.5">
    <div
      v-for="entry in shortcutLegend"
      :key="entry.id"
      class="flex items-center gap-1.5"
    >
      <!-- Key chips: render each key as a UKbd, no separator between them -->
      <UKbd
        v-for="key in entry.keys"
        :key="key"
        :value="key"
        size="sm"
        variant="outline"
        color="neutral"
      />

      <!-- Action label -->
      <span
        class="text-[11px] font-mono"
        style="color: var(--text-muted)"
      >
        {{ entry.label }}
      </span>
    </div>
  </div>
</template>
