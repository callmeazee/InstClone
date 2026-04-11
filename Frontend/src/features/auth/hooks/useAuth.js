import { useContext } from "react";
import { AuthContext } from "../auth.context";
import {login, register, logout, getMe} from '../../../services/auth.api.js'

export const useAuth = () => {
    const context = useContext(AuthContext)

    const {user, setUser, loading, setLoading, isInitialized} = context

   const handleLogin = async (username, password) => {
       setLoading(true)
       try {
           const res = await login(username, password)
           setUser(res.user)
           return res
       } catch (err) {
            const errorMessage = err?.message || 'Login failed. Please try again.'
            throw new Error(errorMessage)
       } finally {
           setLoading(false)
       }
   }
   
   const handleRegister = async (username, email, password) => {
       setLoading(true)
       try {
           const res = await register(username, email, password)
           setUser(res.user)
           return res
       } catch (err) {
           const errorMessage = err?.message || 'Registration failed. Please try again.'
           throw new Error(errorMessage)
       } finally {
           setLoading(false)
       }
   }
   
   const handleGetMe = async () => {
    setLoading(true)
    try {
        const res = await getMe()
        if (res.user) {
            setUser(res.user)
        }
        return res
    } catch (err) {
        const errorMessage = err?.message || 'Failed to fetch user.'
        throw new Error(errorMessage)
    } finally {
        setLoading(false)
    }
   }

   const handleLogout = async () => {
    try {
        setLoading(true)
        await logout()
        setUser(null)
        localStorage.removeItem('user')
    } catch (err) {
        console.error('Logout error:', err)
        // Still clear user even if logout fails
        setUser(null)
        localStorage.removeItem('user')
    } finally {
        setLoading(false)
    }
   }

    return {user, loading, isInitialized, handleLogin, handleRegister, handleGetMe, handleLogout}
}