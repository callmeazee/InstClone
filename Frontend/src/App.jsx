import React, { useEffect, useState } from 'react'
import RoutesComponent from './routes'
import './style.scss'
import {AuthProvider} from './features/auth/auth.context'
import { PostContextProvider } from './features/post/post.context'
import { getMe } from './services/auth.api'

const SessionLoader = () => (
  <div className="app-loading-shell">
    <div className="app-loading-card">
      <div className="spinner" />
      <h1>Loading ConnectVerse</h1>
      <p>Checking your session so we can keep you signed in.</p>
    </div>
  </div>
)

const App = () => {
  const [sessionUser, setSessionUser] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const verifySession = async () => {
      try {
        const response = await getMe()

        if (!cancelled) {
          setSessionUser(response?.user ?? null)
        }
      } catch (error) {
        if (!cancelled) {
          setSessionUser(null)
        }
      } finally {
        if (!cancelled) {
          setSessionReady(true)
        }
      }
    }

    verifySession()

    return () => {
      cancelled = true
    }
  }, [])

  if (!sessionReady) {
    return <SessionLoader />
  }

  return (
    <AuthProvider initialUser={sessionUser} isInitialized={sessionReady}>
      <PostContextProvider>
        <RoutesComponent />
      </PostContextProvider>
    </AuthProvider>
  )
}

export default App
