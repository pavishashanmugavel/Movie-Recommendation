import React, { useEffect, useState } from 'react'
import './Player.css'
import back_arrow_icon from '../../assets/back_arrow_icon.png'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import cards_data from '../../assets/cards/Cards_data'
import RatingReview from '../../components/RatingReview/RatingReview'

const Player = () => {

  const {id} = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToViewingHistory } = useAppContext();
  const contentType = searchParams.get('type') || 'movie';

const [apiData, setApiData] = useState({
  name: "",
  key: "",
  published_at: "",
  type: ""
})

const [movieDetails, setMovieDetails] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [isLocalContent, setIsLocalContent] = useState(false);

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjM2FjYzVlOGIxYTljNzM2ZGM3OThjNDllM2M5MDY5ZiIsIm5iZiI6MTc1MTc3NjU5MS4yODEsInN1YiI6IjY4NjlmZDRmOWRiZTkxODkxNjEwMzI4YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.wQarnuqPkkSaKXTyjUmHfFt32hF8O6d828L_pqvi28s'
  }
};

useEffect(()=>{
  // Check if this is local content (from cards_data)
  const localCard = cards_data.find(card => card.name.toLowerCase().replace(/\s+/g, '') === id.toLowerCase().replace(/\s+/g, ''));
  
  if (localCard) {
    // Handle local content
    setIsLocalContent(true);
    setApiData({
      name: `${localCard.name} - Trailer`,
      key: "dQw4w9WgXcQ", // Rick Roll as placeholder - you can replace with actual trailer IDs
      published_at: "2024-01-01",
      type: "Trailer"
    });
    setMovieDetails({
      title: localCard.name,
      overview: `Immerse yourself in the captivating world of ${localCard.name}. This compelling ${contentType === 'tv' ? 'series' : 'film'} delivers an unforgettable experience with its masterful storytelling, stunning visuals, and powerful performances. A true masterpiece that will keep you on the edge of your seat from beginning to end.`,
      vote_average: 8.5,
      release_date: "2024-01-01",
      runtime: 120,
      genres: [{ name: "Action" }, { name: "Drama" }],
      credits: {
        cast: [
          { name: "Actor One", character: "Main Character" },
          { name: "Actor Two", character: "Supporting Role" },
          { name: "Actor Three", character: "Antagonist" }
        ],
        crew: [
          { name: "Director Name", job: "Director" }
        ]
      },
      production_companies: [
        { name: "Production Company" }
      ]
    });
    setLoading(false);
  } else {
    // Handle TMDB content
    setIsLocalContent(false);
    
    // Fetch video data
    const videoUrl = contentType === 'tv' 
      ? `https://api.themoviedb.org/3/tv/${id}/videos?language=en-US`
      : `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`;
      
    fetch(videoUrl, options)
    .then(res => res.json())
    .then(res => {
      if (res.results && res.results.length > 0) {
        setApiData(res.results[0]);
      } else {
        setError('No video available for this content');
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError('Failed to load video');
      setLoading(false);
    });

    // Fetch content details for history tracking
    const detailsUrl = contentType === 'tv'
      ? `https://api.themoviedb.org/3/tv/${id}?language=en-US&append_to_response=credits` // Added credits
      : `https://api.themoviedb.org/3/movie/${id}?language=en-US&append_to_response=credits,production_companies`;
      
    fetch(detailsUrl, options)
    .then(res => res.json())
    .then(contentInfo => {
      if (contentInfo && contentInfo.success !== false) {
        setMovieDetails(contentInfo);
        addToViewingHistory(contentInfo);
      }
    })
    .catch(err => {
      console.log('History tracking failed:', err);
    });
  }
},[id, contentType])

  return (
    <div className='player'>
      <img src={back_arrow_icon} alt="" onClick={()=>{navigate('/')}}/>
      
      {loading && (
        <div className="loading-message">
          <p>Loading video...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>This content may not have a trailer available. Please try another selection.</p>
        </div>
      )}
      
      {!loading && !error && apiData.key && (
        <>
          <div className="video-container">
            <iframe 
              width='100%' 
              height='100%' 
              src={`https://www.youtube.com/embed/${apiData.key}`} 
              title='trailer' 
              frameBorder='0' 
              allowFullScreen
              onError={(e) => {
                console.error('Video failed to load:', e);
                setError('Failed to load video. Please try again later.');
              }}
            ></iframe>
          </div>
          <div className="player-info">
            <div className="video-details">
              <h2>{movieDetails?.title || movieDetails?.name || 'Video'}</h2>
              <p className="overview">{movieDetails?.overview || 'No description available.'}</p>
              <div className="meta-info">
                <span className="rating">⭐ {movieDetails?.vote_average?.toFixed(1) || 'N/A'}</span>
                <span className="year">
                  {movieDetails?.release_date?.slice(0, 4) || movieDetails?.first_air_date?.slice(0, 4) || 'N/A'}
                </span>
                <span className="runtime">
                  {movieDetails?.runtime ? `${movieDetails.runtime} min` : 
                   movieDetails?.episode_run_time ? `${movieDetails.episode_run_time[0]} min` : 'N/A'}
                </span>
                {isLocalContent && <span className="local-badge">Local Content</span>}
              </div>
              <div className="genres">
                {movieDetails?.genres?.map((genre, index) => (
                  <span key={index} className="genre-tag">{genre.name}</span>
                ))}
              </div>
            </div>
            <div className="video-meta">
              <p><strong>Video:</strong> {apiData.name || 'Trailer'}</p>
              <p><strong>Type:</strong> {apiData.type || 'Trailer'}</p>
              <p><strong>Date:</strong> {apiData.published_at ? apiData.published_at.slice(0,10) : 'N/A'}</p>
            </div>
            
            {/* Cast Section */}
            {movieDetails?.credits?.cast && movieDetails.credits.cast.length > 0 && (
              <div className="cast-section">
                <h3>Cast</h3>
                <div className="cast-list">
                  {movieDetails.credits.cast.slice(0, 10).map((actor, index) => (
                    <div key={index} className="cast-member">
                      <p className="actor-name">{actor.name}</p>
                      <p className="character-name">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Director Section */}
            {movieDetails?.credits?.crew && movieDetails.credits.crew.filter(person => person.job === 'Director').length > 0 && (
              <div className="director-section">
                <h3>Director</h3>
                <div className="director-list">
                  {movieDetails.credits.crew
                    .filter(person => person.job === 'Director')
                    .map((director, index) => (
                      <span key={index} className="director-name">{director.name}</span>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Production Companies Section */}
            {movieDetails?.production_companies && movieDetails.production_companies.length > 0 && (
              <div className="production-section">
                <h3>Production Companies</h3>
                <div className="company-list">
                  {movieDetails.production_companies.map((company, index) => (
                    <span key={index} className="company-name">{company.name}</span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Rating and Review Section */}
            <div className="rating-review-section">
              <RatingReview contentId={id} contentType={contentType} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Player