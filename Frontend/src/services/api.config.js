const normalizeBaseUrl = (url) => {
  if (!url) {
    return '/api'
  }

  return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)
