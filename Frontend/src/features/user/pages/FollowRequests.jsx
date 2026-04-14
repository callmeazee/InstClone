import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { getPendingRequests, acceptFollowRequest, rejectFollowRequest } from '../../../services/user.api'
import { getConsistentAvatar } from '../../../utils/avatars'
import Nav from '../../shared/components/Nav'
import '../style/follow-requests.scss'

// Fixed-position Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        minWidth: '260px',
        maxWidth: 'calc(100vw - 2.5rem)',
        padding: '0.85rem 1.25rem',
        borderRadius: '0.85rem',
        background: type === 'error' ? 'rgba(185,28,28,0.92)' : 'rgba(21,128,61,0.92)',
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.9rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        animation: 'slideInToast 0.25s ease',
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 0 }}
        aria-label="Dismiss"
      >✕</button>
    </div>
  )
}

const FollowRequests = () => {
  const { user, isInitialized } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ message: '', type: '' })
  const [processingUsername, setProcessingUsername] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const clearToast = useCallback(() => {
    setToast({ message: '', type: '' })
  }, [])

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const data = await getPendingRequests()
      setRequests(data.requests || [])
    } catch (err) {
      console.error('Failed to fetch pending requests:', err)
      showToast(err?.response?.data?.message || 'Failed to load follow requests', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (username) => {
    try {
      setProcessingUsername(username)
      await acceptFollowRequest(username)
      setRequests(prev => prev.filter(req => req.follower !== username))
      showToast(`✓ You accepted ${username}'s follow request!`, 'success')
    } catch (err) {
      console.error('Failed to accept follow request:', err)
      showToast(err?.response?.data?.message || 'Failed to accept request', 'error')
    } finally {
      setProcessingUsername(null)
    }
  }

  const handleReject = async (username) => {
    try {
      setProcessingUsername(username)
      await rejectFollowRequest(username)
      setRequests(prev => prev.filter(req => req.follower !== username))
      showToast(`✕ Rejected request from ${username}`, 'success')
    } catch (err) {
      console.error('Failed to reject follow request:', err)
      showToast(err?.response?.data?.message || 'Failed to reject request', 'error')
    } finally {
      setProcessingUsername(null)
    }
  }

  if (!isInitialized) {
    return (
      <div className="follow-requests app-shell-page">
        <Nav />
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Initializing...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="follow-requests app-shell-page">
        <Nav />
        <div className="container">
          <p className="not-auth">Please login to view follow requests</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="follow-requests app-shell-page">
        <Nav />
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading follow requests...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="follow-requests app-shell-page">
      <Nav />
      <div className="container">
        <div className="header">
          <h1>Follow Requests</h1>
          <button 
            className="back-btn"
            onClick={() => navigate('/feed')}
            title="Go back to feed"
          >
            ← Back to Feed
          </button>
          <span className="count">{requests.length}</span>
        </div>

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />

        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <h2>No pending requests</h2>
            <p>When someone sends you a follow request, it will appear here</p>
            <p className="empty-tip">Tip: ask another user to follow one of your posts and the request will appear here.</p>
            <button 
              className="btn-back-home"
              onClick={() => navigate('/feed')}
            >
              Go to Feed
            </button>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => {
              const followerDetails = request.followerDetails || {}
              const followerUsername = request.follower
              const avatar = followerDetails.profileImage || getConsistentAvatar(followerUsername)
              
              return (
                <div key={request._id} className="request-card">
                  <div className="request-info">
                    <div className="avatar">
                      <img src={avatar} alt={followerUsername} />
                    </div>
                    <div className="details">
                      <p className="username">{followerDetails.email || followerUsername}</p>
                      <p className="timestamp">
                        @{followerUsername}
                      </p>
                    </div>
                  </div>

                  <div className="actions">
                    <button
                      className="btn-accept"
                      onClick={() => handleAccept(followerUsername)}
                      disabled={processingUsername === followerUsername}
                      title="Accept follow request"
                    >
                      {processingUsername === followerUsername ? '⏳' : '✓'} Accept
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(followerUsername)}
                      disabled={processingUsername === followerUsername}
                      title="Reject follow request"
                    >
                      {processingUsername === followerUsername ? '⏳' : '✕'} Reject
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FollowRequests
