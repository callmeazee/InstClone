/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext()

export const AuthProvider = ({ children, initialUser = null, isInitialized = false }) => {
    const [user, setUser] = useState(initialUser)
    const [loading, setLoading] = useState(false)
    const [authInitialized, setAuthInitialized] = useState(isInitialized)

    useEffect(() => {
        setUser(initialUser)
        setAuthInitialized(isInitialized)
    }, [initialUser, isInitialized])

    // Persist user to localStorage whenever it changes
    useEffect(() => {
        if (!authInitialized) {
            return
        }

        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        } else {
            localStorage.removeItem('user')
        }
    }, [authInitialized, user])

return (
    <AuthContext.Provider value={{user, setUser, loading, setLoading, isInitialized: authInitialized}}>
        {children}
    </AuthContext.Provider>
)

}
