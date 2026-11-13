const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

export function unwrapList(payload) {
  const body = payload?.data
  if (Array.isArray(body)) return body
  if (Array.isArray(body?.data)) return body.data
  return []
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || "Server don't resport")
    error.status = response.status
    error.errors = data.errors || null
    throw error
  }
  return data
}
