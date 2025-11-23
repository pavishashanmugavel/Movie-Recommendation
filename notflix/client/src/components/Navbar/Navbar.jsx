import React, { useEffect, useRef, useState } from 'react'
import './Navbar.css'
import logo from '../../assets/logo1.png'
import search_icon from '../../assets/search_icon.svg'
import bell_icon from '../../assets/bell_icon.svg'
import profile_img from '../../assets/profile_img.png'
import caret_icon from '../../assets/caret_icon.svg'
import { logout } from '../../firebase'
import { useAppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

  const navRef = useRef();
  const navigate = useNavigate();
  const { 
    currentPage, 
    setCurrentPage, 
    searchQuery, 
    setSearchQuery, 
    handleSearch, 
    searchResults, 
    isSearching,
    notifications,
    addNotification,
    userProfile
  } = useAppContext();
  
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Helper: get a clean first name from a name or email
  const getFirstName = (input) => {
    if (!input) return 'User';
    let base = input;
    if (base.includes('@')) base = base.split('@')[0];
    // split by space, dot, underscore, hyphen and take first
    base = base.split(/[\s._-]+/)[0];
    // remove trailing digits (e.g., rithish53213 -> rithish)
    base = base.replace(/\d+$/g, '');
    if (!base) base = 'User';
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  const displayFirstName = getFirstName(userProfile?.name || userProfile?.email);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY >= 80) {
        navRef.current.classList.add('nav-dark');
      } else {
        navRef.current.classList.remove('nav-dark');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container') && !event.target.closest('.notifications-container') && !event.target.closest('.navbar-profile')) {
        setShowSearch(false);
        setShowNotifications(false);
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleNavClick = (page) => {
    setCurrentPage(page);
    addNotification(`Switched to ${page}`, 'info');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      setShowSearch(false);
    }
  };

  return (
    <div ref={navRef} className='navbar'>
      <div className="navbar-left">
        <img src={logo} alt="" onClick={() => handleNavClick('home')} style={{cursor: 'pointer'}} />
        <ul>
          <li 
            className={currentPage === 'home' ? 'active' : ''} 
            onClick={() => handleNavClick('home')}
          >
            Home
          </li>
          <li 
            className={currentPage === 'tv-shows' ? 'active' : ''} 
            onClick={() => handleNavClick('tv-shows')}
          >
            TV Shows
          </li>
          <li 
            className={currentPage === 'movies' ? 'active' : ''} 
            onClick={() => handleNavClick('movies')}
          >
            Movies
          </li>
          <li 
            className={currentPage === 'new-popular' ? 'active' : ''} 
            onClick={() => handleNavClick('new-popular')}
          >
            New & Popular
          </li>
          <li 
            className={currentPage === 'my-list' ? 'active' : ''} 
            onClick={() => handleNavClick('my-list')}
          >
            My List
          </li>
          <li 
            className={currentPage === 'browse-languages' ? 'active' : ''} 
            onClick={() => handleNavClick('browse-languages')}
          >
            Browse by Languages
          </li>
        </ul>
      </div>
      <div className="navbar-right">
        <div className="search-container">
          <img 
            src={search_icon} 
            alt="" 
            className='icons' 
            onClick={() => setShowSearch(!showSearch)}
            style={{cursor: 'pointer'}}
          />
          {showSearch && (
            <div className="search-dropdown">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search for movies, TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit">Search</button>
              </form>
              {isSearching && <div className="search-loading">Searching...</div>}
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.slice(0, 5).map((result) => (
                    <div key={result.id} className="search-result-item">
                      <img 
                        src={`https://image.tmdb.org/t/p/w92${result.poster_path || result.backdrop_path}`} 
                        alt={result.title || result.name} 
                      />
                      <span>{result.title || result.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="notifications-container">
          <img 
            src={bell_icon} 
            alt="" 
            className='icons' 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{cursor: 'pointer'}}
          />
          {showNotifications && (
            <div className="notifications-dropdown">
              <h3>Notifications</h3>
              {notifications.length === 0 ? (
                <p>No new notifications</p>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <span>{notification.message}</span>
                    <small>{notification.timestamp.toLocaleTimeString()}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="navbar-profile">
          <div 
            className='profile' 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{cursor: 'pointer'}}
          >
            {displayFirstName.charAt(0)}
          </div>
          <img 
            src={caret_icon} 
            alt="" 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{cursor: 'pointer'}}
          />
          {showProfileDropdown && (
            <div className="dropdown">
              <div className="profile-dropdown-header">
                <div className="dropdown-avatar">
                  {displayFirstName.charAt(0)}
                </div>
                <span className="profile-name">{displayFirstName}</span>
              </div>
              <div className="dropdown-divider"></div>
              <p onClick={() => {navigate('/profile'); setShowProfileDropdown(false);}}>
                Manage Profile
              </p>
              <p onClick={() => {navigate('/profile'); setShowProfileDropdown(false);}}>
                Viewing History
              </p>
              <div className="dropdown-divider"></div>
              <p onClick={()=>{logout()}}>Sign Out of Netflix</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar