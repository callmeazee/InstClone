import React, { useEffect, useState } from 'react'
import { getComments, createComment, deleteComment } from '../../../services/comment.api'
import { useAuth } from '../../auth/hooks/useAuth'
import { getConsistentAvatar } from '../../../utils/avatars'
import '../style/comments.scss'

const Comments = ({ postId, onCommentAdded }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState('')
  const [showComments, setShowComments] = useState(false)

  // Fetch comments
  const fetchComments = async () => {
    try {
      setFetchLoading(true)
      const res = await getComments(postId)
      setComments(res.comments || [])
    } catch (err) {
      console.error('Failed to fetch comments:', err)
      setError('Failed to load comments')
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    if (showComments) {
      fetchComments()
    }
  }, [showComments])

  // Handle new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) {
      setError('Comment cannot be empty')
      return
    }

    try {
      setLoading(true)
      setError('')
      const res = await createComment(postId, newComment)
      
      // Add new comment to the list
      setComments([res.comment, ...comments])
      setNewComment('')
      
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (err) {
      console.error('Failed to add comment:', err)
      setError('Failed to add comment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId)
      setComments(comments.filter(c => c._id !== commentId))
    } catch (err) {
      console.error('Failed to delete comment:', err)
      setError('Failed to delete comment')
    }
  }

  return (
    <div className="comments-section">
      {/* Toggle Comments Button */}
      <button 
        className="toggle-comments-btn"
        onClick={() => setShowComments(!showComments)}
        title={showComments ? "Hide comments" : "Show comments"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.76282 17H20V5H4V18.3851L5.76282 17ZM6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z"></path>
        </svg>
        <span className="comment-count">{comments.length}</span>
      </button>

      {/* Comments Container */}
      {showComments && (
        <div className="comments-container">
          {/* Comment Input */}
          {user && (
            <form className="comment-form" onSubmit={handleSubmitComment}>
              <img 
                src={user?.profileImage || getConsistentAvatar(user?.username || 'user')} 
                alt="your avatar" 
                className="comment-avatar"
              />
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  disabled={loading}
                  className="comment-input"
                />
                <button 
                  type="submit" 
                  disabled={loading || !newComment.trim()}
                  className="comment-submit-btn"
                >
                  {loading ? '...' : 'Post'}
                </button>
              </div>
              {error && <div className="comment-error">{error}</div>}
            </form>
          )}

          {!user && (
            <div className="login-prompt">
              <p>Please log in to comment</p>
            </div>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {fetchLoading ? (
              <div className="loading">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="no-comments">No comments yet. Be the first to comment!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <img 
                    src={getConsistentAvatar(comment.user || 'user')} 
                    alt={comment.user} 
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>{comment.user}</strong>
                      <span className="comment-time">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                  
                  {/* Delete button for comment owner */}
                  {user?.username === comment.user && (
                    <button
                      className="delete-comment-btn"
                      onClick={() => handleDeleteComment(comment._id)}
                      title="Delete comment"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Comments
