import React, { useState, useMemo } from 'react'
import './Profile.css'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'
import back_arrow_icon from '../../assets/back_arrow_icon.png'

const Profile = () => {
  const { 
    userProfile, 
    updateUserProfile, 
    viewingHistory, 
    clearViewingHistory,
    addNotification,
    myList
  } = useAppContext();
  
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, history, settings
  const [editForm, setEditForm] = useState({
    name: userProfile.name
  });


  const handleSave = () => {
    if (!editForm.name.trim()) {
      addNotification('Name cannot be empty', 'error');
      return;
    }
    updateUserProfile(editForm);
    setIsEditing(false);
    addNotification('Profile updated successfully', 'success');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire viewing history? This cannot be undone.')) {
      clearViewingHistory();
      addNotification('Viewing history cleared', 'info');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const uniqueMovies = new Set(viewingHistory.map(item => item.id)).size;
    const genreCounts = {};
    
    viewingHistory.forEach(item => {
      (item.genres || []).forEach(genre => {
        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
      });
    });
    
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
    
    const totalMinutes = viewingHistory.reduce((acc, item) => {
      return acc + (item.runtime || item.episode_run_time?.[0] || 0);
    }, 0);
    
    return {
      totalWatched: viewingHistory.length,
      uniqueMovies,
      topGenres,
      totalHours: Math.floor(totalMinutes / 60),
      myListCount: myList.length
    };
  }, [viewingHistory, myList]);

  return (
    <div className='profile-page'>
      <div className="profile-header">
        <img 
          src={back_arrow_icon} 
          alt="Back" 
          className="back-btn"
          onClick={() => navigate(-1)}
        />
        <h1>Account</h1>
      </div>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-main">
            <div className="profile-avatar-section">
              <div className="profile-avatar-circle">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            
            <div className="profile-info">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="Enter your name"
                      className="profile-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="text"
                      value={userProfile.email || 'No email set'}
                      disabled
                      className="profile-input disabled"
                    />
                  </div>
                  <div className="edit-buttons">
                    <button onClick={handleSave} className="btn-primary">Save</button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="profile-name">{userProfile.name}</h2>
                  <p className="profile-email">{userProfile.email || 'No email set'}</p>
                  <p className="profile-member-since">Member since {formatDate(userProfile.joinDate)}</p>
                  <button onClick={() => setIsEditing(true)} className="btn-edit">
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">🎬</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalWatched}</div>
                <div className="stat-label">Total Watched</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-value">{stats.myListCount}</div>
                <div className="stat-label">My List</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalHours}h</div>
                <div className="stat-label">Watch Time</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎭</div>
              <div className="stat-content">
                <div className="stat-value">{stats.topGenres[0] || 'N/A'}</div>
                <div className="stat-label">Top Genre</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Viewing Activity
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="overview-section">
              <h3>Your Favorite Genres</h3>
              <div className="genre-tags">
                {stats.topGenres.length > 0 ? (
                  stats.topGenres.map((genre, idx) => (
                    <span key={idx} className="genre-tag">{genre}</span>
                  ))
                ) : (
                  <p className="empty-text">Watch more content to see your favorite genres</p>
                )}
              </div>
            </div>

            <div className="overview-section">
              <h3>Recently Watched</h3>
              {viewingHistory.length > 0 ? (
                <div className="recent-grid">
                  {viewingHistory.slice(0, 6).map((item, index) => (
                    <Link 
                      key={`${item.id}-${index}`}
                      to={`/player/${item.id}`}
                      className="recent-card"
                    >
                      <div className="recent-poster">
                        <img 
                          src={`https://image.tmdb.org/t/p/w300${item.poster_path || item.backdrop_path}`} 
                          alt={item.title || item.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x450/333/fff?text=No+Image';
                          }}
                        />
                        <div className="recent-overlay">
                          <div className="play-icon">▶</div>
                        </div>
                      </div>
                      <p className="recent-title">{item.title || item.name}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No viewing history yet. Start watching to see your history here!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="tab-content">
            <div className="history-header">
              <h3>Viewing Activity</h3>
              {viewingHistory.length > 0 && (
                <button onClick={handleClearHistory} className="btn-clear-history">
                  Clear All
                </button>
              )}
            </div>
            
            {viewingHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📺</div>
                <p>No viewing history yet</p>
                <span>Start watching to build your viewing history</span>
              </div>
            ) : (
              <div className="history-list">
                {viewingHistory.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="history-item">
                    <div className="history-poster">
                      <img 
                        src={`https://image.tmdb.org/t/p/w300${item.backdrop_path || item.poster_path}`} 
                        alt={item.title || item.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x170/333/fff?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="history-details">
                      <h4 className="history-title">{item.title || item.name}</h4>
                      <div className="history-meta">
                        <span className="history-date">{formatDateTime(item.watchedAt)}</span>
                        {item.vote_average && (
                          <span className="history-rating">⭐ {item.vote_average.toFixed(1)}</span>
                        )}
                        {item.runtime && (
                          <span className="history-runtime">{item.runtime} min</span>
                        )}
                      </div>
                      {item.overview && (
                        <p className="history-overview">{item.overview.slice(0, 200)}...</p>
                      )}
                      <div className="history-genres">
                        {(item.genres || []).slice(0, 3).map((genre, idx) => (
                          <span key={idx} className="history-genre">{genre.name}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      className="btn-watch-again"
                      onClick={() => navigate(`/player/${item.id}`)}
                    >
                      ▶ Watch Again
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="settings-section">
              <h3>Account Settings</h3>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Email</h4>
                    <p>{userProfile.email || 'No email set'}</p>
                  </div>
                  <button className="btn-setting" disabled>Change</button>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Password</h4>
                    <p>••••••••</p>
                  </div>
                  <button className="btn-setting" disabled>Change</button>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Language</h4>
                    <p>English</p>
                  </div>
                  <button className="btn-setting" disabled>Change</button>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Preferences</h3>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Autoplay next episode</h4>
                    <p>Automatically play the next episode</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Autoplay previews</h4>
                    <p>Autoplay previews while browsing</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-section danger-zone">
              <h3>Danger Zone</h3>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Clear Viewing History</h4>
                    <p>Remove all items from your viewing history</p>
                  </div>
                  <button className="btn-danger" onClick={handleClearHistory}>
                    Clear History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile