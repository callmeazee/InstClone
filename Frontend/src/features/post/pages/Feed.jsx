import React, { useEffect, useState } from 'react'
import '../style/feed.scss'
import Post from '../components/Post'
import { usePost } from '../hook/usePost'
import { useAuth } from '../../auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Nav from '../../shared/components/Nav'

const Feed = () => {
  const { feed, handleGetFeed, loading, error } = usePost()
  const { user, isInitialized } = useAuth()
  const navigate = useNavigate()
  const [feedType, setFeedType] = useState('all') // 'all' or 'my'
  const [filteredPosts, setFilteredPosts] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  // Redirect to login if not authenticated (but wait for auth initialization)
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login')
    }
  }, [user, isInitialized, navigate])

  useEffect(() => {
    if (user) {
      handleGetFeed()
    }
  }, [refreshKey, user])

  useEffect(() => {
    if (feedType === 'all') {
      setFilteredPosts(feed)
    } else {
      // Filter posts by current user
      setFilteredPosts(feed.filter(post => post.user?.username === user?.username))
    }
  }, [feed, feedType, user])

  // Function to refresh feed (called after follow/unfollow actions)
  const refreshFeed = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Function to handle post deletion
  const handlePostDeleted = (postId) => {
    setFilteredPosts(prev => prev.filter(p => p._id !== postId))
  }

  // Show loading spinner while auth is initializing
  if (!isInitialized) {
    return (
      <main className='feed-page app-shell-page'>
        <Nav />
        <div className="feed">
          <div className="message-state">
            <div className="spinner"></div>
            <h2>Initializing...</h2>
            <p>Please wait while we verify your login.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='feed-page app-shell-page'>
      <Nav />
      <div className="feed">
        <header className="feed-header">
          <div className="feed-copy">
            <span className="feed-eyebrow">Community</span>
            <h1>Your Feed</h1>
            <p>Browse posts from your community.</p>
          </div>
          <div className="feed-controls">
            <button 
              className={`feed-toggle ${feedType === 'all' ? 'active' : ''}`}
              onClick={() => setFeedType('all')}
            >
              📱 All Posts
            </button>
            <button 
              className={`feed-toggle ${feedType === 'my' ? 'active' : ''}`}
              onClick={() => setFeedType('my')}
            >
              👤 My Posts
            </button>
            <span className="post-count">{filteredPosts?.length ?? 0} posts</span>
          </div>
        </header>

        {loading ? (
          <div className="message-state">
            <h2>Loading your feed...</h2>
            <p>Please wait while we fetch the latest posts.</p>
          </div>
        ) : error ? (
          <div className="message-state error-state">
            <h2>Unable to load feed</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="posts">
            {filteredPosts?.length > 0 ? (
              filteredPosts.map((post) => (
                <Post 
                  key={post._id} 
                  user={post.user} 
                  post={post} 
                  onFollowStatusChange={refreshFeed}
                  onPostDeleted={handlePostDeleted}
                />
              ))
            ) : (
              <div className="message-state empty-state">
                <h2>{feedType === 'all' ? 'No posts available' : 'No posts from you'}</h2>
                <p>{feedType === 'all' ? 'Try refreshing or creating the first post.' : 'Start creating and sharing your first post!'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default Feed
