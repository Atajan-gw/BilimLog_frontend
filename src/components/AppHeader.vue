<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut } from '@lucide/vue'
import { auth, logout } from '@/lib/auth'

const router = useRouter()

const roleLabel = computed(() => {
  if (auth.user?.role === 'teacher') return 'Mugallym'
  if (auth.user?.role === 'student') return 'Talyp'
  if (auth.user?.role === 'admin') return 'Admin'
  return auth.user?.role || ''
})

async function onLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="flex items-center justify-between gap-4 border-b border-sand bg-white/80 px-5 py-4 backdrop-blur sm:px-8">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Bilimlog</p>
      <h1 class="text-lg font-extrabold">{{ auth.user?.name }} {{ auth.user?.surname }}</h1>
    </div>
    <div class="flex items-center gap-3">
      <span class="rounded-full bg-pine/10 px-3 py-1 text-sm font-semibold text-pine">{{ roleLabel }}</span>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-sand px-3 py-2 text-sm font-semibold hover:bg-paper"
        @click="onLogout"
      >
        <LogOut class="size-4" />
        Çykmak
      </button>
    </div>
  </header>
</template>
