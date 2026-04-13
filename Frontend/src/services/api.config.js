const normalizeBaseUrl = (url) => {
  if (!url) {
    return '/api'
  }

  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`
  return withProtocol.endsWith('/api') ? withProtocol : `${withProtocol.replace(/\/$/, '')}/api`
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

import axios from 'axios'

export const createApi = (path = '') => {
  const api = axios.create({
    baseURL: `${API_BASE_URL}${path}`,
    withCredentials: true
  })

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return api
}
