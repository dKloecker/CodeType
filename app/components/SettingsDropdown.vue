<script setup lang="ts">
import { cursorOptions, indentOptions, fontOptions, themeOptions } from '~/config/settings'
import type { CursorStyle, IndentValue, FontId, ThemeId } from '~/composables/useSettings'

const { cursorStyle, indentValue, setIndent, theme, font, applyTheme, applyFont, applyCursor } = useSettings()

type SettingKey = 'cursor' | 'indent' | 'font' | 'theme'

const panelOpen = ref(false)
const openSetting = ref<SettingKey | null>(null)
const containerRef = ref<HTMLElement | null>(null)

function togglePanel() {
  panelOpen.value = !panelOpen.value
  if (!panelOpen.value) openSetting.value = null
}

function toggleSetting(key: SettingKey) {
  openSetting.value = openSetting.value === key ? null : key
}

function isSettingOpen(key: SettingKey) {
  return openSetting.value === key
}

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    panelOpen.value = false
    openSetting.value = null
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

const fontLabel = computed(() => fontOptions.find(o => o.value === font.value)?.label ?? font.value)
</script>

<template>
  <div
    ref="containerRef"
    class="relative"
  >
    <button
      class="pill-btn flex items-center px-3 py-2"
      :style="{ color: panelOpen ? 'var(--ui-primary)' : 'var(--ui-text-muted)' }"
      aria-label="Settings"
      @click.stop="togglePanel"
    >
      <UIcon
        name="i-lucide-settings-2"
        class="w-3.5 h-3.5"
      />
    </button>

    <Transition name="settings-panel">
      <div
        v-if="panelOpen"
        class="absolute right-0 top-full mt-2 flex flex-col gap-0.5 text-[13px] rounded-[10px] py-1"
        style="background: var(--ui-bg-elevated); border: 1px solid rgba(255,255,255,0.06); min-width: max-content"
      >
        <!-- Cursor -->
        <div class="flex items-center">
          <button
            class="pill-btn flex items-center gap-1.5 px-3 py-2"
            :style="{ color: isSettingOpen('cursor') ? 'var(--ui-primary)' : 'var(--ui-text-muted)' }"
            @click="toggleSetting('cursor')"
          >
            <UIcon
              name="i-lucide-text-cursor"
              class="w-3.5 h-3.5 shrink-0"
            />
            <span v-if="!isSettingOpen('cursor')">{{ cursorStyle }}</span>
          </button>
          <div
            class="pill-expand"
            :class="{ 'pill-expand--open': isSettingOpen('cursor') }"
          >
            <div class="pill-expand-inner flex items-center">
              <span class="pill-sep">|</span>
              <button
                v-for="opt in cursorOptions"
                :key="opt.value"
                class="pill-option"
                :style="{ color: cursorStyle === opt.value ? 'var(--ui-primary)' : 'var(--ui-text-muted)' }"
                @click="applyCursor(opt.value as CursorStyle)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Indent -->
        <div class="flex items-center">
          <button
            class="pill-btn flex items-center gap-1.5 px-3 py-2"
            :style="{ color: isSettingOpen('indent') ? 'var(--ui-primary)' : 'var(--ui-text-muted)' }"
            @click="toggleSetting('indent')"
          >
            <UIcon
              name="i-lucide-indent"
              class="w-3.5 h-3.5 shrink-0"
            />
            <span v-if="!isSettingOpen('indent')">{{ indentValue }}</span>
          </button>
          <div
            class="pill-expand"
            :class="{ 'pill-expand--open': isSettingOpen('indent') }"
          >
            <div class="pill-expand-inner flex items-center">
              <span class="pill-sep">|</span>
              <button
                v-for="opt in indentOptions"
                :key="opt.value"
                class="pill-option"
                :style="{ color: indentValue === opt.value ? 'var(--ui-primary)' : 'var(--ui-text-muted)' }"
                @click="setIndent(opt.value as IndentValue)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Font -->
        <div class="flex items-center">
          <button
            class="pill-btn flex items-center gap-1.5 px-3 py-2"
            :style="{ color: isSettingOpen('font') ? 'var(--ui-primary)' : 'var(--ui-text-muted)' }"
            @click="toggleSetting('font')"
          >
            <UIcon
              name="i-lucide-type"
              class="w-3.5 h-3.5 shrink-0"
            />
            <span v-if="!isSettingOpen('font')">{{ fontLabel }}</span>
          </button>
          <div
            class="pill-expand"
            :class="{ 'pill-expand--open': isSettingOpen('font') }"
          >
            <div class="pill-expand-inner flex items-center">
              <span class="pill-sep">|</span>
              <button
                v-for="opt in fontOptions"
                :key="opt.value"
                class="pill-option"
                :style="{ color: font === opt.value ? 'var(--ui-primary)' : 'var(--ui-text-muted)' }"
                @click="applyFont(opt.value as FontId)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Theme -->
        <div class="flex items-center">
          <button
            class="pill-btn flex items-center gap-1.5 px-3 py-2"
            :style="{ color: isSettingOpen('theme') ? 'var(--ui-primary)' : 'var(--ui-text-muted)' }"
            @click="toggleSetting('theme')"
          >
            <UIcon
              name="i-lucide-palette"
              class="w-3.5 h-3.5 shrink-0"
            />
            <span v-if="!isSettingOpen('theme')">{{ theme }}</span>
          </button>
          <div
            class="pill-expand"
            :class="{ 'pill-expand--open': isSettingOpen('theme') }"
          >
            <div class="pill-expand-inner flex items-center">
              <span class="pill-sep">|</span>
              <button
                v-for="opt in themeOptions"
                :key="opt.value"
                class="pill-option"
                :style="{ color: theme === opt.value ? 'var(--ui-primary)' : 'var(--ui-text-muted)' }"
                @click="applyTheme(opt.value as ThemeId)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
.settings-panel-enter-active,
.settings-panel-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.settings-panel-enter-from,
.settings-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
