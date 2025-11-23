import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/api';
import { auth } from '../firebase';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [myList, setMyList] = useState([]);
  const [userProfile, setUserProfile] = useState({
    userId: 'guest',
    name: 'User',
    email: '',
    joinDate: new Date().toISOString().split('T')[0]
  });
  const [viewingHistory, setViewingHistory] = useState([]);

  // Helper to normalize first name from a name or email
  const getFirstName = (input) => {
    if (!input) return 'User';
    let base = input;
    if (base.includes('@')) base = base.split('@')[0];
    base = base.split(/[\s._-]+/)[0];
    base = base.replace(/\d+$/g, '');
    if (!base) base = 'User';
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  // Load user profile from auth shim
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user);
      if (user) {
        const userId = user.uid;
        const derivedName = getFirstName(user.displayName || user.email);
        
        // Load user-specific data
        const savedProfile = localStorage.getItem(`userProfile_${userId}`);
        const savedList = localStorage.getItem(`myList_${userId}`);
        const savedHistory = localStorage.getItem(`viewingHistory_${userId}`);
        
        const newProfile = savedProfile ? JSON.parse(savedProfile) : {
          userId,
          name: derivedName,
          email: user.email || '',
          joinDate: user.metadata?.creationTime
            ? new Date(user.metadata.creationTime).toLocaleDateString()
            : new Date().toLocaleDateString()
        };
        
        console.log('Loading user data for:', userId, newProfile);
        setUserProfile(newProfile);
        localStorage.setItem(`userProfile_${userId}`, JSON.stringify(newProfile));
        
        // Load user-specific lists and history
        setMyList(savedList ? JSON.parse(savedList) : []);
        setViewingHistory(savedHistory ? JSON.parse(savedHistory) : []);
        
        console.log('User data loaded:', {
          myList: savedList ? JSON.parse(savedList).length : 0,
          viewingHistory: savedHistory ? JSON.parse(savedHistory).length : 0
        });
      } else {
        // No user - reset to guest state
        console.log('No user, resetting to guest state');
        setUserProfile({
          userId: 'guest',
          name: 'User',
          email: '',
          joinDate: new Date().toISOString().split('T')[0]
        });
        setMyList([]);
        setViewingHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load hero content (featured movie/show) - only once
  useEffect(() => {
    let mounted = true;
    const loadHeroContent = async () => {
      try {
        const data = await apiService.getTrending('movie', 'day', 1);
        if (mounted && data.results && data.results.length > 0) {
          setHeroContent(data.results[0]);
        }
      } catch (error) {
        console.error('Error loading hero content:', error);
      }
    };
    loadHeroContent();
    return () => { mounted = false; };
  }, []);

  // Search functionality with debounce
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await apiService.search(query);
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Add to My List
  const addToMyList = useCallback((item) => {
    const userId = userProfile?.userId || 'guest';
    setMyList(prev => {
      const exists = prev.find(existing => existing.id === item.id);
      if (!exists) {
        const newList = [...prev, item];
        try {
          localStorage.setItem(`myList_${userId}`, JSON.stringify(newList));
        } catch (error) {
          console.error('Error saving My List to localStorage (possibly quota exceeded):', error);
        }
        return newList;
      }
      return prev;
    });
  }, [userProfile]);

  // Remove from My List
  const removeFromMyList = useCallback((itemId) => {
    const userId = userProfile?.userId || 'guest';
    setMyList(prev => {
      const newList = prev.filter(item => item.id !== itemId);
      try {
        localStorage.setItem(`myList_${userId}`, JSON.stringify(newList));
      } catch (error) {
        console.error('Error saving My List to localStorage (possibly quota exceeded):', error);
      }
      return newList;
    });
  }, [userProfile]);

  // Check if item is in My List
  const isInMyList = useCallback((itemId) => {
    return myList.some(item => item.id === itemId);
  }, [myList]);

  // Add notification
  const addNotification = useCallback((message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    // Enhanced logging for notifications
    const typeEmoji = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    console.log(`${typeEmoji[type] || '🔔'} NOTIFICATION [${type.toUpperCase()}]:`, message);
    
    setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep only last 5
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Add to viewing history
  const addToViewingHistory = useCallback((item) => {
    const userId = userProfile?.userId || 'guest';
    const historyItem = {
      ...item,
      watchedAt: new Date().toISOString(),
      id: item.id,
      completionRate: 0 // Will be updated as user watches
    };
    
    setViewingHistory(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter(existing => existing.id !== item.id);
      // Add to beginning of array (most recent first)
      const newHistory = [historyItem, ...filtered].slice(0, 50); // Keep only last 50 items
      try {
        localStorage.setItem(`viewingHistory_${userId}`, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error saving viewing history to localStorage (possibly quota exceeded):', error);
      }
      
      // Track watch event
      trackWatchEvent(historyItem, userId);
      
      // Update Top Picks based on new watch
      updateTopPicks(newHistory, userId);
      
      return newHistory;
    });
  }, [userProfile]);
  
  // Track watch event (for analytics)
  const trackWatchEvent = useCallback((item, userId) => {
    try {
      const watchData = {
        contentId: item.id,
        contentType: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
        completionRate: item.completionRate || 0,
        duration: item.runtime || item.episode_run_time?.[0] || 0,
        watchedAt: new Date().toISOString(),
        contentDetails: item
      };
      
      // Save to watch history log (per user)
      const watchLog = JSON.parse(localStorage.getItem(`watchLog_${userId}`) || '[]');
      watchLog.unshift(watchData);
      try {
        localStorage.setItem(`watchLog_${userId}`, JSON.stringify(watchLog.slice(0, 100)));
      } catch (error) {
        console.error('Error saving watch log to localStorage (possibly quota exceeded):', error);
      }
      
      console.log('✅ Watch tracked for user:', userId, watchData);
    } catch (error) {
      console.error('Error tracking watch:', error);
    }
  }, []);
  
  // Update Top Picks based on watch history
  const updateTopPicks = useCallback((history, userId) => {
    try {
      // Extract user preferences
      const preferences = analyzePreferences(history);
      
      // Save preferences (per user)
      try {
        localStorage.setItem(`userPreferences_${userId}`, JSON.stringify(preferences));
      } catch (error) {
        console.error('Error saving user preferences to localStorage (possibly quota exceeded):', error);
      }
      
      console.log('📊 User Preferences Updated for', userId, ':', preferences);
    } catch (error) {
      console.error('Error updating top picks:', error);
    }
  }, []);
  
  // Analyze user preferences from history
  const analyzePreferences = (history) => {
    const genreCounts = {};
    const actorCounts = {};
    const directorCounts = {};
    const languageCounts = {};
    const completionRates = [];
    
    history.forEach(item => {
      // Genre analysis
      (item.genres || []).forEach(genre => {
        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
      });
      
      // Actor analysis
      if (item.credits?.cast) {
        item.credits.cast.slice(0, 3).forEach(actor => {
          actorCounts[actor.name] = (actorCounts[actor.name] || 0) + 1;
        });
      }
      
      // Director analysis
      if (item.credits?.crew) {
        item.credits.crew
          .filter(person => person.job === 'Director')
          .forEach(director => {
            directorCounts[director.name] = (directorCounts[director.name] || 0) + 1;
          });
      }
      
      // Language analysis
      if (item.original_language) {
        languageCounts[item.original_language] = (languageCounts[item.original_language] || 0) + 1;
      }
      
      // Completion rate
      if (item.completionRate !== undefined) {
        completionRates.push(item.completionRate);
      }
    });
    
    // Get top preferences
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    const topActors = Object.entries(actorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    const topDirectors = Object.entries(directorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([code, count]) => ({ code, count }));
    
    const avgCompletionRate = completionRates.length > 0
      ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
      : 0;
    
    return {
      topGenres,
      topActors,
      topDirectors,
      topLanguages,
      avgCompletionRate,
      totalWatched: history.length
    };
  };

  // Clear viewing history
  const clearViewingHistory = useCallback(() => {
    const userId = userProfile?.userId || 'guest';
    setViewingHistory([]);
    localStorage.removeItem(`viewingHistory_${userId}`);
  }, [userProfile]);

  // Update user profile
  const updateUserProfile = useCallback((updates) => {
    const userId = userProfile?.userId || 'guest';
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(newProfile));
  }, [userProfile]);

  const value = useMemo(() => ({
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    notifications,
    heroContent,
    myList,
    userProfile,
    viewingHistory,
    handleSearch,
    addToMyList,
    removeFromMyList,
    isInMyList,
    addNotification,
    removeNotification,
    addToViewingHistory,
    clearViewingHistory,
    updateUserProfile
  }), [
    currentPage,
    searchQuery,
    searchResults,
    isSearching,
    notifications,
    heroContent,
    myList,
    userProfile,
    viewingHistory,
    handleSearch,
    addToMyList,
    removeFromMyList,
    isInMyList,
    addNotification,
    removeNotification,
    addToViewingHistory,
    clearViewingHistory,
    updateUserProfile
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};