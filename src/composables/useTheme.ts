import { computed, ref } from 'vue'

type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'learnstream:theme'

function readInitialTheme(): Theme {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  }

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

const theme = ref<Theme>(readInitialTheme())

function apply(value: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', value === 'dark')
  document.documentElement.style.colorScheme = value
}

/** Applies the current theme to <html> once, at app start. */
export function initTheme() {
  apply(theme.value)
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(value: Theme) {
    theme.value = value
    apply(value)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, value)
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, isDark, setTheme, toggleTheme }
}
