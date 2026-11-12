import { reactive } from 'vue'
import { api } from './api'

const TOKEN_KEY = 'bilimlog_token'
const USER_KEY = 'bilimlog_user'

export const auth = reactive({
  token: localStorage.getItem(TOKEN_KEY) || '',
  user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  ready: false,
})

export function homeFor(user) {
  if (user?.role === 'teacher') return '/mugallym'
  if (user?.role === 'student') return '/talyp'
  return '/profil'
}

function persist() {
  if (auth.token) localStorage.setItem(TOKEN_KEY, auth.token)
  else localStorage.removeItem(TOKEN_KEY)

  if (auth.user) localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
  else localStorage.removeItem(USER_KEY)
}

export async function login(payload) {
  const data = await api('/login', { method: 'POST', body: payload })
  auth.token = data.token
  auth.user = data.user
  persist()
  return data.user
}

export async function logout() {
  try {
    if (auth.token) await api('/logout', { method: 'POST', token: auth.token })
  } catch {
    // Local session is cleared even if the token is already gone.
  }
  auth.token = ''
  auth.user = null
  persist()
}

export async function refreshMe() {
  if (!auth.token) {
    auth.ready = true
    return null
  }

  try {
    const data = await api('/me', { token: auth.token })
    auth.user = data.user
    persist()
    return data.user
  } catch {
    auth.token = ''
    auth.user = null
    persist()
    return null
  } finally {
    auth.ready = true
  }
}
