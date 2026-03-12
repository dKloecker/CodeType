<script setup lang="ts">
import type { CursorStyle } from '~/composables/useCursorConfig'

const category = defineModel<string>('category', { default: 'algorithm' })
const language = defineModel<string>('language', { default: 'python' })
const lineCount = defineModel<number>('lineCount', { default: 30 })
const mode = defineModel<'until-finished' | 'timed'>('mode', { default: 'until-finished' })
const timedDuration = defineModel<30 | 60 | 120>('timedDuration', { default: 60 })
const indentStyle = defineModel<'tabs' | 'spaces'>('indentStyle', { default: 'spaces' })
const spacesPerTab = defineModel<2 | 4>('spacesPerTab', { default: 4 })
const cursorStyle = defineModel<CursorStyle>('cursorStyle', { default: 'line' })

const expanded = ref<string | null>(null)

const sections = {
  language: {
    options: [
      { value: 'python', label: 'python' },
      { value: 'typescript', label: 'typescript' },
      { value: 'cpp', label: 'c++' }
    ]
  },
  category: {
    options: [
      { value: 'algorithm', label: 'algorithms' },
      { value: 'leetcode', label: 'leetcode' },
      { value: 'oss', label: 'oss' },
      { value: 'language-specific', label: 'lang-specific' }
    ]
  },
  lines: {
    options: [
      { value: 10, label: '10' },
      { value: 20, label: '20' },
      { value: 30, label: '30' },
      { value: 50, label: '50' }
    ]
  }
}

const timedDurations = [30, 60, 120] as const
const cursorStyles: CursorStyle[] = ['line', 'underline', 'box']

function toggle(section: string) {
  expanded.value = expanded.value === section ? null : section
}

function currentLabel(section: string): string {
  switch (section) {
    case 'language':
      return sections.language.options.find(o => o.value === language.value)?.label || language.value
    case 'category':
      return sections.category.options.find(o => o.value === category.value)?.label || category.value
    case 'mode':
      return mode.value === 'timed' ? `timed ${timedDuration.value}s` : 'until finished'
    case 'lines':
      return `${lineCount.value} lines`
    case 'indent':
      return indentStyle.value === 'tabs' ? 'tabs' : `${spacesPerTab.value} spaces`
    case 'cursor':
      return cursorStyle.value
    default:
      return ''
  }
}

const containerRef = ref<HTMLElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    expanded.value = null
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div
    ref="containerRef"
    class="fixed top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 rounded-full px-4 py-2 text-sm"
    style="background: rgba(34, 34, 34, 0.85); backdrop-filter: blur(8px); border: 1px solid #333"
  >
    <!-- Language -->
    <button
      class="px-2 py-0.5 transition-colors duration-200"
      :style="{ color: expanded === 'language' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
      @click="toggle('language')"
    >
      {{ currentLabel('language') }}
    </button>
    <div
      class="inline-flex items-center overflow-hidden transition-all duration-300 ease-out"
      :class="expanded === 'language' ? 'max-w-64 opacity-100 ml-1' : 'max-w-0 opacity-0'"
    >
      <button
        v-for="opt in sections.language.options"
        :key="opt.value"
        class="px-1.5 py-0.5 text-xs whitespace-nowrap transition-colors duration-200"
        :style="{ color: language === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="language = opt.value; expanded = null"
      >
        {{ opt.label }}
      </button>
    </div>

    <span class="px-1" style="color: #444">|</span>

    <!-- Category -->
    <button
      class="px-2 py-0.5 transition-colors duration-200"
      :style="{ color: expanded === 'category' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
      @click="toggle('category')"
    >
      {{ currentLabel('category') }}
    </button>
    <div
      class="inline-flex items-center overflow-hidden transition-all duration-300 ease-out"
      :class="expanded === 'category' ? 'max-w-96 opacity-100 ml-1' : 'max-w-0 opacity-0'"
    >
      <button
        v-for="opt in sections.category.options"
        :key="opt.value"
        class="px-1.5 py-0.5 text-xs whitespace-nowrap transition-colors duration-200"
        :style="{ color: category === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="category = opt.value; expanded = null"
      >
        {{ opt.label }}
      </button>
    </div>

    <span class="px-1" style="color: #444">|</span>

    <!-- Mode -->
    <button
      class="px-2 py-0.5 transition-colors duration-200"
      :style="{ color: expanded === 'mode' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
      @click="toggle('mode')"
    >
      {{ currentLabel('mode') }}
    </button>
    <div
      class="inline-flex items-center overflow-hidden transition-all duration-300 ease-out"
      :class="expanded === 'mode' ? 'max-w-80 opacity-100 ml-1' : 'max-w-0 opacity-0'"
    >
      <button
        class="px-1.5 py-0.5 text-xs whitespace-nowrap transition-colors duration-200"
        :style="{ color: mode === 'until-finished' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="mode = 'until-finished'; expanded = null"
      >
        until finished
      </button>
      <button
        v-for="dur in timedDurations"
        :key="dur"
        class="px-1.5 py-0.5 text-xs whitespace-nowrap transition-colors duration-200"
        :style="{ color: mode === 'timed' && timedDuration === dur ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="mode = 'timed'; timedDuration = dur; expanded = null"
      >
        {{ dur }}s
      </button>
    </div>

    <span class="px-1" style="color: #444">|</span>

    <!-- Lines -->
    <button
      class="px-2 py-0.5 transition-colors duration-200"
      :style="{ color: expanded === 'lines' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
      @click="toggle('lines')"
    >
      {{ currentLabel('lines') }}
    </button>
    <div
      class="inline-flex items-center overflow-hidden transition-all duration-300 ease-out"
      :class="expanded === 'lines' ? 'max-w-48 opacity-100 ml-1' : 'max-w-0 opacity-0'"
    >
      <button
        v-for="opt in sections.lines.options"
        :key="opt.value"
        class="px-1.5 py-0.5 text-xs whitespace-nowrap transition-colors duration-200"
        :style="{ color: lineCount === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="lineCount = opt.value; expanded = null"
      >
        {{ opt.label }}
      </button>
    </div>

    <span class="px-1" style="color: #444">|</span>

    <!-- Indent -->
    <button
      class="px-2 py-0.5 transition-colors duration-200"
      :style="{ color: expanded === 'indent' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
      @click="toggle('indent')"
    >
      {{ currentLabel('indent') }}
    </button>
    <div
      class="inline-flex items-center overflow-hidden transition-all duration-300 ease-out"
      :class="expanded === 'indent' ? 'max-w-64 opacity-100 ml-1' : 'max-w-0 opacity-0'"
    >
      <button
        class="px-1.5 py-0.5 text-xs whitespace-nowrap transition-colors duration-200"
        :style="{ color: indentStyle === 'tabs' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="indentStyle = 'tabs'; expanded = null"
      >
        tabs
      </button>
      <button
        class="px-1.5 py-0.5 text-xs whitespace-nowrap transition-colors duration-200"
        :style="{ color: indentStyle === 'spaces' && spacesPerTab === 2 ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="indentStyle = 'spaces'; spacesPerTab = 2; expanded = null"
      >
        2sp
      </button>
      <button
        class="px-1.5 py-0.5 text-xs whitespace-nowrap transition-colors duration-200"
        :style="{ color: indentStyle === 'spaces' && spacesPerTab === 4 ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="indentStyle = 'spaces'; spacesPerTab = 4; expanded = null"
      >
        4sp
      </button>
    </div>

    <span class="px-1" style="color: #444">|</span>

    <!-- Cursor -->
    <button
      class="px-2 py-0.5 transition-colors duration-200"
      :style="{ color: expanded === 'cursor' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
      @click="toggle('cursor')"
    >
      {{ currentLabel('cursor') }}
    </button>
    <div
      class="inline-flex items-center overflow-hidden transition-all duration-300 ease-out"
      :class="expanded === 'cursor' ? 'max-w-48 opacity-100 ml-1' : 'max-w-0 opacity-0'"
    >
      <button
        v-for="style in cursorStyles"
        :key="style"
        class="px-1.5 py-0.5 text-xs whitespace-nowrap transition-colors duration-200"
        :style="{ color: cursorStyle === style ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="cursorStyle = style; expanded = null"
      >
        {{ style }}
      </button>
    </div>
  </div>
</template>
