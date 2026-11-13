<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Moon, Sun } from '@lucide/vue'
import { auth, logout } from '@/lib/auth'
import { isDark, toggleDark } from '@/lib/theme'

const router = useRouter()
const imageFailed = ref(false)

const roleLabel = computed(() => {
  if (auth.user?.role === 'teacher') return 'Teacher'
  if (auth.user?.role === 'student') return 'Student'
  if (auth.user?.role === 'admin') return 'Admin'
  return auth.user?.role || ''
})

const displayName = computed(() => [auth.user?.name, auth.user?.surname].filter(Boolean).join(' '))

const initials = computed(() => {
  const letters = [auth.user?.name, auth.user?.surname]
    .map((part) => (part || '').trim().charAt(0))
    .join('')
    .toUpperCase()
  return letters || '?'
})

const avatarUrl = computed(() => {
  if (imageFailed.value) return ''
  const url = auth.user?.avatar_url
  if (typeof url === 'string' && url) return url

  const path = auth.user?.avatar
  if (typeof path !== 'string' || !path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const origin = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '')
  return `${origin}/storage/${path.replace(/^\/+/, '')}`
})

watch(
  () => [auth.user?.id, auth.user?.avatar, auth.user?.avatar_url],
  () => {
    imageFailed.value = false
  },
)

async function onLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="flex items-center justify-between gap-4 border-b border-sand bg-surface/80 px-5 py-4 backdrop-blur sm:px-8">
    <div class="flex min-w-0 items-center gap-3">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="displayName"
        class="size-11 shrink-0 rounded-full object-cover ring-2 ring-sand"
        @error="imageFailed = true"
      >
      <span
        v-else
        class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-pine text-sm font-bold text-white"
        aria-hidden="true"
      >
        {{ initials }}
      </span>
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-pine">BilimLog</p>
        <h1 class="truncate text-lg font-extrabold">{{ displayName }}</h1>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        :aria-checked="isDark"
        :aria-label="isDark ? 'Light mode' : 'Dark mode'"
        class="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-sand bg-paper"
        @click="toggleDark"
      >
        <span
          class="absolute top-1 left-1 flex size-7 items-center justify-center rounded-full bg-pine text-white shadow-sm transition-transform dark:bg-white dark:text-ink"
          :class="isDark ? 'translate-x-7' : 'translate-x-0'"
        >
          <Sun v-if="!isDark" class="size-3.5" />
          <Moon v-else class="size-3.5" />
        </span>
      </button>
      <span class="rounded-full bg-pine/10 px-3 py-1 text-sm font-semibold text-pine">{{ roleLabel }}</span>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-sand px-3 py-2 text-sm font-semibold hover:bg-paper"
        @click="onLogout"
      >
        <LogOut class="size-4" />
        Logout
      </button>
    </div>
  </header>
</template>
