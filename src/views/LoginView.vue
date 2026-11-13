<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { GraduationCap } from '@lucide/vue'
import { homeFor, login } from '@/lib/auth'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const fieldErrors = ref({})

const form = reactive({
  name: '',
  surname: '',
  username: '',
  phone_number: '',
  password: '',
})

const fields = [
  { key: 'name', label: 'Name', type: 'text', autocomplete: 'given-name' },
  { key: 'surname', label: 'Surname', type: 'text', autocomplete: 'family-name' },
  { key: 'username', label: 'Username', type: 'text', autocomplete: 'username' },
  { key: 'phone_number', label: 'Phone Number', type: 'tel', autocomplete: 'tel' },
  { key: 'password', label: 'Password', type: 'password', autocomplete: 'current-password' },
]

async function onSubmit() {
  error.value = ''
  fieldErrors.value = {}
  loading.value = true
  try {
    const user = await login({ ...form })
    router.push(homeFor(user))
  } catch (err) {
    fieldErrors.value = err.errors || {}
    error.value = err.errors
      ? 'All fields are required.'
      : 'Login failed. Please check your data.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
    <section class="relative hidden overflow-hidden bg-pine px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="absolute -right-24 -top-24 size-80 rounded-full bg-white/10"></div>
      <div class="absolute -bottom-28 -left-16 size-96 rounded-full bg-black/10"></div>
      <div class="relative flex items-center gap-3 text-lg font-extrabold">
        <GraduationCap class="size-8" />
        BilimLog
      </div>
      <div class="relative max-w-md">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Learning Journal</p>
        <h2 class="mt-3 text-5xl font-extrabold leading-tight">Teacher and Student in one place.</h2>
        <p class="mt-4 text-lg text-white/80">
          After login, you can access your dashboard: teachers can view their courses and grades, students can view their course grades.
        </p>
      </div>
    </section>

    <section class="flex items-center justify-center px-5 py-12">
      <form class="w-full max-w-md" @submit.prevent="onSubmit">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <GraduationCap class="size-8 text-pine" />
          <span class="text-xl font-extrabold">BilimLog</span>
        </div>
        <h1 class="text-3xl font-extrabold">Login</h1>
        <p class="mt-2 text-sm text-ink/70">Your name, surname, username, phone number and password are required.</p>

        <div class="mt-8 space-y-4">
          <label v-for="field in fields" :key="field.key" class="block">
            <span class="mb-1.5 block text-sm font-semibold">{{ field.label }}</span>
            <input
              v-model="form[field.key]"
              :type="field.type"
              :autocomplete="field.autocomplete"
              required
              class="w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none ring-pine/30 focus:ring-4"
            >
            <span v-if="fieldErrors[field.key]" class="mt-1 block text-sm text-red-700">
              {{ fieldErrors[field.key][0] }}
            </span>
          </label>
        </div>

        <p v-if="error" class="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="mt-6 w-full rounded-2xl bg-pine px-4 py-3 font-bold text-white hover:bg-pine-dark disabled:opacity-60"
        >
          {{ loading ? 'Loading...' : 'Login' }}
        </button>
      </form>
    </section>
  </main>
</template>
