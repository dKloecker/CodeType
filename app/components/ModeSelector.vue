<script setup lang="ts">
import {
  languageOptions,
  categoryOptions,
  lineSizeOptions,
  timedDurationOptions
} from '~/config/selectors'

const language = defineModel<string>('language', { default: '' })
const category = defineModel<string>('category', { default: 'algorithm' })
const lineCount = defineModel<number>('lineCount', { default: 10 })
const mode = defineModel<'until-finished' | 'timed'>('mode', { default: 'until-finished' })
const timedDuration = defineModel<10 | 30 | 60>('timedDuration', { default: 30 })

type SectionKey = 'language' | 'category' | 'size' | 'mode'

const openSection = ref<SectionKey | null>(null)

function toggle(key: SectionKey) {
  openSection.value = openSection.value === key ? null : key
}

function isOpen(key: SectionKey) {
  return openSection.value === key
}

function setMode(m: 'until-finished' | 'timed', dur?: 10 | 30 | 60) {
  mode.value = m
  if (dur) timedDuration.value = dur
}

const modeLabel = computed(() => {
  if (mode.value === 'until-finished') return 'finished'
  const opt = timedDurationOptions.find(o => o.value === timedDuration.value)
  return opt?.label ?? `${timedDuration.value}s`
})

const selectedLanguageLabel = computed(() =>
  languageOptions.find(o => o.value === language.value)?.label ?? 'random'
)

const containerRef = ref<HTMLElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    openSection.value = null
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-col items-center w-full pt-4 pb-2 z-30 relative"
  >
    <div
      class="mode-pill inline-flex items-center rounded-[10px] text-[13px] overflow-hidden"
      style="background: var(--bg-surface); border: 1px solid rgba(255,255,255,0.06)"
    >
      <!-- Language -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2"
        :style="{ color: isOpen('language') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('language')"
      >
        <UIcon
          name="i-lucide-code-2"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span>{{ selectedLanguageLabel }}</span>
      </button>

      <div
        class="pill-expand"
        :class="{ 'pill-expand--open': isOpen('language') }"
      >
        <div class="pill-expand-inner flex items-center">
          <span class="pill-sep">|</span>
          <button
            v-for="opt in languageOptions"
            :key="opt.value"
            class="pill-option"
            :style="{ color: language === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
            @click="language = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <span class="pill-sep">|</span>

      <!-- Category -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2"
        :style="{ color: isOpen('category') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('category')"
      >
        <UIcon
          name="i-lucide-layers"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span>{{ categoryOptions.find(o => o.value === category)?.label ?? category }}</span>
      </button>

      <div
        class="pill-expand"
        :class="{ 'pill-expand--open': isOpen('category') }"
      >
        <div class="pill-expand-inner flex items-center">
          <span class="pill-sep">|</span>
          <button
            v-for="opt in categoryOptions"
            :key="opt.value"
            class="pill-option"
            :style="{ color: category === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
            @click="category = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <span class="pill-sep">|</span>

      <!-- Size -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2"
        :style="{ color: isOpen('size') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('size')"
      >
        <UIcon
          name="i-lucide-ruler"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span>{{ lineCount }}</span>
      </button>

      <div
        class="pill-expand"
        :class="{ 'pill-expand--open': isOpen('size') }"
      >
        <div class="pill-expand-inner flex items-center">
          <span class="pill-sep">|</span>
          <button
            v-for="opt in lineSizeOptions"
            :key="opt.value"
            class="pill-option"
            :style="{ color: lineCount === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
            @click="lineCount = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <span class="pill-sep">|</span>

      <!-- Mode -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2"
        :style="{ color: isOpen('mode') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('mode')"
      >
        <UIcon
          name="i-lucide-timer"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span>{{ modeLabel }}</span>
      </button>

      <div
        class="pill-expand"
        :class="{ 'pill-expand--open': isOpen('mode') }"
      >
        <div class="pill-expand-inner flex items-center">
          <span class="pill-sep">|</span>
          <button
            class="pill-option"
            :style="{ color: mode === 'until-finished' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
            @click="setMode('until-finished')"
          >
            finished
          </button>
          <button
            v-for="opt in timedDurationOptions"
            :key="opt.value"
            class="pill-option"
            :style="{ color: (mode === 'timed' && timedDuration === opt.value) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
            @click="setMode('timed', opt.value as 10 | 30 | 60)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <span class="pill-sep">|</span>

      <!-- Settings (via UDropdownMenu — ClientOnly to avoid SSR Popper crash) -->
      <ClientOnly>
        <SettingsDropdown />
      </ClientOnly>
    </div>
  </div>
</template>

<style>
.pill-btn {
  transition: color 150ms ease;
  white-space: nowrap;
}
.pill-btn:hover {
  filter: brightness(1.2);
}

.pill-sep {
  color: rgba(255, 255, 255, 0.08);
  font-size: 14px;
  user-select: none;
  flex-shrink: 0;
}

.pill-option {
  padding: 4px 8px;
  border-radius: 6px;
  transition: color 150ms ease;
  white-space: nowrap;
}
.pill-option:hover {
  filter: brightness(1.2);
}

.pill-expand {
  display: grid;
  grid-template-columns: 0fr;
  transition: grid-template-columns 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pill-expand--open {
  grid-template-columns: 1fr;
}
.pill-expand-inner {
  overflow: hidden;
  min-width: 0;
}
</style>
