<script setup>
import { computed, onMounted, ref } from 'vue'
import { BookOpen, IdCard, School } from '@lucide/vue'
import AppHeader from '@/components/AppHeader.vue'
import { api } from '@/lib/api'
import { auth } from '@/lib/auth'

const profile = ref(null)
const loading = ref(true)
const error = ref('')

const grades = computed(() => {
  const rows = profile.value?.grades || []
  return [...rows].sort((a, b) => (a.subject?.name || '').localeCompare(b.subject?.name || ''))
})

const average = computed(() => {
  if (!grades.value.length) return null
  const total = grades.value.reduce((sum, grade) => sum + Number(grade.score), 0)
  return (total / grades.value.length).toFixed(2)
})

function scoreTone(score) {
  const value = Number(score)
  if (value >= 90) return 'bg-emerald-100 text-emerald-800'
  if (value >= 70) return 'bg-amber-100 text-amber-800'
  return 'bg-rose-100 text-rose-800'
}

onMounted(async () => {
  try {
    const data = await api('/student/profile', { token: auth.token })
    profile.value = data.data
  } catch (err) {
    error.value = err.message || 'Profile not found.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <p v-if="loading" class="text-ink/60">Loading data...</p>
      <p v-else-if="error" class="rounded-2xl bg-red-50 px-4 py-3 text-red-800">{{ error }}</p>

      <template v-else-if="profile">
        <section class="grid gap-4 sm:grid-cols-3">
          <article class="rounded-3xl bg-white p-5 shadow-sm">
            <School class="size-5 text-pine" />
            <p class="mt-3 text-sm text-ink/60">Faculty</p>
            <p class="text-lg font-bold">{{ profile.faculty?.name || '—' }}</p>
          </article>
          <article class="rounded-3xl bg-white p-5 shadow-sm">
            <IdCard class="size-5 text-pine" />
            <p class="mt-3 text-sm text-ink/60">Group</p>
            <p class="text-lg font-bold">{{ profile.group?.name || '—' }}</p>
            <p class="text-sm text-ink/70">{{ profile.specialty }} · {{ profile.course_year }}-th course</p>
          </article>
          <article class="rounded-3xl bg-pine p-5 text-white shadow-sm">
            <BookOpen class="size-5" />
            <p class="mt-3 text-sm text-white/70">Average Score</p>
            <p class="text-3xl font-extrabold">{{ average ?? '—' }}</p>
            <p class="text-sm text-white/70">{{ grades.length }} baha · {{ profile.student_id_card_number }}</p>
          </article>
        </section>

        <section class="mt-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div class="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 class="text-xl font-extrabold">Grades by Courses</h2>
              <p class="text-sm text-ink/60">{{ auth.user?.phone_number }} · {{ auth.user?.username }}</p>
            </div>
          </div>

          <p v-if="!grades.length" class="rounded-2xl bg-paper px-4 py-6 text-center text-ink/70">
            No grades found.
          </p>

          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-[640px] text-left text-sm">
              <thead class="text-ink/50">
                <tr>
                  <th class="pb-3 font-semibold">Course</th>
                  <th class="pb-3 font-semibold">Credit</th>
                  <th class="pb-3 font-semibold">Semester</th>
                  <th class="pb-3 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="grade in grades" :key="grade.id" class="border-t border-sand">
                  <td class="py-3 pr-4">
                    <p class="font-semibold">{{ grade.subject?.name || 'Lesson' }}</p>
                    <p class="text-ink/60">{{ grade.subject?.description }}</p>
                  </td>
                  <td class="py-3 pr-4">{{ grade.subject?.credits ?? '—' }}</td>
                  <td class="py-3 pr-4">{{ grade.semester }}</td>
                  <td class="py-3">
                    <span class="rounded-full px-3 py-1 font-bold" :class="scoreTone(grade.score)">
                      {{ Number(grade.score).toFixed(2) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
