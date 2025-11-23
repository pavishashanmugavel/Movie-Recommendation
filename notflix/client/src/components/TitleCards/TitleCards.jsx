import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import './TitleCards.css'
// cards_data import removed - using API data instead
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { apiService } from '../../services/api';

// Helper function to fetch rating data for a content item
const fetchRatingData = async (contentId) => {
  try {
    // Check localStorage for rating data
    const cached = localStorage.getItem(`rating_${contentId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Return default values if no rating data exists
    return {
      averageRating: 0,
      totalRatings: 0
    };
  } catch (error) {
    console.error('Error fetching rating data for', contentId, error);
    return {
      averageRating: 0,
      totalRatings: 0
    };
  }
};

// Helper function to sort content by rating and review count
const sortContentByPopularity = async (contentArray) => {
  // Create array with content and their rating data
  const contentWithRatings = [];
  let hasRatings = false;
  
  // Fetch rating data for all content items
  for (const item of contentArray) {
    const ratingData = await fetchRatingData(item.id);
    if (ratingData.totalRatings > 0) {
      hasRatings = true;
    }
    contentWithRatings.push({
      ...item,
      averageRating: ratingData.averageRating,
      totalRatings: ratingData.totalRatings
    });
  }
  
  // If no items have ratings, return original array
  if (!hasRatings) {
    console.log('No ratings found, returning original order');
    return contentArray;
  }
  
  // Sort by a combination of average rating and total ratings
  // Items with higher ratings and more reviews come first
  // Items with no ratings come last
  const sorted = contentWithRatings.sort((a, b) => {
    // If both have ratings, sort by weighted score
    if (a.totalRatings > 0 && b.totalRatings > 0) {
      // Weighted score: higher average rating + more ratings = higher score
      const scoreA = (a.averageRating * 10) + (a.totalRatings * 0.1);
      const scoreB = (b.averageRating * 10) + (b.totalRatings * 0.1);
      return scoreB - scoreA; // Higher scores first
    }
    
    // If only A has ratings, A comes first
    if (a.totalRatings > 0 && b.totalRatings === 0) {
      return -1;
    }
    
    // If only B has ratings, B comes first
    if (a.totalRatings === 0 && b.totalRatings > 0) {
      return 1;
    }
    
    // If neither has ratings, maintain original order
    return 0;
  });
  
  // Debug logging
  console.log('Sorted content by popularity:', sorted.map(item => ({
    title: item.title || item.name,
    averageRating: item.averageRating,
    totalRatings: item.totalRatings
  })));
  
  return sorted;
};

const TitleCards = ({title, category, type = 'movie', language, timeWindow = 'week'}) => {

  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const cardsRef = useRef();
  const { myList, addToMyList, removeFromMyList, isInMyList, addNotification } = useAppContext();
  const hoverTimerRef = useRef(null);
  const [preview, setPreview] = useState({ id: null, key: null, mtype: 'movie' });
  const loadedRef = useRef(false);

  // Memoize category key to prevent unnecessary reloads
  const cacheKey = useMemo(() => `${category}-${type}-${language || ''}-${timeWindow}`, [category, type, language, timeWindow]);

  // API options moved to api service



const handlewheel = useCallback((event)=>{
  event.preventDefault();
  if (cardsRef.current) {
    cardsRef.current.scrollLeft += event.deltaY;
  }
}, []);

useEffect(()=>{
  // Reset loadedRef when cacheKey changes to allow reloading
  loadedRef.current = false;
  
  const loadData = async () => {
    if (loading) return; // Prevent concurrent loads
    
    try {
      setLoading(true);
      let data;
      
      if (category === 'my_list') {
        setApiData(myList);
        setLoading(false);
        loadedRef.current = true;
        return;
      }
      
      if (category === 'language' && language) {
        // Fetch movies by language
        try {
          data = await apiService.discoverMovies({ 
            withOriginalLanguage: language,
            sortBy: 'popularity.desc'
          });
        } catch (error) {
          console.error(`Error fetching movies for language ${language}:`, error);
          // Fallback to popular movies if language filtering fails
          data = await apiService.getMovies('popular');
        }
      } else if (category === 'trending') {
        data = await apiService.getTrending(type, timeWindow);
      } else if (type === 'tv') {
        data = await apiService.getTVShows(category);
      } else {
        data = await apiService.getMovies(category);
      }
      
      if (data && data.results) {
        let sortedData = data.results;
        
        // For "Popular on Netflix" section, sort by ratings and reviews
        if (title === "Popular on Netflix" || category === "popular") {
          sortedData = await sortContentByPopularity(data.results);
        }
        
        setApiData(sortedData);
        loadedRef.current = true;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
  
  const currentRef = cardsRef.current;
  if (currentRef) {
    currentRef.addEventListener('wheel', handlewheel, { passive: false });
  }
  
  return () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (currentRef) {
      currentRef.removeEventListener('wheel', handlewheel);
    }
  };
},[cacheKey, myList, handlewheel])

  const beginHoverPreview = useCallback((item) => {
    // Disable hover preview to improve performance
    // Users can still click to watch the trailer
    return;
  }, []);

  const endHoverPreview = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setPreview({ id: null, key: null, mtype: 'movie' });
  }, []);

  const handleAddToList = useCallback((e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInMyList(item.id)) {
      removeFromMyList(item.id);
      addNotification(`Removed ${item.title || item.name} from My List`, 'info');
    } else {
      addToMyList(item);
      addNotification(`Added ${item.title || item.name} to My List`, 'success');
    }
  }, [isInMyList, removeFromMyList, addToMyList, addNotification]);

  return (
    <div className='tile-cards'>
      <h2>{title ? title : "Popular on Netflix"}</h2>
      {loading && <div className="loading-indicator">Loading...</div>}
      <div className="card-list" ref={cardsRef}>
        {apiData.map((card, index)=>{
          const isInList = isInMyList(card.id);
          // Create a URL-friendly ID for local content
          const cardId = card.id || card.name?.toLowerCase().replace(/\s+/g, '');
          // Determine media type for proper player route
          let mtype = type;
          if (type === 'all') {
            mtype = card.media_type || (card.first_air_date ? 'tv' : 'movie');
          }
          const linkPath = card.id ? `/player/${card.id}${mtype ? `?type=${mtype}` : ''}` : `/player/${cardId}`;
          
          return (
            <Link
              to={linkPath}
              className="card"
              key={card.id || index}
            >
              <img 
                src={`https://image.tmdb.org/t/p/w500${card.backdrop_path || card.poster_path}`} 
                alt="" 
                loading="lazy"
              />
              <p>{card.original_title || card.name}</p>
              <button 
                className={`add-to-list-btn ${isInList ? 'in-list' : ''}`}
                onClick={(e) => handleAddToList(e, card)}
                title={isInMyList ? 'Remove from My List' : 'Add to My List'}
              >
                {isInList ? '✓' : '+'}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  )
}

export default TitleCards