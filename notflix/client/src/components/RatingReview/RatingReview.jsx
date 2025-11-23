import React, { useState, useEffect, useCallback } from 'react';
import './RatingReview.css';
import { useAppContext } from '../../context/AppContext';

const RatingReview = ({ contentId, contentType = 'movie' }) => {
  const { userProfile, addNotification } = useAppContext();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('mostRecent');
  const [loading, setLoading] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [editingReview, setEditingReview] = useState(false);

  // Load ratings and reviews
  useEffect(() => {
    console.log('Loading ratings/reviews for user:', userProfile?.userId, 'content:', contentId);
    loadRatingsAndReviews();
    
    // Cleanup function to remove class on unmount
    return () => {
      document.body.classList.remove('review-written');
    };
  }, [contentId, sortBy, userProfile]);

  const loadRatingsAndReviews = async () => {
    try {
      setLoading(true);

      // Load average rating
      const ratingData = await fetchAverageRating(contentId);
      setAverageRating(ratingData.averageRating);
      setTotalRatings(ratingData.totalRatings);

      // Load reviews
      const reviewsData = await fetchReviews(contentId, sortBy);
      setReviews(reviewsData);

      // Check if user has already rated/reviewed
      const userReviewData = reviewsData.find(r => r.userId === userProfile?.userId);
      if (userReviewData) {
        setUserReview(userReviewData);
        setUserRating(userReviewData.rating);
        setReviewText(userReviewData.reviewText || '');
      }

    } catch (error) {
      console.error('Error loading ratings/reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch average rating (from localStorage or API)
  const fetchAverageRating = async (contentId) => {
    // Check localStorage first
    try {
      const cached = localStorage.getItem(`rating_${contentId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Error parsing cached rating, resetting.', error);
    }

    // In production, call Cloud Function
    // const getRating = firebase.functions().httpsCallable('getAverageRating');
    // const result = await getRating({ contentId });
    // return result.data;

    // For now, return mock data
    return {
      averageRating: 0,
      totalRatings: 0
    };
  };

  // Fetch reviews (from localStorage or API)
  const fetchReviews = async (contentId, sortBy) => {
    // Check localStorage
    try {
      const cached = localStorage.getItem(`reviews_${contentId}`);
      if (cached) {
        const reviews = JSON.parse(cached);
        return sortReviews(reviews, sortBy);
      }
    } catch (error) {
      console.warn('Error parsing cached reviews, resetting.', error);
    }

    // In production, call Cloud Function
    // const getReviews = firebase.functions().httpsCallable('getReviews');
    // const result = await getReviews({ contentId, sortBy });
    // return result.data.reviews;

    return [];
  };

  // Sort reviews
  const sortReviews = (reviews, sortBy) => {
    const sorted = [...reviews];
    
    switch (sortBy) {
      case 'mostHelpful':
        return sorted.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      
      case 'mostRecent':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      case 'highestRated':
        return sorted.sort((a, b) => b.rating - a.rating);
      
      case 'lowestRated':
        return sorted.sort((a, b) => a.rating - b.rating);
      
      default:
        return sorted;
    }
  };

  const handleStorageError = (error, contextLabel) => {
    console.error(`Error saving ${contextLabel} to localStorage:`, error);
    if (error?.name === 'QuotaExceededError') {
      addNotification('Browser storage is full. Some rating/review data may not be saved for later.', 'warning');
    }
  };

  // Handle rating click
  const handleRatingClick = async (rating) => {
    setUserRating(rating);
    const userId = userProfile?.userId || 'guest';
    
    console.log('Saving rating for user:', userId, 'content:', contentId, 'rating:', rating);
    
    try {
      // Save rating to localStorage (per user)
      const ratingData = {
        userId,
        contentId,
        contentType,
        rating,
        createdAt: new Date().toISOString()
      };

      // Update user's ratings
      let ratings = {};
      try {
        ratings = JSON.parse(localStorage.getItem(`userRatings_${userId}`) || '{}');
      } catch (error) {
        console.warn('Error parsing user ratings cache, resetting.', error);
        ratings = {};
      }
      ratings[contentId] = rating;
      try {
        localStorage.setItem(`userRatings_${userId}`, JSON.stringify(ratings));
      } catch (error) {
        handleStorageError(error, 'user ratings');
      }

      // Update average rating (global)
      let allRatings = [];
      try {
        allRatings = JSON.parse(localStorage.getItem(`ratings_${contentId}`) || '[]');
      } catch (error) {
        console.warn('Error parsing ratings cache, resetting.', error);
        allRatings = [];
      }
      allRatings.push(ratingData);
      // Keep only last 100 ratings per content to avoid unbounded growth
      allRatings = allRatings.slice(-100);
      try {
        localStorage.setItem(`ratings_${contentId}`, JSON.stringify(allRatings));
      } catch (error) {
        handleStorageError(error, 'ratings list');
      }

      // Recalculate average
      const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      setAverageRating(Math.round(avg * 10) / 10);
      setTotalRatings(allRatings.length);

      try {
        localStorage.setItem(`rating_${contentId}`, JSON.stringify({
          averageRating: Math.round(avg * 10) / 10,
          totalRatings: allRatings.length
        }));
      } catch (error) {
        handleStorageError(error, 'rating summary');
      }

      addNotification(`Rated ${rating} stars`, 'success');

    } catch (error) {
      console.error('Error rating content:', error);
      handleStorageError(error, 'rating');
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting review...');

    if (!reviewText.trim()) {
      addNotification('Please write a review', 'warning');
      return;
    }

    if (userRating === 0) {
      addNotification('Please select a rating', 'warning');
      return;
    }

    try {
      const reviewData = {
        id: userReview?.id || Date.now().toString(),
        userId: userProfile?.userId || 'guest',
        userName: userProfile?.name || 'Anonymous',
        contentId,
        contentType,
        rating: userRating,
        reviewText: reviewText.trim(),
        helpfulCount: userReview?.helpfulCount || 0,
        helpfulBy: userReview?.helpfulBy || [],
        createdAt: userReview?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      let allReviews = [];
      try {
        allReviews = JSON.parse(localStorage.getItem(`reviews_${contentId}`) || '[]');
      } catch (error) {
        console.warn('Error parsing reviews cache, resetting.', error);
        allReviews = [];
      }
      
      if (editingReview && userReview) {
        // Update existing review
        const index = allReviews.findIndex(r => r.id === userReview.id);
        if (index !== -1) {
          allReviews[index] = reviewData;
        }
      } else {
        // Add new review
        allReviews.unshift(reviewData);
      }

      // Keep only last 100 reviews in storage
      allReviews = allReviews.slice(0, 100);
      try {
        localStorage.setItem(`reviews_${contentId}`, JSON.stringify(allReviews));
      } catch (error) {
        handleStorageError(error, 'reviews');
      }

      // Update state
      setReviews(sortReviews(allReviews, sortBy));
      setUserReview(reviewData);
      setShowReviewForm(false);
      setEditingReview(false);

      addNotification(editingReview ? 'Review updated' : 'Review added', 'success');

      // Log successful submission
      console.log('Review submitted successfully');

      // Add class to body to disable hover effects
      document.body.classList.add('review-written');

      // Reset form state after successful submission with a small delay to ensure UI updates
      setTimeout(() => {
        console.log('Resetting form state');
        setShowReviewForm(false);
        setEditingReview(false);
        setReviewText('');
      }, 100);

      // In production, call Cloud Function
      // const addReview = firebase.functions().httpsCallable(editingReview ? 'updateReview' : 'addReview');
      // await addReview({ contentId, reviewText, rating: userRating, contentType });

    } catch (error) {
      console.error('Error submitting review:', error);
      handleStorageError(error, 'review');
    }
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const allReviews = JSON.parse(localStorage.getItem(`reviews_${contentId}`) || '[]');
      const filtered = allReviews.filter(r => r.id !== userReview.id);
      
      try {
        localStorage.setItem(`reviews_${contentId}`, JSON.stringify(filtered));
      } catch (error) {
        handleStorageError(error, 'reviews');
      }
      setReviews(filtered);
      setUserReview(null);
      setReviewText('');
      
      addNotification('Review deleted', 'info');

      // In production, call Cloud Function
      // const deleteReview = firebase.functions().httpsCallable('deleteReview');
      // await deleteReview({ reviewId: userReview.id });

    } catch (error) {
      console.error('Error deleting review:', error);
      addNotification('Failed to delete review', 'error');
    }
  };

  // Handle helpful click
  const handleHelpfulClick = async (reviewId) => {
    try {
      const allReviews = JSON.parse(localStorage.getItem(`reviews_${contentId}`) || '[]');
      const review = allReviews.find(r => r.id === reviewId);
      
      if (!review) return;

      const userId = userProfile?.userId || 'guest';
      const helpfulBy = review.helpfulBy || [];
      
      if (helpfulBy.includes(userId)) {
        // Remove helpful
        review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
        review.helpfulBy = helpfulBy.filter(id => id !== userId);
      } else {
        // Add helpful
        review.helpfulCount = (review.helpfulCount || 0) + 1;
        review.helpfulBy = [...helpfulBy, userId];
      }

      try {
        localStorage.setItem(`reviews_${contentId}`, JSON.stringify(allReviews));
      } catch (error) {
        handleStorageError(error, 'reviews');
      }
      setReviews(sortReviews(allReviews, sortBy));

      // In production, call Cloud Function
      // const markHelpful = firebase.functions().httpsCallable('markReviewHelpful');
      // await markHelpful({ reviewId });

    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= (interactive ? (hoverRating || rating) : rating) ? 'filled' : ''}`}
            onClick={interactive ? () => handleRatingClick(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="rating-review-section">
      {/* Average Rating Display */}
      <div className="rating-summary">
        <div className="average-rating">
          <div className="rating-number">{averageRating.toFixed(1)}</div>
          {renderStars(Math.round(averageRating))}
          <div className="rating-count">{totalRatings} rating{totalRatings !== 1 ? 's' : ''}</div>
        </div>

        {/* User Rating */}
        <div className="user-rating-section">
          <h3>Rate this {contentType === 'tv' ? 'show' : 'movie'}</h3>
          {renderStars(userRating, true)}
          {userRating > 0 && (
            <p className="rating-label">You rated: {userRating} star{userRating !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Write Review Section */}
      <div className="write-review-section">
        {!showReviewForm && !userReview && (
          <button 
            className="write-review-btn"
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </button>
        )}

        {userReview && !editingReview && (
          <div className="user-review-actions">
            <p className="your-review-label">Your Review</p>
            <div className="review-actions">
              <button onClick={() => { setEditingReview(true); setShowReviewForm(true); }}>
                Edit Review
              </button>
              <button onClick={handleDeleteReview} className="delete-btn">
                Delete Review
              </button>
            </div>
          </div>
        )}

        {showReviewForm && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this movie..."
              rows="5"
              maxLength="1000"
            />
            <div className="review-form-actions">
              <span className="char-count">{reviewText.length}/1000</span>
              <div className="form-buttons">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(false);
                    if (!userReview) setReviewText('');
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h3>Reviews ({reviews.length})</h3>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="mostRecent">Most Recent</option>
            <option value="mostHelpful">Most Helpful</option>
            <option value="highestRated">Highest Rated</option>
            <option value="lowestRated">Lowest Rated</option>
          </select>
        </div>

        {loading && <div className="loading">Loading reviews...</div>}

        {!loading && reviews.length === 0 && (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}

        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    <span>{review.userName?.charAt(0) || '?'}</span>
                  </div>
                  <div className="reviewer-details">
                    <h4>{review.userName}</h4>
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="review-content">
                <p>{review.reviewText}</p>
              </div>
              
              <div className="review-footer">
                <button 
                  className={`helpful-btn ${review.helpfulBy?.includes(userProfile?.userId) ? 'marked' : ''}`}
                  onClick={() => handleHelpfulClick(review.id)}
                >
                  👍 Helpful ({review.helpfulCount || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingReview;
