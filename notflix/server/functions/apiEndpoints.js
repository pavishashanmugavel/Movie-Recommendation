/**
 * ============================================
 * NOTFLIX - API ENDPOINTS
 * Cloud Functions HTTP Endpoints
 * ============================================
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { RecommendationEngine } = require('../services/recommendationEngine');
const { RatingReviewService } = require('../services/ratingReviewService');

const db = admin.firestore();

/**
 * ============================================
 * WATCH TRACKING ENDPOINTS
 * ============================================
 */

/**
 * POST /watch
 * Track user watching content
 */
exports.trackWatch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { contentId, contentType, completionRate, duration } = data;

  try {
    const watchData = {
      userId,
      contentId,
      contentType: contentType || 'movie',
      completionRate: completionRate || 0,
      duration: duration || 0,
      watchedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add to watch history collection
    await db.collection('watchHistory').add(watchData);

    // Update user's watch history
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const watchHistory = userData.watchHistory || [];

    // Add full content details to user's history
    watchHistory.unshift({
      ...data.contentDetails,
      completionRate,
      watchedAt: new Date().toISOString()
    });

    // Keep only last 100 items
    await userRef.update({
      watchHistory: watchHistory.slice(0, 100)
    });

    console.log(`✅ Watch tracked: User ${userId} watched ${contentId} (${completionRate}% complete)`);

    return { success: true, message: 'Watch tracked successfully' };

  } catch (error) {
    console.error('Error tracking watch:', error);
    throw new functions.https.HttpsError('internal', 'Failed to track watch');
  }
});

/**
 * ============================================
 * RECOMMENDATION ENDPOINTS
 * ============================================
 */

/**
 * GET /top-picks
 * Get personalized top picks for user
 */
exports.getTopPicks = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { limit = 20 } = data;

  try {
    const topPicks = await RecommendationEngine.generateTopPicks(userId, limit);

    return { success: true, topPicks };

  } catch (error) {
    console.error('Error getting top picks:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get top picks');
  }
});

/**
 * GET /page/home
 * Get home page content
 */
exports.getHomePage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const content = await RecommendationEngine.generatePageContent(userId, 'home', data);

    return { success: true, content };

  } catch (error) {
    console.error('Error getting home page:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get home page content');
  }
});

/**
 * GET /page/tv
 * Get TV shows page content
 */
exports.getTVPage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const content = await RecommendationEngine.generatePageContent(userId, 'tv', data);

    return { success: true, content };

  } catch (error) {
    console.error('Error getting TV page:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get TV page content');
  }
});

/**
 * GET /page/movies
 * Get movies page content
 */
exports.getMoviesPage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const content = await RecommendationEngine.generatePageContent(userId, 'movies', data);

    return { success: true, content };

  } catch (error) {
    console.error('Error getting movies page:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get movies page content');
  }
});

/**
 * GET /page/new-popular
 * Get new & popular page content
 */
exports.getNewPopularPage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const content = await RecommendationEngine.generatePageContent(userId, 'new-popular', data);

    return { success: true, content };

  } catch (error) {
    console.error('Error getting new & popular page:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get new & popular content');
  }
});

/**
 * GET /page/my-list
 * Get my list page content
 */
exports.getMyListPage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const content = await RecommendationEngine.generatePageContent(userId, 'my-list', data);

    return { success: true, content };

  } catch (error) {
    console.error('Error getting my list page:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get my list content');
  }
});

/**
 * GET /page/language/:lang
 * Get language-specific page content
 */
exports.getLanguagePage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { language } = data;

  try {
    const content = await RecommendationEngine.generatePageContent(
      userId,
      'browse-languages',
      { language }
    );

    return { success: true, content };

  } catch (error) {
    console.error('Error getting language page:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get language page content');
  }
});

/**
 * ============================================
 * RATING & REVIEW ENDPOINTS
 * ============================================
 */

/**
 * POST /rate
 * Rate content
 */
exports.rateContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { contentId, rating, contentType } = data;

  try {
    const result = await RatingReviewService.rateContent(
      userId,
      contentId,
      rating,
      contentType
    );

    return result;

  } catch (error) {
    console.error('Error rating content:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * POST /review
 * Add or update review
 */
exports.addReview = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { contentId, reviewText, rating, contentType } = data;

  try {
    const result = await RatingReviewService.addReview(
      userId,
      contentId,
      reviewText,
      rating,
      contentType
    );

    return result;

  } catch (error) {
    console.error('Error adding review:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * PUT /review/:reviewId
 * Update existing review
 */
exports.updateReview = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { reviewId, reviewText, rating } = data;

  try {
    const result = await RatingReviewService.updateReview(
      reviewId,
      userId,
      { reviewText, rating }
    );

    return result;

  } catch (error) {
    console.error('Error updating review:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * DELETE /review/:reviewId
 * Delete review
 */
exports.deleteReview = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { reviewId } = data;

  try {
    const result = await RatingReviewService.deleteReview(reviewId, userId);

    return result;

  } catch (error) {
    console.error('Error deleting review:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * POST /review/:reviewId/helpful
 * Mark review as helpful
 */
exports.markReviewHelpful = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { reviewId } = data;

  try {
    const result = await RatingReviewService.markReviewHelpful(reviewId, userId);

    return result;

  } catch (error) {
    console.error('Error marking review as helpful:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * GET /reviews/:contentId
 * Get reviews for content
 */
exports.getReviews = functions.https.onCall(async (data, context) => {
  const { contentId, sortBy, limit, offset } = data;

  try {
    const reviews = await RatingReviewService.getReviews(contentId, {
      sortBy,
      limit,
      offset
    });

    return { success: true, reviews };

  } catch (error) {
    console.error('Error getting reviews:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get reviews');
  }
});

/**
 * GET /rating/:contentId
 * Get average rating for content
 */
exports.getAverageRating = functions.https.onCall(async (data, context) => {
  const { contentId } = data;

  try {
    const rating = await RatingReviewService.getAverageRating(contentId);

    return { success: true, ...rating };

  } catch (error) {
    console.error('Error getting average rating:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get average rating');
  }
});

/**
 * ============================================
 * SCHEDULED FUNCTIONS
 * ============================================
 */

/**
 * Daily popularity score update
 * Runs every day at 2:00 AM
 */
exports.dailyPopularityUpdate = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('🔄 Starting daily popularity score update...');
    await RatingReviewService.batchUpdatePopularityScores();
    return null;
  });
