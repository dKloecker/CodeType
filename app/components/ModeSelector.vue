<script setup lang="ts">
import type { CursorStyle } from '~/composables/useCursorConfig'

interface CategorySection {
  key: string
  icon: string
  label: string
  showCurrentValue: boolean
  exclusive: boolean
}

const language = defineModel<string>('language', { default: '' })
const category = defineModel<string>('category', { default: 'algorithm' })
const lineCount = defineModel<number>('lineCount', { default: 10 })
const mode = defineModel<'until-finished' | 'timed'>('mode', { default: 'until-finished' })
const timedDuration = defineModel<10 | 30 | 60>('timedDuration', { default: 30 })
const indentStyle = defineModel<'tabs' | 'spaces'>('indentStyle', { default: 'spaces' })
const spacesPerTab = defineModel<2 | 4>('spacesPerTab', { default: 4 })
const cursorStyle = defineModel<CursorStyle>('cursorStyle', { default: 'line' })

const categories: CategorySection[] = [
  { key: 'language', icon: 'i-lucide-code-2', label: 'language', showCurrentValue: true, exclusive: false },
  { key: 'content', icon: 'i-lucide-layers', label: 'content', showCurrentValue: true, exclusive: false },
  { key: 'size', icon: 'i-lucide-ruler', label: 'size', showCurrentValue: true, exclusive: false },
  { key: 'mode', icon: 'i-lucide-timer', label: 'mode', showCurrentValue: true, exclusive: false },
  { key: 'settings', icon: 'i-lucide-sliders-horizontal', label: 'settings', showCurrentValue: false, exclusive: true },
]

const languageOptions = [
  { value: '', label: 'random' },
  { value: 'python', label: 'python' },
  { value: 'typescript', label: 'typescript' },
  { value: 'cpp', label: 'c++' },
]

const contentOptions = [
  { value: 'algorithm', label: 'algorithms' },
  { value: 'leetcode', label: 'leetcode' },
  { value: 'oss', label: 'open source' },
]

const sizeOptions = [
  { value: 1, label: '1 liner' },
  { value: 5, label: '5 lines' },
  { value: 10, label: '10 lines' },
  { value: 20, label: '20 lines' },
  { value: 50, label: '50 lines' },
]

const cursorOptions: { value: CursorStyle; label: string }[] = [
  { value: 'block', label: 'block' },
  { value: 'line', label: 'line' },
  { value: 'underlined', label: 'underlined' },
]

const timedDurations = [10, 30, 60] as const

const openSections = ref(new Set<string>())

const hasOpenSections = computed(() => openSections.value.size > 0)

function isOpen(key: string) {
  return openSections.value.has(key)
}

function toggle(section: CategorySection) {
  if (openSections.value.has(section.key)) {
    const next = new Set(openSections.value)
    next.delete(section.key)
    openSections.value = next
  } else if (section.exclusive) {
    openSections.value = new Set([section.key])
  } else {
    openSections.value = new Set([...openSections.value, section.key])
  }
}

function closeSection(key: string) {
  const next = new Set(openSections.value)
  next.delete(key)
  openSections.value = next
}

function currentValue(key: string): string {
  switch (key) {
    case 'language':
      return languageOptions.find(o => o.value === language.value)?.label ?? 'random'
    case 'content':
      return contentOptions.find(o => o.value === category.value)?.label ?? category.value
    case 'size':
      return sizeOptions.find(o => o.value === lineCount.value)?.label ?? `${lineCount.value}`
    case 'mode':
      if (mode.value === 'until-finished') return 'finished'
      return timedDuration.value === 60 ? '1m' : `${timedDuration.value}s`
    default:
      return ''
  }
}

function isModeActive(isUntilFinished: boolean, dur?: number) {
  if (isUntilFinished) return mode.value === 'until-finished'
  return mode.value === 'timed' && timedDuration.value === dur
}

function isIndentActive(style: 'tabs' | 'spaces', spaces?: number) {
  if (style === 'tabs') return indentStyle.value === 'tabs'
  return indentStyle.value === 'spaces' && spacesPerTab.value === spaces
}

const containerRef = ref<HTMLElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    openSections.value = new Set()
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div
    ref="containerRef"
    class="fixed top-6 left-1/2 -translate-x-1/2 z-30"
  >
    <!-- Pill row -->
    <div
      class="flex items-center gap-0.5 rounded-full px-4 py-2 text-sm"
      style="background: rgba(34, 34, 34, 0.85); backdrop-filter: blur(8px); border: 1px solid #333"
    >
      <template
        v-for="(cat, i) in categories"
        :key="cat.key"
      >
        <span
          v-if="i > 0"
          class="px-1"
          style="color: #444"
        >|</span>
        <button
          class="flex items-center gap-1.5 px-2 py-0.5 transition-colors duration-200"
          :style="{ color: isOpen(cat.key) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
          @click="toggle(cat)"
        >
          <UIcon
            :name="cat.icon"
            class="w-3.5 h-3.5 shrink-0"
          />
          <span>{{ cat.label }}</span>
          <span
            v-if="cat.showCurrentValue"
            class="ml-0.5"
            style="color: var(--accent-primary)"
          >{{ currentValue(cat.key) }}</span>
        </button>
      </template>
    </div>

    <!-- Dropdown panel -->
    <Transition name="dropdown">
      <div
        v-if="hasOpenSections"
        class="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl px-5 py-3 min-w-max"
        style="background: rgba(34, 34, 34, 0.95); backdrop-filter: blur(8px); border: 1px solid #333"
      >
        <!-- Language section -->
        <Transition name="section">
          <div
            v-if="isOpen('language')"
            class="flex items-center gap-3 py-1"
          >
            <span
              class="text-xs w-16 shrink-0"
              style="color: var(--text-muted)"
            >language</span>
            <div class="flex items-center gap-1">
              <button
                v-for="opt in languageOptions"
                :key="opt.value"
                class="px-2 py-0.5 text-xs rounded transition-colors duration-150"
                :style="{ color: language === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
                @click="language = opt.value; closeSection('language')"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- Content section -->
        <Transition name="section">
          <div
            v-if="isOpen('content')"
            class="flex items-center gap-3 py-1"
          >
            <span
              class="text-xs w-16 shrink-0"
              style="color: var(--text-muted)"
            >content</span>
            <div class="flex items-center gap-1">
              <button
                v-for="opt in contentOptions"
                :key="opt.value"
                class="px-2 py-0.5 text-xs rounded transition-colors duration-150"
                :style="{ color: category === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
                @click="category = opt.value; closeSection('content')"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- Size section -->
        <Transition name="section">
          <div
            v-if="isOpen('size')"
            class="flex items-center gap-3 py-1"
          >
            <span
              class="text-xs w-16 shrink-0"
              style="color: var(--text-muted)"
            >size</span>
            <div class="flex items-center gap-1">
              <button
                v-for="opt in sizeOptions"
                :key="opt.value"
                class="px-2 py-0.5 text-xs rounded transition-colors duration-150"
                :style="{ color: lineCount === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
                @click="lineCount = opt.value; closeSection('size')"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- Mode section -->
        <Transition name="section">
          <div
            v-if="isOpen('mode')"
            class="flex items-center gap-3 py-1"
          >
            <span
              class="text-xs w-16 shrink-0"
              style="color: var(--text-muted)"
            >mode</span>
            <div class="flex items-center gap-1">
              <button
                class="px-2 py-0.5 text-xs rounded transition-colors duration-150"
                :style="{ color: isModeActive(true) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
                @click="mode = 'until-finished'; closeSection('mode')"
              >
                until finished
              </button>
              <button
                v-for="dur in timedDurations"
                :key="dur"
                class="px-2 py-0.5 text-xs rounded transition-colors duration-150"
                :style="{ color: isModeActive(false, dur) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
                @click="mode = 'timed'; timedDuration = dur; closeSection('mode')"
              >
                {{ dur === 60 ? '1m' : `${dur}s` }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- Settings sub-sections -->
        <Transition name="section">
          <div
            v-if="isOpen('settings')"
            class="flex flex-col"
          >
            <div class="flex items-center gap-3 py-1">
              <span
                class="text-xs w-16 shrink-0"
                style="color: var(--text-muted)"
              >cursor</span>
              <div class="flex items-center gap-1">
                <button
                  v-for="opt in cursorOptions"
                  :key="opt.value"
                  class="px-2 py-0.5 text-xs rounded transition-colors duration-150"
                  :style="{ color: cursorStyle === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
                  @click="cursorStyle = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-3 py-1">
              <span
                class="text-xs w-16 shrink-0"
                style="color: var(--text-muted)"
              >indent</span>
              <div class="flex items-center gap-1">
                <button
                  class="px-2 py-0.5 text-xs rounded transition-colors duration-150"
                  :style="{ color: isIndentActive('tabs') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
                  @click="indentStyle = 'tabs'"
                >
                  tab
                </button>
                <button
                  class="px-2 py-0.5 text-xs rounded transition-colors duration-150"
                  :style="{ color: isIndentActive('spaces', 2) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
                  @click="indentStyle = 'spaces'; spacesPerTab = 2"
                >
                  2 spaces
                </button>
                <button
                  class="px-2 py-0.5 text-xs rounded transition-colors duration-150"
                  :style="{ color: isIndentActive('spaces', 4) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
                  @click="indentStyle = 'spaces'; spacesPerTab = 4"
                >
                  4 spaces
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style>
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.dropdown-enter-active {
  transition: all 200ms ease-out;
}

.dropdown-leave-active {
  transition: all 150ms ease-in;
}

.section-enter-from,
.section-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.section-enter-active {
  transition: all 150ms ease-out;
}

.section-leave-active {
  transition: all 100ms ease-in;
}
</style>
