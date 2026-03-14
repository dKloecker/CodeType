<script setup lang="ts">
const props = defineProps<{ content: string }>()

const html = computed(() => {
  return props.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
})
</script>

<template>
  <div
    class="text-sm leading-relaxed [&_strong]:font-medium [&_code]:text-xs [&_code]:px-1 [&_code]:rounded [&_code]:bg-white/5"
    style="color: var(--text-muted)"
    v-html="html"
  />
</template>
