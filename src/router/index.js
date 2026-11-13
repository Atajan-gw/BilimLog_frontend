import { createRouter, createWebHistory } from 'vue-router'
import { auth, homeFor, refreshMe } from '@/lib/auth'
import LoginView from '@/views/LoginView.vue'
import StudentView from '@/views/StudentView.vue'
import TeacherView from '@/views/TeacherView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'login', component: LoginView, meta: { guest: true } },
    { path: '/student', name: 'student', component: StudentView, meta: { role: 'student' } },
    { path: '/teacher', name: 'teacher', component: TeacherView, meta: { role: 'teacher' } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { auth: true } },
  ],
})

router.beforeEach(async (to) => {
  if (!auth.ready) await refreshMe()

  if (to.meta.guest && auth.user) return homeFor(auth.user)
  if (!to.meta.guest && !auth.user) return { name: 'login' }
  if (to.meta.role && auth.user?.role !== to.meta.role) return homeFor(auth.user)
  return true
})

export default router
