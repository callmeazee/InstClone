import React, { useState, useEffect } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { getPendingRequests, acceptFollowRequest, rejectFollowRequest } from '../../../services/user.api'
import { getConsistentAvatar } from '../../../utils/avatars'
import '../style/follow-requests.scss'

const FollowRequests = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [processingUsername, setProcessingUsername] = useState(null)

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getPendingRequests()
      console.log("Fetched pending requests:", data)
      setRequests(data.requests || [])
    } catch (err) {
      console.error("Failed to fetch pending requests:", err)
      setError(err?.response?.data?.message || 'Failed to load follow requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (username) => {
    try {
      setProcessingUsername(username)
      console.log("Accepting follow request from:", username)
      await acceptFollowRequest(username)
      // Remove from list after accepting
      setRequests(prev => prev.filter(req => req.follower !== username))
      setSuccessMessage(`✓ You are now following ${username}!`)
      setError('')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error("Failed to accept follow request:", err)
      setError(err?.response?.data?.message || 'Failed to accept request')
      setTimeout(() => setError(''), 4000)
    } finally {
      setProcessingUsername(null)
    }
  }

  const handleReject = async (username) => {
    try {
      setProcessingUsername(username)
      console.log("Rejecting follow request from:", username)
      await rejectFollowRequest(username)
      // Remove from list after rejecting
      setRequests(prev => prev.filter(req => req.follower !== username))
      setSuccessMessage(`✓ Rejected request from ${username}`)
      setError('')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error("Failed to reject follow request:", err)
      setError(err?.response?.data?.message || 'Failed to reject request')
      setTimeout(() => setError(''), 4000)
    } finally {
      setProcessingUsername(null)
    }
  }

  if (!user) {
    return (
      <div className="follow-requests">
        <div className="container">
          <p className="not-auth">Please login to view follow requests</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="follow-requests">
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
    <div className="follow-requests">
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

        {error && (
          <div className="error-banner">
            ❌ {error}
          </div>
        )}

        {successMessage && (
          <div className="success-banner">
            {successMessage}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <h2>No pending requests</h2>
            <p>When someone sends you a follow request, it will appear here</p>
            <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '20px'}}>
              💡 Tip: Have another user click the Follow button on your profile posts to send you a follow request
            </p>
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
