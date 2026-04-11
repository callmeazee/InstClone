/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import { getMe } from "../../services/auth.api.js";

export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isInitialized, setIsInitialized] = useState(false)

    // Load user from localStorage on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user')
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser)
                    setUser(parsedUser)
                } else {
                    // Try to fetch user from backend if no stored user
                    try {
                        const res = await getMe()
                        if (res.user) {
                            setUser(res.user)
                            localStorage.setItem('user', JSON.stringify(res.user))
                        }
                    } catch (err) {
                        // User not authenticated, that's okay
                        console.log('User not authenticated on load')
                    }
                }
            } catch (err) {
                console.error('Error initializing auth:', err)
            } finally {
                setLoading(false)
                setIsInitialized(true)
            }
        }

        initializeAuth()
    }, [])

    // Persist user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        } else {
            localStorage.removeItem('user')
        }
    }, [user])

return (
    <AuthContext.Provider value={{user, setUser, loading, setLoading, isInitialized}}>
        {children}
    </AuthContext.Provider>
)

}