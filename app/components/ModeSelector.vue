<script setup lang="ts">
const category = defineModel<string>('category', { default: 'algorithm' })
const language = defineModel<string>('language', { default: 'python' })
const lineCount = defineModel<number>('lineCount', { default: 30 })

const categories = [
  { value: 'algorithm', label: 'algorithms' },
  { value: 'leetcode', label: 'leetcode' },
  { value: 'oss', label: 'oss' },
  { value: 'language-specific', label: 'language-specific' }
]

const languages = [
  { value: 'python', label: 'python' },
  { value: 'typescript', label: 'typescript' },
  { value: 'cpp', label: 'c++' }
]

const lineCounts = [10, 20, 30, 50]
</script>

<template>
  <div class="flex flex-col items-center gap-3 py-4">
    <!-- Category selector -->
    <div class="flex gap-4">
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="px-2 py-1 text-sm transition-all duration-200 border-b-2"
        :class="category === cat.value
          ? 'border-[var(--accent-primary)]'
          : 'border-transparent hover:opacity-70'"
        :style="{ color: category === cat.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="category = cat.value"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Language selector -->
    <div class="flex gap-4">
      <button
        v-for="lang in languages"
        :key="lang.value"
        class="px-2 py-1 text-sm transition-all duration-200 border-b-2"
        :class="language === lang.value
          ? 'border-[var(--accent-primary)]'
          : 'border-transparent hover:opacity-70'"
        :style="{ color: language === lang.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="language = lang.value"
      >
        {{ lang.label }}
      </button>
    </div>

    <!-- Line count selector -->
    <div class="flex gap-4">
      <button
        v-for="count in lineCounts"
        :key="count"
        class="px-2 py-1 text-sm transition-all duration-200 border-b-2"
        :class="lineCount === count
          ? 'border-[var(--accent-primary)]'
          : 'border-transparent hover:opacity-70'"
        :style="{ color: lineCount === count ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="lineCount = count"
      >
        {{ count }} lines
      </button>
    </div>
  </div>
</template>
