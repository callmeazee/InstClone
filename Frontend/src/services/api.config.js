const normalizeBaseUrl = (url) => {
  if (!url) {
    return '/api'
  }

  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`
  return withProtocol.endsWith('/api') ? withProtocol : `${withProtocol.replace(/\/$/, '')}/api`
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)
