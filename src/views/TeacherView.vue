<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Users } from '@lucide/vue'
import AppHeader from '@/components/AppHeader.vue'
import { api, unwrapList } from '@/lib/api'
import { auth } from '@/lib/auth'

const groups = ref([])
const subjects = ref([])
const selectedId = ref(null)
const loading = ref(true)
const error = ref('')
const gradingStudent = ref(null)
const saving = ref(false)
const notice = ref('')

const gradeForm = reactive({
  subject_id: '',
  semester: '2026-Spring',
  score: '',
})

const selectedGroup = computed(() => groups.value.find((group) => group.id === selectedId.value) || null)

function fullName(user) {
  return [user?.name, user?.surname].filter(Boolean).join(' ') || 'Talyp'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [groupData, subjectData] = await Promise.all([
      api('/teacher/groups', { token: auth.token }),
      api('/subjects', { token: auth.token }),
    ])
    groups.value = unwrapList(groupData)
    subjects.value = unwrapList(subjectData)
    if (!selectedId.value && groups.value.length) selectedId.value = groups.value[0].id
    if (!gradeForm.subject_id && subjects.value.length) gradeForm.subject_id = String(subjects.value[0].id)
  } catch (err) {
    error.value = err.message || 'Toparlar açylmady.'
  } finally {
    loading.value = false
  }
}

function openGrade(student) {
  gradingStudent.value = student
  notice.value = ''
  gradeForm.score = ''
  gradeForm.semester = student.grades?.[0]?.semester || '2026-Spring'
}

async function saveGrade() {
  if (!gradingStudent.value) return
  saving.value = true
  notice.value = ''
  try {
    await api('/teacher/grades', {
      method: 'POST',
      token: auth.token,
      body: {
        student_id: gradingStudent.value.id,
        subject_id: Number(gradeForm.subject_id),
        semester: gradeForm.semester,
        score: Number(gradeForm.score),
      },
    })
    notice.value = 'Baha ýazylady.'
    gradingStudent.value = null
    await load()
  } catch (err) {
    const first = err.errors ? Object.values(err.errors)[0]?.[0] : null
    notice.value = first || err.message || 'Baha ýazylmady.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[280px_1fr] sm:px-8">
      <aside>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">Toparlarym</h2>
        <p v-if="loading" class="text-sm text-ink/60">Ýüklenýär...</p>
        <p v-else-if="error" class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{{ error }}</p>
        <p v-else-if="!groups.length" class="rounded-2xl bg-white px-4 py-5 text-sm text-ink/70">
          Size entek topar berilmedik.
        </p>
        <div v-else class="space-y-2">
          <button
            v-for="group in groups"
            :key="group.id"
            type="button"
            class="w-full rounded-2xl px-4 py-3 text-left"
            :class="group.id === selectedId ? 'bg-pine text-white' : 'bg-white hover:bg-sand'"
            @click="selectedId = group.id"
          >
            <p class="font-bold">{{ group.name }}</p>
            <p class="text-sm opacity-80">{{ group.faculty?.name || 'Fakultet ýok' }} · {{ group.course_number }}-nji kurs</p>
            <p class="mt-1 text-xs opacity-70">{{ group.students?.length || 0 }} talyp</p>
          </button>
        </div>
      </aside>

      <section class="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <template v-if="selectedGroup">
          <div class="mb-5 flex items-center gap-3">
            <Users class="size-5 text-pine" />
            <div>
              <h2 class="text-xl font-extrabold">{{ selectedGroup.name }}</h2>
              <p class="text-sm text-ink/60">Talypylar we olaryň bahalary</p>
            </div>
          </div>

          <p v-if="notice" class="mb-4 rounded-2xl bg-paper px-4 py-3 text-sm">{{ notice }}</p>

          <p v-if="!selectedGroup.students?.length" class="rounded-2xl bg-paper px-4 py-8 text-center text-ink/70">
            Bu toparda entek talyp ýok.
          </p>

          <div v-else class="space-y-4">
            <article
              v-for="student in selectedGroup.students"
              :key="student.id"
              class="rounded-2xl border border-sand p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="font-bold">{{ fullName(student.user) }}</p>
                  <p class="text-sm text-ink/60">
                    {{ student.user?.username }} · {{ student.user?.phone_number }} · {{ student.student_id_card_number }}
                  </p>
                </div>
                <button
                  type="button"
                  class="rounded-full bg-pine px-4 py-2 text-sm font-bold text-white hover:bg-pine-dark"
                  @click="openGrade(student)"
                >
                  Baha goý
                </button>
              </div>

              <div v-if="student.grades?.length" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="grade in student.grades"
                  :key="grade.id"
                  class="rounded-full bg-paper px-3 py-1 text-sm"
                >
                  {{ grade.subject?.name }} · {{ grade.semester }} · {{ Number(grade.score).toFixed(2) }}
                </span>
              </div>
              <p v-else class="mt-3 text-sm text-ink/50">Baha ýok.</p>

              <form
                v-if="gradingStudent?.id === student.id"
                class="mt-4 grid gap-3 rounded-2xl bg-paper p-4 sm:grid-cols-[1.2fr_1fr_120px_auto]"
                @submit.prevent="saveGrade"
              >
                <label class="block text-sm">
                  <span class="mb-1 block font-semibold">Sapak</span>
                  <select v-model="gradeForm.subject_id" required class="w-full rounded-xl border border-sand bg-white px-3 py-2">
                    <option v-for="subject in subjects" :key="subject.id" :value="String(subject.id)">
                      {{ subject.name }}
                    </option>
                  </select>
                </label>
                <label class="block text-sm">
                  <span class="mb-1 block font-semibold">Semestr</span>
                  <input v-model="gradeForm.semester" required maxlength="20" class="w-full rounded-xl border border-sand bg-white px-3 py-2">
                </label>
                <label class="block text-sm">
                  <span class="mb-1 block font-semibold">Baha</span>
                  <input v-model="gradeForm.score" required type="number" min="0" max="100" step="0.01" class="w-full rounded-xl border border-sand bg-white px-3 py-2">
                </label>
                <div class="flex items-end gap-2">
                  <button type="submit" :disabled="saving" class="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                    {{ saving ? '...' : 'Ýaz' }}
                  </button>
                  <button type="button" class="rounded-xl px-3 py-2 text-sm" @click="gradingStudent = null">Ýatyr</button>
                </div>
              </form>
            </article>
          </div>
        </template>
        <p v-else class="text-ink/60">Topar saýlaň.</p>
      </section>
    </main>
  </div>
</template>
