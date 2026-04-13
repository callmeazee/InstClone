import React, { useEffect, useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { usePost } from '../hook/usePost'
import { getSavedPosts } from '../../../services/saved.api'
import { getMyStats } from '../../../services/user.api'
import Post from '../components/Post'
import Nav from '../../shared/components/Nav'
import { getConsistentAvatar } from '../../../utils/avatars'
import { useSearchParams, useNavigate } from 'react-router-dom'
import '../style/profile.scss'

const Profile = () => {
  const { user, isInitialized } = useAuth()
  const navigate = useNavigate()
  const { feed, handleGetFeed, loading, error } = usePost()
  const [savedPosts, setSavedPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedError, setSavedError] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [userStats, setUserStats] = useState({ followers: 0, following: 0, posts: 0 })

  // Redirect to login if not authenticated (but wait for auth initialization)
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login')
    }
  }, [user, isInitialized, navigate])

  useEffect(() => {
    const tab = searchParams.get('tab') || 'posts'
    setActiveTab(tab)
  }, [searchParams])

  useEffect(() => {
    handleGetFeed()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  // Fetch saved posts when tab is switched
  useEffect(() => {
    if (activeTab === 'saved' && user) {
      fetchSavedPosts()
    }
  }, [activeTab, user])

  const fetchSavedPosts = async () => {
    try {
      setSavedLoading(true)
      const res = await getSavedPosts()
      setSavedPosts(res.saved || [])
      setSavedError(null)
    } catch (err) {
      console.error('Failed to fetch saved posts:', err)
      setSavedError('Failed to load saved posts')
    } finally {
      setSavedLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const res = await getMyStats()
      setUserStats({
        followers: res.followers || 0,
        following: res.following || 0,
        posts: res.posts || 0
      })
    } catch (err) {
      console.error('Failed to fetch user stats:', err)
    }
  }

  const avatar = user?.profileImage || getConsistentAvatar(user?.username || 'user')
  const userPosts = user ? feed.filter((post) => post.user?.username === user.username) : []
  const normalizedSavedPosts = savedPosts
    .map((savedItem) => {
      if (!savedItem?.post) {
        return null
      }

      return {
        ...savedItem.post,
        user: typeof savedItem.post.user === 'string' ? { username: savedItem.post.user } : savedItem.post.user,
        isSaved: true
      }
    })
    .filter(Boolean)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'saved' ? { tab: 'saved' } : {})
  }

  return (
    <main className='profile-page app-shell-page'>
      <Nav />
      <div className="profile">
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              <img src={avatar} alt="profile" />
            </div>
            <div className="profile-details">
              <div className="profile-identity">
                <div>
                  <span className="profile-kicker">Personal Space</span>
                  <h1>{user?.username}</h1>
                </div>
                <span className="profile-chip">{activeTab === 'saved' ? 'Saved view' : 'Posts view'}</span>
              </div>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{userStats.posts}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{userStats.followers}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{userStats.following}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => handleTabChange('posts')}
          >
            <span role="img" aria-label="posts">📷</span> Posts
          </button>
          <button 
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => handleTabChange('saved')}
          >
            <span role="img" aria-label="saved">🔖</span> Saved
          </button>
        </div>

        {activeTab === 'posts' && (
          <div className="posts-section">
            <header className="section-header">
              <h2>My Posts</h2>
              <p>{userPosts.length} posts</p>
            </header>

            {loading ? (
              <div className="message-state">
                <h2>Loading posts...</h2>
                <p>Please wait while we fetch your posts.</p>
              </div>
            ) : error ? (
              <div className="message-state error-state">
                <h2>Unable to load posts</h2>
                <p>{error}</p>
              </div>
            ) : (
              <div className="profile-post-grid">
                {userPosts?.length > 0 ? (
                  userPosts.map((post) => (
                    <article key={post._id} className="profile-post-card">
                      <img src={post.imgUrl} alt={post.caption || `${user?.username} post`} />
                      <div className="profile-post-card__overlay">
                        <span>{post.likes?.length || 0} likes</span>
                        <p>{post.caption || 'Untitled post'}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="message-state empty-state">
                    <h2>No posts yet</h2>
                    <p>You haven't created any posts. Start creating and sharing!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Saved Section */}
        {activeTab === 'saved' && (
          <div className="saved-section">
            <header className="section-header">
              <h2>Saved Posts</h2>
              <p>{normalizedSavedPosts.length} saved</p>
            </header>

            {savedLoading ? (
              <div className="message-state">
                <h2>Loading saved posts...</h2>
                <p>Please wait while we fetch your saved posts.</p>
              </div>
            ) : savedError ? (
              <div className="message-state error-state">
                <h2>Unable to load saved posts</h2>
                <p>{savedError}</p>
              </div>
            ) : (
              <div className="saved-posts-list">
                {normalizedSavedPosts.length > 0 ? (
                  normalizedSavedPosts.map((savedPost) => (
                    <Post 
                      key={savedPost._id}
                      user={savedPost.user}
                      post={savedPost}
                      onSaveToggle={fetchSavedPosts}
                    />
                  ))
                ) : (
                  <div className="message-state empty-state">
                    <h2>No saved posts yet</h2>
                    <p>Save posts that you want to view later!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default Profile
