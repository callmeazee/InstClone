import React from 'react'
import RoutesComponent from './routes'
import './style.scss'
import {AuthProvider} from './features/auth/auth.context'
import { PostContextProvider } from './features/post/post.context'

const App = () => {
  return (
    <AuthProvider>
      <PostContextProvider>
        <RoutesComponent />
      </PostContextProvider>
    </AuthProvider>
  )
}

export default App