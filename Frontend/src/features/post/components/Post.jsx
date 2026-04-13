import React, { useCallback, useEffect, useState } from 'react'
import { likePost, unlikePost, deletePost } from '../services/post.api'
import { followUser, unfollowUser, getFollowStatus } from '../../../services/user.api'
import { savePost, unsavePost } from '../../../services/saved.api'
import { getConsistentAvatar } from '../../../utils/avatars'
import { useAuth } from '../../auth/hooks/useAuth'
import Comments from './Comments'
import '../style/post-interactions.scss'

const Post = ({ user, post, onFollowStatusChange, onPostDeleted, onSaveToggle }) => {
  const { user: currentUser } = useAuth()
  const resolvedUser = typeof user === 'string' ? { username: user } : user
  const postUser = typeof post?.user === 'object' ? post.user : null
  const username = resolvedUser?.username || postUser?.username || 'Unknown'
  const avatar = resolvedUser?.profileImage || postUser?.profileImage || getConsistentAvatar(username)
  const isPostOwner = currentUser?.username === username

  const [isLiked, setIsLiked] = useState(Boolean(post?.isLiked))
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0)
  const [followStatus, setFollowStatus] = useState(post?.followStatus || null)
  const [isSaved, setIsSaved] = useState(Boolean(post?.isSaved))
  const [isAnimating, setIsAnimating] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsLiked(Boolean(post?.isLiked))
    setLikeCount(post?.likes?.length || 0)
    setFollowStatus(post?.followStatus || null)
    setIsSaved(Boolean(post?.isSaved))
  }, [post?._id, post?.followStatus, post?.isLiked, post?.isSaved, post?.likes?.length])

  const checkFollowStatus = useCallback(async () => {
    if (!username || isPostOwner) {
      return
    }

    try {
      const data = await getFollowStatus(username)
      if (data.followStatus !== undefined) {
        setFollowStatus(data.followStatus)
      }
    } catch (err) {
      console.log(`Could not verify follow status for ${username}:`, err.message)
    }
  }, [isPostOwner, username])

  useEffect(() => {
    if (!currentUser?.username || username === currentUser.username || isPostOwner) {
      return
    }

    checkFollowStatus()
  }, [checkFollowStatus, currentUser?.username, isPostOwner, username, post?._id])

  const handleLike = async (e) => {
    e.preventDefault()
    if (likeLoading) return

    const wasLiked = isLiked
    const previousCount = likeCount

    try {
      setLikeLoading(true)
      setIsAnimating(true)

      if (isLiked) {
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
        await unlikePost(post._id)
      } else {
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
        await likePost(post._id)
      }

      setTimeout(() => setIsAnimating(false), 400)
    } catch (likeError) {
      console.error('Like error:', likeError)
      setIsLiked(wasLiked)
      setLikeCount(previousCount)
      setIsAnimating(false)
    } finally {
      setLikeLoading(false)
    }
  }

  const handleFollow = async (e) => {
    e.preventDefault()
    if (followLoading || !username || followStatus === 'pending' || isPostOwner) return

    const previousStatus = followStatus

    try {
      setFollowLoading(true)
      setError('')

      if (followStatus === null) {
        setFollowStatus('pending')
        await followUser(username)
        if (onFollowStatusChange) {
          setTimeout(() => onFollowStatusChange(), 500)
        }
      } else if (followStatus === 'accepted') {
        setFollowStatus(null)
        await unfollowUser(username)
        if (onFollowStatusChange) {
          setTimeout(() => onFollowStatusChange(), 500)
        }
      }
    } catch (followError) {
      console.error('Follow error:', followError)

      const statusCode = followError?.response?.status
      const errorData = followError?.response?.data
      const errorMessage = errorData?.message || followError?.message || 'An error occurred'

      if (statusCode === 409) {
        setFollowStatus('pending')
        setError('Follow request already sent. Waiting for their response.')
      } else {
        setFollowStatus(previousStatus)

        if (errorMessage.toLowerCase().includes('cannot follow yourself')) {
          setError('You cannot follow yourself.')
        } else if (errorMessage.toLowerCase().includes('not found')) {
          setError('User not found.')
        } else if (errorMessage.toLowerCase().includes('already accepted')) {
          setError('You are already following this user.')
        } else {
          setError(errorMessage)
        }
      }

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

      "dev"
      if (isSaved) {
        setIsSaved(false)
        await unsavePost(post._id)
      } else {
        setIsSaved(true)
        await savePost(post._id)
      }

      if (onSaveToggle) {
        onSaveToggle(post._id, !wasSaved)
      }
    } catch (saveError) {
      console.error('Save error:', saveError)
      setIsSaved(wasSaved)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    if (deleteLoading || !isPostOwner) return

    const confirmDelete = window.confirm('Are you sure you want to delete this post? This action cannot be undone.')
    if (!confirmDelete) return

    try {
      setDeleteLoading(true)
      setError('')
      await deletePost(post._id)

      if (onPostDeleted) {
        onPostDeleted(post._id)
      }
    } catch (deleteError) {
      console.error('Delete error:', deleteError)
      const errorMessage = deleteError?.response?.data?.message || deleteError?.message || 'Failed to delete post'
      setError(errorMessage)
      setTimeout(() => setError(''), 5000)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <article className="post">
      {error && <div className="post-error">{error}</div>}

      {isPostOwner && (
        <button
          type="button"
          className="post-delete-btn"
          onClick={handleDelete}
          disabled={deleteLoading}
          title="Delete this post"
          >
          {deleteLoading ? (
            <span className="post-delete-btn__loader" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6H21" />
              <path d="M8 6V4.5C8 3.67 8.67 3 9.5 3H14.5C15.33 3 16 3.67 16 4.5V6" />
              <path d="M18.5 6L17.67 18.45C17.61 19.31 16.9 20 16.04 20H7.96C7.1 20 6.39 19.31 6.33 18.45L5.5 6" />
              <path d="M10 10.5V16" />
              <path d="M14 10.5V16" />
            </svg>
          )}
        </button>
      )}

      <div className="post-header">
        <div className="user-info">
          <div className="img-wrapper">
            <img src={avatar} alt={`${username} avatar`} />
          </div>

          <div className="user-copy">
            <p className="post-username">{username}</p>
            <span className="post-meta">{isPostOwner ? 'Your latest post' : 'From your network'}</span>
          </div>
        </div>

        <div className="post-header-actions">
          {isPostOwner ? (
            <span className="owner-badge">You</span>
          ) : (
            <button
              type="button"
              className={`follow-btn ${followStatus === 'accepted' ? 'following' : followStatus === 'pending' ? 'pending' : ''}`}
              onClick={handleFollow}
              disabled={followLoading || followStatus === 'pending'}
              title={followStatus === 'pending' ? 'Follow request pending' : followStatus === 'accepted' ? 'Click to unfollow' : 'Send follow request'}
            >
              {followLoading ? 'Working...' : followStatus === 'accepted' ? 'Following' : followStatus === 'pending' ? 'Pending' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="post-media">
        <img src={post?.imgUrl} alt={post?.caption || `${username}'s post`} />
      </div>

      <div className="icons">
        <div className="left">
          <div className="like-action">
            <button type="button" onClick={handleLike} disabled={likeLoading} title={isLiked ? 'Unlike' : 'Like'}>
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

          <button type="button" className="post-icon-btn" title="Comments are available below" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.76282 17H20V5H4V18.3851L5.76282 17ZM6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z"></path>
            </svg>
          </button>

          <button type="button" className="post-icon-btn" title="Share">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path>
            </svg>
          </button>
        </div>

        <div className="right">
          <button
            type="button"
            title={isSaved ? 'Unsave' : 'Save'}
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
        {post?.caption && <p className="caption">{post.caption}</p>}
        <Comments postId={post._id} />
      </div>
    </article>
  )
}

export default Post
