import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/hooks/useAuth.js'
import './style/home.scss'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // If user is logged in, redirect to feed
  if (user) {
    navigate('/feed')
    return null
  }

  return (
    <main className="home-page">
      <div className="home-container">
        <div className="home-content">
          <div className="home-header">
            <h1 className="home-title">Insta</h1>
            <p className="home-subtitle">Share your moments with the world</p>
          </div>

          <div className="home-description">
            <p>Connect with friends, share photos and videos, and discover new content from people around you.</p>
          </div>

          <div className="home-features">
            <div className="feature">
              <span className="feature-icon">📷</span>
              <h3>Share Posts</h3>
              <p>Post photos and captions to connect with your followers</p>
            </div>
            <div className="feature">
              <span className="feature-icon">❤️</span>
              <h3>Like & Comment</h3>
              <p>Like posts and leave comments to engage with content</p>
            </div>
            <div className="feature">
              <span className="feature-icon">👥</span>
              <h3>Follow Friends</h3>
              <p>Follow other users and see their posts in your feed</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🔖</span>
              <h3>Save Posts</h3>
              <p>Save your favorite posts to view them later</p>
            </div>
          </div>

          <div className="home-cta">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>

          <div className="home-footer">
            <p>Already have an account? <button onClick={() => navigate('/login')} className="link-btn">Login here</button></p>
            <p>New here? <button onClick={() => navigate('/register')} className="link-btn">Create an account</button></p>
          </div>
        </div>

        <div className="home-illustration">
          <div className="illustration-box">
            <div className="illustration-post post-1"></div>
            <div className="illustration-post post-2"></div>
            <div className="illustration-post post-3"></div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
