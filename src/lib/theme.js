import { ref, watch } from 'vue'

const STORAGE_KEY = 'bilimlog-theme'

function storedPreference() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'dark') return true
    if (value === 'light') return false
  } catch {
    /* ignore unavailable storage */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const isDark = ref(false)

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark)
}

export function toggleDark() {
  isDark.value = !isDark.value
}

export function initTheme() {
  isDark.value = document.documentElement.classList.contains('dark') || storedPreference()
  applyTheme(isDark.value)

  watch(isDark, (dark) => {
    applyTheme(dark)
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
    } catch {
      /* ignore unavailable storage */
    }
  })
}
