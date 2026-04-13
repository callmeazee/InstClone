import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { getPendingRequests } from '../../../services/user.api'
import { getConsistentAvatar } from '../../../utils/avatars'
import '../nav.scss'

const NAV_ITEMS = [
  { id: 'feed', label: 'Feed', path: '/feed', icon: 'feed' },
  { id: 'create', label: 'Create', path: '/create-post', icon: 'create' },
  { id: 'requests', label: 'Requests', path: '/follow-requests', icon: 'requests' }
]

const NavIcon = ({ type }) => {
  if (type === 'feed') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V18.5C20 19.33 19.33 20 18.5 20H5.5C4.67 20 4 19.33 4 18.5V5.5Z" />
        <path d="M8 8H16" />
        <path d="M8 12H16" />
        <path d="M8 16H13" />
      </svg>
    )
  }

  if (type === 'create') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5V19" />
        <path d="M5 12H19" />
        <path d="M4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12Z" />
      </svg>
    )
  }

  if (type === 'requests') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3L18.5 6V11.5C18.5 15.57 15.73 19.32 12 20.5C8.27 19.32 5.5 15.57 5.5 11.5V6L12 3Z" />
        <path d="M12 8.5V12.5" />
        <path d="M12 16H12.01" />
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z" />
      <path d="M4 20.5C4.89 17.28 8.14 15 12 15C15.86 15 19.11 17.28 20 20.5" />
    </svg>
  )
}

const Nav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, handleLogout } = useAuth()
  const [showDesktopMenu, setShowDesktopMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [pendingRequestCount, setPendingRequestCount] = useState(0)
  const desktopMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const avatar = user?.profileImage || getConsistentAvatar(user?.username || 'user')

  useEffect(() => {
    if (!user) {
      setPendingRequestCount(0)
      return
    }

    const fetchPendingRequestCount = async () => {
      try {
        const data = await getPendingRequests()
        setPendingRequestCount(data.requests?.length || 0)
      } catch (error) {
        console.error('Failed to fetch pending requests count:', error)
        setPendingRequestCount(0)
      }
    }

    fetchPendingRequestCount()
    const interval = setInterval(fetchPendingRequestCount, 30000)

    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    setShowDesktopMenu(false)
    setShowMobileMenu(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target)) {
        setShowDesktopMenu(false)
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  if (!user) {
    return null
  }

  const handleLogoutClick = async () => {
    await handleLogout()
    setShowDesktopMenu(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  const handleLogoClick = () => {
    navigate('/feed')
  }

  const renderMenu = (variant) => (
    <div className={`profile-menu profile-menu--${variant}`}>
      <div className="menu-header">
        <img src={avatar} alt="profile" className="menu-avatar" />
        <div className="menu-user-info">
          <p className="menu-username">{user.username}</p>
          <p className="menu-email">{user.email}</p>
        </div>
      </div>

      <div className="menu-divider"></div>

      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="menu-item"
      >
        <NavIcon type="profile" />
        <span>My Profile</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/profile?tab=saved')}
        className="menu-item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 4.5C6 3.67 6.67 3 7.5 3H16.5C17.33 3 18 3.67 18 4.5V20L12 16.5L6 20V4.5Z" />
        </svg>
        <span>Saved Posts</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/follow-requests')}
        className="menu-item"
      >
        <NavIcon type="requests" />
        <span>Follow Requests</span>
        {pendingRequestCount > 0 && <span className="menu-badge">{pendingRequestCount}</span>}
      </button>

      <div className="menu-divider"></div>

      <button
        type="button"
        onClick={handleLogoutClick}
        className="menu-item logout-item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 7V5.5C10 4.67 10.67 4 11.5 4H18.5C19.33 4 20 4.67 20 5.5V18.5C20 19.33 19.33 20 18.5 20H11.5C10.67 20 10 19.33 10 18.5V17" />
          <path d="M4 12H15" />
          <path d="M8 8L4 12L8 16" />
        </svg>
        <span>Logout</span>
      </button>
    </div>
  )

  return (
    <>
      <nav className="app-nav app-nav--desktop" aria-label="Primary navigation">
        <button type="button" className="app-nav__brand" onClick={handleLogoClick}>
          <span className="brand-mark">CV</span>
          <span className="brand-copy">
            <strong>ConnectVerse</strong>
            <small>Social, simplified</small>
          </span>
        </button>

        <div className="app-nav__desktop-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-link__icon">
                <NavIcon type={item.icon} />
                {item.id === 'requests' && pendingRequestCount > 0 && (
                  <span className="nav-link__badge">{pendingRequestCount}</span>
                )}
              </span>
              <span className="nav-link__label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="app-nav__desktop-footer" ref={desktopMenuRef}>
          <button
            type="button"
            className="profile-trigger"
            onClick={() => setShowDesktopMenu((prev) => !prev)}
          >
            <img src={avatar} alt="profile" className="profile-trigger__avatar" />
            <span className="profile-trigger__copy">
              <strong>{user.username}</strong>
              <small>Open menu</small>
            </span>
          </button>

          {showDesktopMenu && renderMenu('desktop')}
        </div>
      </nav>

      <nav className="app-nav app-nav--mobile" aria-label="Mobile navigation">
        <div className="app-nav__mobile-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link nav-link--mobile ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-link__icon">
                <NavIcon type={item.icon} />
                {item.id === 'requests' && pendingRequestCount > 0 && (
                  <span className="nav-link__badge">{pendingRequestCount}</span>
                )}
              </span>
              <span className="nav-link__label">{item.label}</span>
            </button>
          ))}

          <div className="mobile-profile-wrapper" ref={mobileMenuRef}>
            <button
              type="button"
              className={`nav-link nav-link--mobile ${location.pathname === '/profile' ? 'active' : ''}`}
              onClick={() => setShowMobileMenu((prev) => !prev)}
            >
              <span className="nav-link__icon nav-link__icon--avatar">
                <img src={avatar} alt="profile" className="mobile-profile-avatar" />
              </span>
              <span className="nav-link__label">Profile</span>
            </button>

            {showMobileMenu && renderMenu('mobile')}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Nav
