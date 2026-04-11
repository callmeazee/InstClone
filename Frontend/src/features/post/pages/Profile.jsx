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
  const { user } = useAuth()
  const navigate = useNavigate()
  const { feed, handleGetFeed, loading, error } = usePost()
  const [userPosts, setUserPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedError, setSavedError] = useState(null)
  const [searchParams] = useSearchParams()
  const [userStats, setUserStats] = useState({ followers: 0, following: 0, posts: 0 })
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    const tab = searchParams.get('tab') || 'posts'
    setActiveTab(tab)
  }, [searchParams])

  useEffect(() => {
    handleGetFeed()
  }, [])

  useEffect(() => {
    if (feed && user) {
      // Filter posts by current user
      const posts = feed.filter(post => post.user?.username === user.username)
      setUserPosts(posts)
    }
  }, [feed, user])

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user, statsRefreshKey])

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

  // Function to refresh stats (called after follow/unfollow actions)
  const refreshStats = () => {
    setStatsRefreshKey(prev => prev + 1)
  }

  const avatar = user?.profileImage || getConsistentAvatar(user?.username || 'user')

  return (
    <main className='profile-page'>
      <Nav />
      <div className="profile">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              <img src={avatar} alt="profile" />
            </div>
            <div className="profile-details">
              <h1>{user?.username}</h1>
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

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <span role="img" aria-label="posts">📷</span> Posts
          </button>
          <button 
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <span role="img" aria-label="saved">🔖</span> Saved
          </button>
        </div>

        {/* Posts Section */}
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
              <div className="posts">
                {userPosts?.length > 0 ? (
                  userPosts.map((post) => (
                    <Post key={post._id} user={post.user} post={post} />
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
              <p>{savedPosts.length} saved</p>
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
              <div className="posts">
                {savedPosts?.length > 0 ? (
                  savedPosts.map((savedItem) => (
                    <Post 
                      key={savedItem._id} 
                      user={savedItem.post?.user} 
                      post={savedItem.post}
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
