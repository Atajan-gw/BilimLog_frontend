<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Moon, Sun } from '@lucide/vue'
import { api } from '@/lib/api'
import { auth, logout, setUser } from '@/lib/auth'
import { isDark, toggleDark } from '@/lib/theme'

const router = useRouter()
const imageFailed = ref(false)
const menuOpen = ref(false)
const menuRoot = ref(null)
const saving = ref(false)
const notice = ref('')
const error = ref('')
const fieldErrors = ref({})

const form = reactive({
  name: '',
  surname: '',
  username: '',
  phone_number: '',
  password: '',
  password_confirmation: '',
})

const roleLabel = computed(() => {
  if (auth.user?.role === 'teacher') return 'Teacher'
  if (auth.user?.role === 'student') return 'Student'
  if (auth.user?.role === 'admin') return 'Admin'
  return auth.user?.role || ''
})

const canEdit = computed(() => auth.user?.role === 'teacher' || auth.user?.role === 'student')

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

function fillForm() {
  form.name = auth.user?.name || ''
  form.surname = auth.user?.surname || ''
  form.username = auth.user?.username || ''
  form.phone_number = auth.user?.phone_number || ''
  form.password = ''
  form.password_confirmation = ''
  notice.value = ''
  error.value = ''
  fieldErrors.value = {}
}

function toggleMenu() {
  if (!canEdit.value) return
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) fillForm()
}

function onDocumentClick(event) {
  if (!menuOpen.value) return
  if (menuRoot.value && !menuRoot.value.contains(event.target)) menuOpen.value = false
}

function onDocumentKey(event) {
  if (event.key === 'Escape') menuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKey)
})

async function saveAccount() {
  saving.value = true
  notice.value = ''
  error.value = ''
  fieldErrors.value = {}
  try {
    const body = {
      name: form.name,
      surname: form.surname,
      username: form.username,
      phone_number: form.phone_number,
    }
    if (form.password) {
      body.password = form.password
      body.password_confirmation = form.password_confirmation
    }
    const data = await api('/profile', { method: 'PUT', token: auth.token, body })
    setUser(data.user)
    form.password = ''
    form.password_confirmation = ''
    notice.value = 'Account updated.'
  } catch (err) {
    fieldErrors.value = err.errors || {}
    const first = err.errors ? Object.values(err.errors)[0]?.[0] : null
    error.value = first || err.message || 'Account not updated.'
  } finally {
    saving.value = false
  }
}

async function onLogout() {
  menuOpen.value = false
  await logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="flex items-center justify-between gap-4 border-b border-sand bg-surface/80 px-5 py-4 backdrop-blur sm:px-8">
    <div ref="menuRoot" class="relative flex min-w-0 items-center gap-3">
      <button
        type="button"
        class="shrink-0 rounded-full outline-none ring-pine/30 focus-visible:ring-4"
        :aria-expanded="menuOpen"
        :aria-haspopup="canEdit ? 'dialog' : undefined"
        :aria-label="canEdit ? 'Edit account' : displayName"
        @click.stop="toggleMenu"
      >
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="displayName"
          class="size-11 rounded-full object-cover ring-2 ring-sand"
          @error="imageFailed = true"
        >
        <span
          v-else
          class="inline-flex size-11 items-center justify-center rounded-full bg-pine text-sm font-bold text-white"
        >
          {{ initials }}
        </span>
      </button>
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-pine">BilimLog</p>
        <h1 class="truncate text-lg font-extrabold">{{ displayName }}</h1>
      </div>

      <form
        v-if="menuOpen"
        class="absolute top-full left-0 z-30 mt-3 w-80 rounded-3xl border border-sand bg-surface p-4 shadow-lg"
        @submit.prevent="saveAccount"
        @click.stop
      >
        <p class="text-sm font-extrabold">Edit account</p>
        <p class="mt-1 text-xs text-ink/60">Name, username, phone, and password.</p>

        <label class="mt-3 block text-sm">
          <span class="mb-1 block font-semibold">Name</span>
          <input v-model="form.name" required class="w-full rounded-2xl border border-sand bg-paper px-3 py-2 outline-none ring-pine/30 focus:ring-4">
        </label>
        <label class="mt-3 block text-sm">
          <span class="mb-1 block font-semibold">Surname</span>
          <input v-model="form.surname" required class="w-full rounded-2xl border border-sand bg-paper px-3 py-2 outline-none ring-pine/30 focus:ring-4">
        </label>
        <label class="mt-3 block text-sm">
          <span class="mb-1 block font-semibold">Username</span>
          <input v-model="form.username" required autocomplete="username" class="w-full rounded-2xl border border-sand bg-paper px-3 py-2 outline-none ring-pine/30 focus:ring-4">
        </label>
        <label class="mt-3 block text-sm">
          <span class="mb-1 block font-semibold">Phone number</span>
          <input v-model="form.phone_number" required type="tel" autocomplete="tel" class="w-full rounded-2xl border border-sand bg-paper px-3 py-2 outline-none ring-pine/30 focus:ring-4">
        </label>
        <label class="mt-3 block text-sm">
          <span class="mb-1 block font-semibold">New password</span>
          <input v-model="form.password" type="password" autocomplete="new-password" placeholder="Leave empty to keep" class="w-full rounded-2xl border border-sand bg-paper px-3 py-2 outline-none ring-pine/30 focus:ring-4">
        </label>
        <label class="mt-3 block text-sm">
          <span class="mb-1 block font-semibold">Confirm password</span>
          <input v-model="form.password_confirmation" type="password" autocomplete="new-password" class="w-full rounded-2xl border border-sand bg-paper px-3 py-2 outline-none ring-pine/30 focus:ring-4">
        </label>

        <p v-if="error" class="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">{{ error }}</p>
        <p v-if="notice" class="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">{{ notice }}</p>

        <button
          type="submit"
          :disabled="saving"
          class="mt-4 w-full rounded-2xl bg-pine px-4 py-2.5 text-sm font-bold text-white hover:bg-pine-dark disabled:opacity-60"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </form>
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
