import React from 'react'
import '../style/form.scss'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const {handleLogin, loading} = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    if (loading) {
        return (
            <main>
                <div className="form-container">
                    <h1>Loading...</h1>
                </div>
            </main>
        )
    }

    async function handleSubmit(e){
        e.preventDefault()
        setError('')

        if (!username.trim() || !password.trim()) {
            setError('Username and password are required')
            return
        }

        try {
            const res = await handleLogin(username, password)
            console.log(res)
            setUsername('')
            setPassword('')
            navigate('/feed')
        } catch (err) {
            console.error('Login error:', err)
            // Better error handling with specific messages
            if (err.message.includes('Invalid password')) {
                setError('Invalid password. Please try again.')
            } else if (err.message.includes('not found')) {
                setError('Username not found. Please register first.')
            } else if (err.message.includes('Invalid credentials')) {
                setError('Invalid username or password.')
            } else {
                setError(err.message || 'Login failed. Please try again.')
            }
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Welcome Back</h1>
                <form onSubmit={handleSubmit}>
                    {error && <div className="form-error">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input 
                            id="username"
                            type="text" 
                            placeholder='Enter your username' 
                            name='username' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            type="password" 
                            placeholder='Enter your password' 
                            name='password' 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button type='submit' disabled={loading} className="btn-submit">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="toggleAuthForm">
                    <span>Don't have an account? </span>
                    <Link to="/register">Register here</Link>
                </div>
            </div>
        </main>
    )
}

export default Login