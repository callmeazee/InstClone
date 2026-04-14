import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, searchPosts } from '../../services/search.api';
import { getConsistentAvatar } from '../../utils/avatars';
import { followUser, unfollowUser } from '../../services/user.api';
import './search.scss';

const Search = () => {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('accounts');
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setUsers([]);
            setPosts([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [userData, postData] = await Promise.all([
                searchUsers(searchQuery),
                searchPosts(searchQuery)
            ]);
            setUsers(userData.users || []);
            setPosts(postData.posts || []);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Failed to fetch results. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(query);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query, handleSearch]);

    const handleFollowToggle = async (username, currentStatus) => {
        try {
            if (currentStatus === 'accepted') {
                await unfollowUser(username);
                setUsers(prev => prev.map(u => u.username === username ? { ...u, followStatus: null } : u));
            } else if (currentStatus === null) {
                await followUser(username);
                setUsers(prev => prev.map(u => u.username === username ? { ...u, followStatus: 'pending' } : u));
            }
        } catch (err) {
            console.error('Follow toggle failed:', err);
        }
    };

    return (
        <div className="search-page">
            <header className="search-header">
                <div className="search-input-wrapper">
                    <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search for users or posts..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input"
                    />
                    {loading && <div className="search-loader"></div>}
                </div>
            </header>

            <nav className="search-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accounts')}
                >
                    Accounts
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Explore
                </button>
            </nav>

            <main className="search-results">
                {error && <div className="search-error">{error}</div>}
                
                {!loading && query && users.length === 0 && posts.length === 0 && (
                    <div className="no-results">No results found for "{query}"</div>
                )}

                {activeTab === 'accounts' && (
                    <div className="users-list">
                        {users.map(user => (
                            <div key={user.username} className="user-card">
                                <div className="user-info" onClick={() => navigate(`/profile/${user.username}`)}>
                                    <img 
                                        src={user.profileImage || getConsistentAvatar(user.username)} 
                                        alt={user.username} 
                                        className="user-avatar"
                                    />
                                    <div className="user-details">
                                        <p className="username">{user.username}</p>
                                        {user.bio && <p className="bio">{user.bio}</p>}
                                    </div>
                                </div>
                                <button 
                                    className={`follow-btn ${user.followStatus === 'accepted' ? 'following' : user.followStatus === 'pending' ? 'pending' : ''}`}
                                    onClick={() => handleFollowToggle(user.username, user.followStatus)}
                                    disabled={user.followStatus === 'pending'}
                                >
                                    {user.followStatus === 'accepted' ? 'Following' : user.followStatus === 'pending' ? 'Pending' : 'Follow'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="posts-grid">
                        {posts.map(post => (
                            <div 
                                key={post._id} 
                                className="grid-item"
                                onClick={() => navigate(`/feed`)} // In a real app, this might open a post modal or detail page
                            >
                                <img src={post.imgUrl} alt={post.caption} className="post-thumb" />
                                <div className="overlay">
                                    <div className="stat">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z" />
                                        </svg>
                                        <span>{post.likes?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Search;
