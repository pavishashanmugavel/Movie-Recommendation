import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
  const { searchResults, isSearching, searchQuery, setSearchQuery } = useAppContext();

  const handleClose = () => {
    setSearchQuery('');
  };

  if (!searchQuery.trim()) {
    return null;
  }

  if (isSearching) {
    return (
      <div className="search-results-container">
        <div className="search-header">
          <h2>Searching...</h2>
          <button className="close-search" onClick={handleClose}>×</button>
        </div>
        <div className="search-loading">
          <div className="spinner"></div>
          <p>Searching for "{searchQuery}"...</p>
        </div>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="search-results-container">
        <div className="search-header">
          <h2>No Results</h2>
          <button className="close-search" onClick={handleClose}>×</button>
        </div>
        <div className="no-results">
          <p>No results found for "{searchQuery}"</p>
          <p>Try searching for something else</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-header">
        <h2>Search Results for "{searchQuery}"</h2>
        <button className="close-search" onClick={handleClose}>×</button>
      </div>
      <div className="search-results-grid">
        {searchResults.map((result) => (
          <Link 
            key={result.id} 
            to={`/player/${result.id}`} 
            className="search-result-card"
          >
            <img 
              src={`https://image.tmdb.org/t/p/w500${result.poster_path || result.backdrop_path}`} 
              alt={result.title || result.name} 
            />
            <div className="result-info">
              <h3>{result.title || result.name}</h3>
              <p className="result-type">{result.media_type || 'Unknown'}</p>
              <p className="result-overview">
                {result.overview ? 
                  (result.overview.length > 100 ? 
                    result.overview.substring(0, 100) + '...' : 
                    result.overview
                  ) : 
                  'No description available'
                }
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
