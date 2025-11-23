import React, { useEffect, useState } from 'react'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar'
import hero_banner from '../../assets/hero_banner.jpg'
import hero_title from '../../assets/hero_title.png'
import play_icon from '../../assets/play_icon.png'
import info_icon from '../../assets/info_icon.png'
import TitleCards from '../../components/TitleCards/TitleCards'
import Footer from '../../components/Footer/Footer'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import SearchResults from '../../components/SearchResults/SearchResults'
import { useNavigate, Link } from 'react-router-dom'
import cards_data from '../../assets/cards/Cards_data'
import Recommendations from '../../components/Recommendations/Recommendations'
import AIChatbot from '../../components/AIChatbot/AIChatbot'


// Local Content Section Component
const LocalContentSection = () => {
  return (
    <div className='tile-cards'>
      <h2>Local Content</h2>
      <div className="card-list">
        {cards_data.map((card, index) => {
          const cardId = card.name.toLowerCase().replace(/\s+/g, '');
          return (
            <Link to={`/player/${cardId}`} className="card" key={index}>
              <img src={card.image} alt={card.name} />
              <p>{card.name}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const Home = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    heroContent, 
    addNotification,
    viewingHistory
  } = useAppContext();
  const navigate = useNavigate();
  const [content, setContent] = useState({
    movies: [],
    tvShows: [],
    trending: [],
    myList: []
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        switch (currentPage) {
          case 'tv-shows':
            const tvData = await apiService.getTVShows('popular');
            setContent(prev => ({ ...prev, tvShows: tvData.results || [] }));
            break;
          case 'movies':
            const moviesData = await apiService.getMovies('popular');
            setContent(prev => ({ ...prev, movies: moviesData.results || [] }));
            break;
          case 'new-popular':
            const trendingData = await apiService.getTrending('all', 'week');
            setContent(prev => ({ ...prev, trending: trendingData.results || [] }));
            break;
          case 'my-list':
            // My List is handled by context
            break;
          case 'browse-languages':
            // For browse languages, we don't need to load specific content here
            // The TitleCards components will handle language-specific loading
            break;
          default:
            // Home page - load default content
            const homeMovies = await apiService.getMovies('now_playing');
            setContent(prev => ({ ...prev, movies: homeMovies.results || [] }));
        }
      } catch (error) {
        console.error('Error loading content:', error);
        addNotification('Error loading content', 'error');
      }
    };

    loadContent();
  }, [currentPage, addNotification]);

  const handlePlay = () => {
    if (heroContent) {
      // Navigate to player with the content ID
      const contentType = heroContent.media_type || 'movie';
      const contentId = heroContent.id;
      navigate(`/player/${contentId}?type=${contentType}`);
    }
  };

  const handleMoreInfo = () => {
    if (heroContent) {
      // Show detailed info modal
      setShowDetailsModal(true);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'tv-shows':
        return (
          <div className="more-cards">
            <TitleCards title="Popular TV Shows" category="popular" type="tv" />
            <TitleCards title="Top Rated TV Shows" category="top_rated" type="tv" />
            <TitleCards title="On The Air" category="on_the_air" type="tv" />
            <TitleCards title="Airing Today" category="airing_today" type="tv" />
            <TitleCards title="Trending TV Shows" category="trending" type="tv" />
          </div>
        );
      case 'movies':
        return (
          <div className="more-cards">
            <TitleCards title="Popular Movies" category="popular" type="movie" />
            <TitleCards title="Top Rated Movies" category="top_rated" type="movie" />
            <TitleCards title="Upcoming Movies" category="upcoming" type="movie" />
            <TitleCards title="Now Playing" category="now_playing" type="movie" />
            <TitleCards title="Trending Movies" category="trending" type="movie" timeWindow="week" />
          </div>
        );
      case 'new-popular':
        return (
          <div className="more-cards">
            <TitleCards title="Trending This Week" category="trending" type="all" timeWindow="week" />
            <TitleCards title="Trending Movies" category="trending" type="movie" timeWindow="week" />
            <TitleCards title="Trending TV Shows" category="trending" type="tv" timeWindow="week" />
            <TitleCards title="New Releases" category="now_playing" type="movie" />
            <TitleCards title="Popular Movies" category="popular" type="movie" />
            <TitleCards title="Popular TV Shows" category="popular" type="tv" />
            <TitleCards title="Top Rated Movies" category="top_rated" type="movie" />
            <TitleCards title="Top Rated TV Shows" category="top_rated" type="tv" />
          </div>
        );
      case 'my-list':
        return (
          <div className="more-cards">
            <TitleCards title="My List" category="my_list" />
          </div>
        );
      case 'browse-languages':
        return (
          <div className="more-cards">
            <TitleCards title="English Movies" category="language" language="en" type="movie" />
            <TitleCards title="Spanish Movies" category="language" language="es" type="movie" />
            <TitleCards title="Japanese Movies" category="language" language="ja" type="movie" />
            <TitleCards title="Korean Movies" category="language" language="ko" type="movie" />
            <TitleCards title="French Movies" category="language" language="fr" type="movie" />
            <TitleCards title="Hindi Movies" category="language" language="hi" type="movie" />
            <TitleCards title="Chinese Movies" category="language" language="zh" type="movie" />
            <TitleCards title="German Movies" category="language" language="de" type="movie" />
          </div>
        );
      default:
        return (
          <div className="more-cards">
            <TitleCards title="Blockbuster Movies" category="top_rated" />
            <TitleCards title="Only on Netflix" category="popular" />
            <TitleCards title="Upcoming" category="upcoming" />
            <TitleCards title="Top picks for you" category="now_playing" />
            <Recommendations />
            <LocalContentSection />
          </div>
        );
    }
  };

  return (
    <div className='home'>
      <Navbar />
      <SearchResults />
      {currentPage === 'home' && (
        <div className="hero-container">
          <div className="hero">
            <img 
              src={heroContent?.backdrop_path ? `https://image.tmdb.org/t/p/original${heroContent.backdrop_path}` : hero_banner} 
              alt="" 
              className='banner-img'
            />
            <div className="hero-caption">
              <img src={hero_title} alt="" className='caption-img'/>
              <p>{heroContent?.overview || "Discovering his ties to a secret ancient order, a young man living in modern Istanbul embarks on a quest to save the city from an immortal enemy."}</p>
              <div className="hero-btns">
                <button className='btn' onClick={handlePlay}>
                  <img src={play_icon} alt="" />Play
                </button>
                <button className='btn dark-btn' onClick={handleMoreInfo}>
                  <img src={info_icon} alt="" />More Info
                </button>
              </div>
              <TitleCards/>
            </div>
          </div>
        </div>
      )}
      {currentPage !== 'home' && (
        <div className="hero">
          <img 
            src={heroContent?.backdrop_path ? `https://image.tmdb.org/t/p/original${heroContent.backdrop_path}` : hero_banner} 
            alt="" 
            className='banner-img'
          />
          <div className="hero-caption">
            <img src={hero_title} alt="" className='caption-img'/>
            <p>{heroContent?.overview || "Discovering his ties to a secret ancient order, a young man living in modern Istanbul embarks on a quest to save the city from an immortal enemy."}</p>
            <div className="hero-btns">
              <button className='btn' onClick={handlePlay}>
                <img src={play_icon} alt="" />Play
              </button>
              <button className='btn dark-btn' onClick={handleMoreInfo}>
                <img src={info_icon} alt="" />More Info
              </button>
            </div>
          </div>
        </div>
      )}
      {renderContent()}
      <Footer/>
      
      {/* AI Chatbot Assistant */}
      <AIChatbot />
      
      
      {/* Details Modal */}
      {showDetailsModal && heroContent && (
        <div className="details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{heroContent.title || heroContent.name}</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="modal-poster">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${heroContent.poster_path || heroContent.backdrop_path}`} 
                  alt={heroContent.title || heroContent.name}
                />
              </div>
              <div className="modal-info">
                <div className="modal-meta">
                  <span className="rating">⭐ {heroContent.vote_average?.toFixed(1) || 'N/A'}</span>
                  <span className="year">
                    {heroContent.release_date?.slice(0, 4) || heroContent.first_air_date?.slice(0, 4) || 'N/A'}
                  </span>
                  <span className="runtime">
                    {heroContent.runtime ? `${heroContent.runtime} min` : 
                     heroContent.episode_run_time ? `${heroContent.episode_run_time[0]} min` : 'N/A'}
                  </span>
                </div>
                <p className="overview">{heroContent.overview || 'No description available.'}</p>
                <div className="modal-genres">
                  {heroContent.genres?.map((genre, index) => (
                    <span key={index} className="genre-tag">{genre.name}</span>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="play-btn" onClick={handlePlay}>
                    <img src={play_icon} alt="" />Play
                  </button>
                  <button className="add-to-list-btn">
                    {heroContent.isInMyList ? '✓' : '+'} My List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home