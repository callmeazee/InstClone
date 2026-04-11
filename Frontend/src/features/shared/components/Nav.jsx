import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { getPendingRequests } from '../../../services/user.api'
import { getConsistentAvatar } from '../../../utils/avatars'
import '../nav.scss'

const Nav = () => {
  const navigate = useNavigate()
  const { user, handleLogout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [pendingRequestCount, setPendingRequestCount] = useState(0)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const avatar = user?.profileImage || getConsistentAvatar(user?.username || 'user')

  useEffect(() => {
    if (user) {
      fetchPendingRequestCount()
      // Refresh count every 30 seconds
      const interval = setInterval(fetchPendingRequestCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchPendingRequestCount = async () => {
    try {
      setLoadingRequests(true)
      const data = await getPendingRequests()
      setPendingRequestCount(data.requests?.length || 0)
    } catch (error) {
      console.error("Failed to fetch pending requests count:", error)
      setPendingRequestCount(0)
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleLogoutClick = async () => {
    await handleLogout()
    setShowProfileMenu(false)
    navigate('/')
  }

  const handleLogoClick = () => {
    if (user) {
      navigate('/feed')
    } else {
      navigate('/')
    }
  }

  return (
    <nav className='nav-bar'>
      <div className='nav-left'>
        <button
          type='button'
          className='logo'
          onClick={handleLogoClick}
          title="Go to home"
        >
          <span className="logo-icon">✨</span>
          <span className="logo-text">ConnectVerse</span>
        </button>
      </div>
      
      <div className='nav-center'>
        {user && (
          <div className="nav-stats">
            <span className="stat-item">
              <strong>Feed</strong>
            </span>
          </div>
        )}
      </div>

      <div className='nav-right'>
        {user && pendingRequestCount > 0 && (
          <button
            type='button'
            onClick={() => navigate('/follow-requests')}
            className='requests-btn'
            title={`You have ${pendingRequestCount} pending follow request(s)`}
          >
            <span className="bell-icon">🔔</span>
            <span className="request-badge">{pendingRequestCount}</span>
          </button>
        )}

        {user && (
          <button
            type='button'
            onClick={() => navigate('/create-post')}
            className='create-post-btn'
            title="Create a new post"
          >
            <span className="plus-icon">+</span>
            <span className="btn-text">Create</span>
          </button>
        )}
        
        {user && (
          <div className="profile-menu-wrapper">
            <button
              type='button'
              className='profile-btn'
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title={`View ${user.username}'s profile`}
            >
              <img src={avatar} alt="profile" className="profile-avatar" />
              <span className="username">{user.username}</span>
              <span className="menu-toggle">▼</span>
            </button>
            
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="menu-header">
                  <img src={avatar} alt="profile" className="menu-avatar" />
                  <div className="menu-user-info">
                    <p className="menu-username">{user.username}</p>
                    <p className="menu-email">{user.email}</p>
                  </div>
                </div>
                <div className="menu-divider"></div>
                <button 
                  onClick={() => {
                    navigate('/profile')
                    setShowProfileMenu(false)
                  }}
                  className="menu-item"
                >
                  <span className="menu-icon">👤</span>
                  My Profile
                </button>
                <button 
                  onClick={() => {
                    navigate('/follow-requests')
                    setShowProfileMenu(false)
                  }}
                  className="menu-item"
                >
                  <span className="menu-icon">🔔</span>
                  Follow Requests {pendingRequestCount > 0 && `(${pendingRequestCount})`}
                </button>
                <button 
                  onClick={() => {
                    navigate('/profile?tab=saved')
                    setShowProfileMenu(false)
                  }}
                  className="menu-item"
                >
                  <span className="menu-icon">🔖</span>
                  Saved Posts
                </button>
                <div className="menu-divider"></div>
                <button 
                  onClick={handleLogoutClick}
                  className="menu-item logout-item"
                >
                  <span className="menu-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="nav-auth-buttons">
            <button 
              className="auth-btn login-btn"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="auth-btn signup-btn"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Nav