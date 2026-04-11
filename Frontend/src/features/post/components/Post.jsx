import React, { useState } from 'react'
import { likePost, unlikePost } from '../services/post.api'
import { followUser, unfollowUser } from '../../../services/user.api'
import { savePost, unsavePost } from '../../../services/saved.api'
import { getConsistentAvatar } from '../../../utils/avatars'
import Comments from './Comments'

const Post = ({ user, post, onFollowStatusChange }) => {
  // Use consistent avatar based on username
  const avatar = user?.profileImage || getConsistentAvatar(user?.username || 'user')
  const username = user?.username || "Unknown"
  
  const [isLiked, setIsLiked] = useState(post?.isLiked || false)
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0)
  const [followStatus, setFollowStatus] = useState(post?.followStatus || null) // null, 'pending', 'accepted'
  const [isSaved, setIsSaved] = useState(post?.isSaved || false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLike = async (e) => {
    e.preventDefault()
    if (likeLoading) return
    
    // Optimistic update
    const wasLiked = isLiked
    const previousCount = likeCount
    
    try {
      setLikeLoading(true)
      setIsAnimating(true)
      
      if (isLiked) {
        // Optimistic update for unlike
        setIsLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
        await unlikePost(post._id)
      } else {
        // Optimistic update for like
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
        await likePost(post._id)
      }
      
      setTimeout(() => setIsAnimating(false), 400)
    } catch (error) {
      console.error("Like error:", error)
      // Rollback on error
      setIsLiked(wasLiked)
      setLikeCount(previousCount)
      setIsAnimating(false)
    } finally {
      setLikeLoading(false)
    }
  }

  const handleFollow = async (e) => {
    e.preventDefault()
    if (followLoading || !username || followStatus === 'pending') return
    
    // Save previous state for rollback
    const previousStatus = followStatus
    
    try {
      setFollowLoading(true)
      setError('')
      
      if (followStatus === null) {
        // Send follow request (status changes to 'pending')
        setFollowStatus('pending')
        const response = await followUser(username)
        console.log('Follow request sent:', response)
        // Call parent callback to refresh feed and update all posts
        if (onFollowStatusChange) {
          setTimeout(() => onFollowStatusChange(), 500)
        }
      } else if (followStatus === 'accepted') {
        // Unfollow (status changes back to null)
        setFollowStatus(null)
        await unfollowUser(username)
        // Call parent callback to refresh feed
        if (onFollowStatusChange) {
          setTimeout(() => onFollowStatusChange(), 500)
        }
      }
    } catch (error) {
      console.error("Follow error:", error)
      
      // Extract error details
      const statusCode = error?.response?.status
      const errorData = error?.response?.data
      const errorMessage = errorData?.message || error?.message || 'An error occurred'
      
      // Handle 409 Conflict (Already pending/existing) - keep pending state
      if (statusCode === 409) {
        console.log('409 Conflict - Follow request already exists on server')
        setFollowStatus('pending') // Keep as pending since it already is on server
        setError('⚠️ Follow request already sent and is pending. Waiting for their response...')
      } else {
        // For other errors, rollback on error
        setFollowStatus(previousStatus)
        
        // Display user-friendly error message
        if (errorMessage.toLowerCase().includes('cannot follow yourself')) {
          setError('❌ You cannot follow yourself')
        } else if (errorMessage.toLowerCase().includes('not found')) {
          setError('❌ User not found')
        } else if (errorMessage.toLowerCase().includes('already accepted')) {
          setError('✓ Already following this user')
        } else {
          setError(`❌ ${errorMessage}`)
        }
      }
      
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (saveLoading) return
    
    const wasSaved = isSaved
    
    try {
      setSaveLoading(true)
      
      if (isSaved) {
        // Unsave
        setIsSaved(false)
        await unsavePost(post._id)
      } else {
        // Save
        setIsSaved(true)
        await savePost(post._id)
      }
    } catch (error) {
      console.error("Save error:", error)
      // Rollback on error
      setIsSaved(wasSaved)
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="post">
      {error && <div className="post-error">{error}</div>}
      
      <div className="user">
        <div className="user-info">
          <div className="img-wrapper">
            <img src={avatar} alt="profile" />
          </div>
          <p>{username}</p>
        </div>
        <button 
          className={`follow-btn ${followStatus === 'accepted' ? 'following' : followStatus === 'pending' ? 'pending' : ''}`}
          onClick={handleFollow}
          disabled={followLoading || followStatus === 'pending'}
          title={followStatus === 'pending' ? 'Follow request pending - Waiting for response' : followStatus === 'accepted' ? 'Following - Click to unfollow' : 'Send follow request'}
        >
          {followLoading ? '🔄 Sending...' : followStatus === 'accepted' ? '✓ Following' : followStatus === 'pending' ? '⏳ Pending' : '+ Follow'}
        </button>
      </div>
      
      <img src={post.imgUrl} alt="post" />
      
      <div className="icons">
        <div className="left">
          <div className="like-action">
            <button onClick={handleLike} disabled={likeLoading} title={isLiked ? "Unlike" : "Like"}>
              <svg 
                className={`${isLiked ? 'like' : ''} ${isAnimating ? 'like-animate' : ''}`}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853ZM18.827 6.1701C17.3279 4.66794 14.9076 4.60701 13.337 6.01687L12.0019 7.21524L10.6661 6.01781C9.09098 4.60597 6.67506 4.66808 5.17157 6.17157C3.68183 7.66131 3.60704 10.0473 4.97993 11.6232L11.9999 18.6543L19.0201 11.6232C20.3935 10.0467 20.319 7.66525 18.827 6.1701Z"></path>
              </svg>
            </button>
            <span className="like-count">{likeCount}</span>
          </div>
          
          <div className="comment-action">
            <button title="Comments" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.76282 17H20V5H4V18.3851L5.76282 17ZM6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z"></path>
              </svg>
            </button>
          </div>
          
          <button title="Share">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path>
            </svg>
          </button>
        </div>
        
        <div className="right">
          <button 
            title={isSaved ? "Unsave" : "Save"}
            onClick={handleSave}
            disabled={saveLoading}
            className={`save-btn ${isSaved ? 'saved' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="bottom">
        <p className="caption">{post.caption}</p>
        <Comments postId={post._id} />
      </div>
    </div>
  )
}

export default Post