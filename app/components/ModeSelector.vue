<script setup lang="ts">
import {
  languageOptions,
  categoryOptions,
  subcategoryMap,
  difficultyOptions,
  lineSizeOptions,
  timedDurationOptions
} from '~/config/selectors'

const language = defineModel<string[]>('language', { default: () => [] })
const category = defineModel<string[]>('category', { default: () => [] })
const lineCount = defineModel<number>('lineCount', { default: 10 })
const mode = defineModel<'until-finished' | 'timed'>('mode', { default: 'until-finished' })
const timedDuration = defineModel<10 | 30 | 60>('timedDuration', { default: 30 })
const subcategory = defineModel<string>('subcategory', { default: '' })
const difficulty = defineModel<string>('difficulty', { default: '' })

type SectionKey = 'language' | 'category' | 'subcategory' | 'difficulty' | 'size' | 'mode'

const openSection = ref<SectionKey | null>(null)

function toggle(key: SectionKey) {
  openSection.value = openSection.value === key ? null : key
}

function isOpen(key: SectionKey) {
  return openSection.value === key
}

function selectLanguage(value: string) {
  if (value === '') {
    language.value = []
  } else if (language.value.includes(value)) {
    language.value = language.value.filter(v => v !== value)
  } else {
    language.value = [...language.value, value]
  }
}

function selectCategory(value: string) {
  if (value === '') {
    category.value = []
  } else if (category.value.includes(value)) {
    category.value = category.value.filter(v => v !== value)
  } else {
    category.value = [...category.value, value]
  }
}

function isMultiSelected(arr: string[], value: string) {
  if (value === '') return arr.length === 0
  return arr.includes(value)
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

const languageLabel = computed(() => {
  if (language.value.length === 0) return 'all'
  if (language.value.length === 1) {
    return languageOptions.find(o => o.value === language.value[0])?.label ?? language.value[0]
  }
  return `${language.value.length} langs`
})

const categoryLabel = computed(() => {
  if (category.value.length === 0) return 'all'
  if (category.value.length === 1) {
    return categoryOptions.find(o => o.value === category.value[0])?.label ?? category.value[0]
  }
  return `${category.value.length} cats`
})

const subcategoryOptions = computed(() => {
  if (category.value.length === 1 && subcategoryMap[category.value[0]!]) {
    return subcategoryMap[category.value[0]!]
  }
  return null
})

// Reset subcategory when categories change
watch(category, () => {
  subcategory.value = ''
})

function closeAll() {
  openSection.value = null
}

onMounted(() => document.addEventListener('click', closeAll))
onUnmounted(() => document.removeEventListener('click', closeAll))
</script>

<template>
  <div
    class="flex flex-col items-center w-full pt-4 pb-2 z-30 relative"
    @click.stop
  >
    <BasePill class="text-[13px]">
      <!-- Language -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2 min-w-[2.25rem]"
        :style="{ color: isOpen('language') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('language')"
      >
        <UIcon
          name="i-lucide-code-2"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span v-if="!isOpen('language')">{{ languageLabel }}</span>
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
            :style="{ color: isMultiSelected(language, opt.value) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
            @click="selectLanguage(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <span class="pill-sep">|</span>

      <!-- Category -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2 min-w-[2.25rem]"
        :style="{ color: isOpen('category') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('category')"
      >
        <UIcon
          name="i-lucide-layers"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span v-if="!isOpen('category')">{{ categoryLabel }}</span>
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
            :style="{ color: isMultiSelected(category, opt.value) ? 'var(--accent-primary)' : 'var(--text-muted)' }"
            @click="selectCategory(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Subcategory (dynamic, only when single category selected) -->
      <template v-if="subcategoryOptions">
        <span class="pill-sep">|</span>
        <button
          class="pill-btn flex items-center gap-1.5 px-3 py-2 min-w-[2.25rem]"
          :style="{ color: isOpen('subcategory') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
          @click="toggle('subcategory')"
        >
          <UIcon
            name="i-lucide-git-branch"
            class="w-3.5 h-3.5 shrink-0"
          />
          <span v-if="!isOpen('subcategory')">{{ subcategoryOptions.find(o => o.value === subcategory)?.label ?? 'all' }}</span>
        </button>

        <div
          class="pill-expand"
          :class="{ 'pill-expand--open': isOpen('subcategory') }"
        >
          <div class="pill-expand-inner flex items-center">
            <span class="pill-sep">|</span>
            <button
              v-for="opt in subcategoryOptions"
              :key="opt.value"
              class="pill-option"
              :style="{ color: subcategory === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
              @click="subcategory = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </template>

      <span class="pill-sep">|</span>

      <!-- Difficulty -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2 min-w-[2.25rem]"
        :style="{ color: isOpen('difficulty') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('difficulty')"
      >
        <UIcon
          name="i-lucide-signal"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span v-if="!isOpen('difficulty')">{{ difficultyOptions.find(o => o.value === difficulty)?.label ?? 'all' }}</span>
      </button>

      <div
        class="pill-expand"
        :class="{ 'pill-expand--open': isOpen('difficulty') }"
      >
        <div class="pill-expand-inner flex items-center">
          <span class="pill-sep">|</span>
          <button
            v-for="opt in difficultyOptions"
            :key="opt.value"
            class="pill-option"
            :style="{ color: difficulty === opt.value ? 'var(--accent-primary)' : 'var(--text-muted)' }"
            @click="difficulty = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <span class="pill-sep">|</span>

      <!-- Size -->
      <button
        class="pill-btn flex items-center gap-1.5 px-3 py-2 min-w-[2.25rem]"
        :style="{ color: isOpen('size') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('size')"
      >
        <UIcon
          name="i-lucide-ruler"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span v-if="!isOpen('size')">{{ lineCount }}</span>
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
        class="pill-btn flex items-center gap-1.5 px-3 py-2 min-w-[2.25rem]"
        :style="{ color: isOpen('mode') ? 'var(--accent-primary)' : 'var(--text-muted)' }"
        @click="toggle('mode')"
      >
        <UIcon
          name="i-lucide-timer"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span v-if="!isOpen('mode')">{{ modeLabel }}</span>
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

      <!-- Settings -->
      <SettingsDropdown />
    </BasePill>
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
  pointer-events: none;
}
.pill-expand--open {
  grid-template-columns: 1fr;
  pointer-events: auto;
}
.pill-expand-inner {
  overflow: hidden;
  min-width: 0;
}
</style>
