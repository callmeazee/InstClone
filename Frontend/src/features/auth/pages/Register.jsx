import React from 'react'
import '../style/form.scss'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Register = () => {
    const {handleRegister, loading} = useAuth()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
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

        // Validation
        if (!username.trim() || !email.trim() || !password.trim()) {
            setError('All fields are required')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            return
        }

        try {
            await handleRegister(username, email, password)
            setUsername('')
            setEmail('')
            setPassword('')
            navigate('/feed')
        } catch (err) {
            console.error('Register error:', err)
            // Better error handling with specific messages
            if (err.message.includes('already exists')) {
                if (err.message.includes('username')) {
                    setError('This username is already taken. Please choose another.')
                } else if (err.message.includes('email')) {
                    setError('This email is already registered. Please login or use another email.')
                } else {
                    setError('Username or email already exists.')
                }
            } else if (err.message.includes('invalid email')) {
                setError('Please enter a valid email address.')
            } else {
                setError(err.message || 'Registration failed. Please try again.')
            }
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Join Us</h1>
                <form onSubmit={handleSubmit}>
                    {error && <div className="form-error">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input 
                            id="username"
                            type="text" 
                            placeholder='Choose a username' 
                            name='username' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder='Enter your email' 
                            name='email' 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            type="password" 
                            placeholder='Create a strong password' 
                            name='password' 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button type='submit' disabled={loading} className="btn-submit">
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <div className="toggleAuthForm">
                    <span>Already have an account? </span>
                    <Link to="/login">Login here</Link>
                </div>
            </div>
        </main>
    )
}

export default Register