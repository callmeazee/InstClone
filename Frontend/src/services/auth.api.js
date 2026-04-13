import { createApi } from "./api.config";

const api = createApi('/auth')

const getErrorPayload = (err) => err.response?.data || err

export const register = async (username, email, password) => {
    try {
        const res = await api.post('/register', {
            username,
            email,
            password
        })
        if (res.data?.token) {
            localStorage.setItem('token', res.data.token)
        }
        return res.data
    } catch (err) {
        throw getErrorPayload(err)
    }
}

export const login = async (username, password) => {
    try {
        const res = await api.post('/login', {
            username,
            password
        })
        if (res.data?.token) {
            localStorage.setItem('token', res.data.token)
        }
        return res.data
    } catch (err) {
        throw getErrorPayload(err)
    }
}

export const getMe = async () => {
    try {
        const res = await api.get('/me')
        return res.data
    } catch (err) {
        throw getErrorPayload(err)
    }
}

export const logout = async () => {
    try {
        const res = await api.post('/logout')
        localStorage.removeItem('token')
        return res.data
    } catch (err) {
        throw getErrorPayload(err)
    }
}
