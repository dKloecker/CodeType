<script setup lang="ts">
defineProps<{
  blur?: boolean
  rounded?: 'sm' | 'full'
}>()
</script>

<template>
  <div
    class="inline-flex items-center"
    :class="[
      rounded === 'full' ? 'rounded-full' : 'rounded-[10px]',
      blur ? 'backdrop-blur-md' : ''
    ]"
    style="background: var(--ui-bg-elevated); border: 1px solid rgba(255,255,255,0.06)"
  >
    <slot />
  </div>
</template>
