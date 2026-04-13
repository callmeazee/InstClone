import axios from "axios";
import { API_BASE_URL } from "./api.config";


const api = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
    withCredentials: true
})

const getErrorPayload = (err) => err.response?.data || err

export const register = async (username, email, password) => {
    try {
        const res = await api.post('/register', {
            username,
            email,
            password
        })
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
        return res.data
    } catch (err) {
        throw getErrorPayload(err)
    }
}
