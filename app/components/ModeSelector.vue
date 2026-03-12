<script setup lang="ts">
import type { CursorStyle } from '~/composables/useCursorConfig'
import type { ThemeId, FontId } from '~/composables/useTheme'
import { themeOptions, fontOptions } from '~/composables/useTheme'

const language = defineModel<string>('language', { default: '' })
const category = defineModel<string>('category', { default: 'algorithm' })
const lineCount = defineModel<number>('lineCount', { default: 10 })
const mode = defineModel<'until-finished' | 'timed'>('mode', { default: 'until-finished' })
const timedDuration = defineModel<10 | 30 | 60>('timedDuration', { default: 30 })
const indentStyle = defineModel<'tabs' | 'spaces'>('indentStyle', { default: 'spaces' })
const spacesPerTab = defineModel<2 | 4>('spacesPerTab', { default: 4 })
const cursorStyle = defineModel<CursorStyle>('cursorStyle', { default: 'line' })

const { theme, font, applyTheme, applyFont } = useTheme()

const languageOptions = [
  { value: '', label: 'random' },
  { value: 'python', label: 'python' },
  { value: 'typescript', label: 'typescript' },
  { value: 'cpp', label: 'c++' }
]

const contentOptions = [
  { value: 'algorithm', label: 'algorithms' },
  { value: 'leetcode', label: 'leetcode' },
  { value: 'oss', label: 'open source' }
]

const sizeOptions = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' }
]

const cursorOptions: { value: CursorStyle, label: string }[] = [
  { value: 'block', label: 'block' },
  { value: 'line', label: 'line' },
  { value: 'underlined', label: 'under' }
]

const timedDurations = [10, 30, 60] as const

type SectionKey = 'language' | 'content' | 'size' | 'mode' | 'settings'

const activeSection = ref<SectionKey | null>(null)

function toggle(key: SectionKey) {
  activeSection.value = activeSection.value === key ? null : key
}

function isActive(key: SectionKey) {
  return activeSection.value === key
}

function setMode(m: 'until-finished' | 'timed', dur?: 10 | 30 | 60) {
  mode.value = m
  if (dur) timedDuration.value = dur
}

function setTheme(t: ThemeId) {
  applyTheme(t)
}

function setFont(f: FontId) {
  applyFont(f)
}

const containerRef = ref<HTMLElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    activeSection.value = null
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
    <!-- The pill bar -->
    <div
      class="mode-pill inline-flex items-center rounded-[10px] text-[13px] overflow-hidden"
      style="background: var(--bg-surface); border: 1px solid rgba(255,255,255,0.06)"
    >
      <!-- ═══ Language ═══ -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2"
        :style="{ color: isActive('language') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('language')"
      >
        <UIcon
          name="i-lucide-code-2"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span>{{ languageOptions.find(o => o.value === language)?.label ?? 'random' }}</span>
      </button>

      <!-- Language expanded inline -->
      <div
        class="pill-expand"
        :class="{ 'pill-expand--open': isActive('language') }"
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

      <!-- ═══ Content ═══ -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2"
        :style="{ color: isActive('content') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('content')"
      >
        <UIcon
          name="i-lucide-layers"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span>{{ contentOptions.find(o => o.value === category)?.label ?? category }}</span>
      </button>

      <!-- Content expanded inline -->
      <div
        class="pill-expand"
        :class="{ 'pill-expand--open': isActive('content') }"
      >
        <div class="pill-expand-inner flex items-center">
          <span class="pill-sep">|</span>
          <button
            v-for="opt in contentOptions"
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

      <!-- ═══ Size ═══ -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2"
        :style="{ color: isActive('size') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('size')"
      >
        <UIcon
          name="i-lucide-ruler"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span>{{ lineCount }}</span>
      </button>

      <!-- Size expanded inline -->
      <div
        class="pill-expand"
        :class="{ 'pill-expand--open': isActive('size') }"
      >
        <div class="pill-expand-inner flex items-center">
          <span class="pill-sep">|</span>
          <button
            v-for="opt in sizeOptions"
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

      <!-- ═══ Mode ═══ -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2"
        :style="{ color: isActive('mode') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('mode')"
      >
        <UIcon
          name="i-lucide-timer"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span>{{ mode === 'until-finished' ? 'finished' : (timedDuration === 60 ? '1m' : `${timedDuration}s`) }}</span>
      </button>

      <!-- Mode expanded inline -->
      <div
        class="pill-expand"
        :class="{ 'pill-expand--open': isActive('mode') }"
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
            v-for="dur in timedDurations"
            :key="dur"
            class="pill-option"
            :style="{ color: (mode === 'timed' && timedDuration === dur) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
            @click="setMode('timed', dur)"
          >
            {{ dur === 60 ? '1m' : `${dur}s` }}
          </button>
        </div>
      </div>

      <span class="pill-sep">|</span>

      <!-- ═══ Settings gear ═══ -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2"
        :style="{ color: isActive('settings') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('settings')"
      >
        <UIcon
          name="i-lucide-settings"
          class="w-3.5 h-3.5 shrink-0"
        />
      </button>
    </div>

    <!-- Settings dropdown panel (only this one stays as a panel below) -->
    <Transition name="panel">
      <div
        v-if="activeSection === 'settings'"
        class="mt-2 inline-flex flex-col gap-2 rounded-[10px] px-3 py-3 text-[13px]"
        style="background: var(--bg-surface); border: 1px solid rgba(255,255,255,0.06)"
      >
        <!-- Cursor row -->
        <div class="flex items-center gap-3">
          <span
            class="text-[11px] w-12 shrink-0"
            style="color: var(--text-muted)"
          >cursor</span>
          <div class="flex items-center gap-0.5">
            <button
              v-for="opt in cursorOptions"
              :key="opt.value"
              class="px-2.5 py-1 rounded-md transition-colors duration-150"
              :style="{ color: cursorStyle === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
              @click="cursorStyle = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <!-- Indent row -->
        <div class="flex items-center gap-3">
          <span
            class="text-[11px] w-12 shrink-0"
            style="color: var(--text-muted)"
          >indent</span>
          <div class="flex items-center gap-0.5">
            <button
              class="px-2.5 py-1 rounded-md transition-colors duration-150"
              :style="{ color: indentStyle === 'tabs' ? 'var(--accent-primary)' : 'var(--text-muted)' }"
              @click="indentStyle = 'tabs'"
            >
              tab
            </button>
            <button
              class="px-2.5 py-1 rounded-md transition-colors duration-150"
              :style="{ color: (indentStyle === 'spaces' && spacesPerTab === 2) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
              @click="indentStyle = 'spaces'; spacesPerTab = 2"
            >
              2sp
            </button>
            <button
              class="px-2.5 py-1 rounded-md transition-colors duration-150"
              :style="{ color: (indentStyle === 'spaces' && spacesPerTab === 4) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
              @click="indentStyle = 'spaces'; spacesPerTab = 4"
            >
              4sp
            </button>
          </div>
        </div>
        <!-- Font row -->
        <div class="flex items-center gap-3">
          <span
            class="text-[11px] w-12 shrink-0"
            style="color: var(--text-muted)"
          >font</span>
          <div class="flex items-center gap-0.5 flex-wrap">
            <button
              v-for="opt in fontOptions"
              :key="opt.value"
              class="px-2.5 py-1 rounded-md transition-colors duration-150"
              :style="{ color: font === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
              @click="setFont(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <!-- Theme row -->
        <div class="flex items-center gap-3">
          <span
            class="text-[11px] w-12 shrink-0"
            style="color: var(--text-muted)"
          >theme</span>
          <div class="flex items-center gap-0.5 flex-wrap">
            <button
              v-for="opt in themeOptions"
              :key="opt.value"
              class="px-2.5 py-1 rounded-md transition-colors duration-150"
              :style="{ color: theme === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
              @click="setTheme(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
/* ── Pill buttons ── */
.pill-btn {
  transition: color 150ms ease;
  white-space: nowrap;
}

.pill-btn:hover {
  filter: brightness(1.2);
}

/* ── Separators ── */
.pill-sep {
  color: rgba(255, 255, 255, 0.08);
  font-size: 14px;
  user-select: none;
  flex-shrink: 0;
}

/* ── Inline option buttons ── */
.pill-option {
  padding: 4px 8px;
  border-radius: 6px;
  transition: color 150ms ease;
  white-space: nowrap;
}

.pill-option:hover {
  filter: brightness(1.2);
}

/* ── Expandable section (the magic) ── */
.pill-expand {
  display: grid;
  /* animate from 0fr → 1fr for a smooth width expand */
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

/* ── Settings panel transition ── */
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

.panel-enter-active {
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.panel-leave-active {
  transition: all 150ms ease-in;
}
</style>
