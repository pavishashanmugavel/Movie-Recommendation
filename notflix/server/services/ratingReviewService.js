/**
 * ============================================
 * NOTFLIX - RATING & REVIEW SERVICE
 * Complete User Review & Rating System
 * ============================================
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * ============================================
 * RATING & REVIEW SERVICE
 * ============================================
 */

class RatingReviewService {
  
  /**
   * Add or update user rating
   */
  static async rateContent(userId, contentId, rating, contentType = 'movie') {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      
      const ratingData = {
        userId,
        contentId,
        contentType,
        rating,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Use compound key for unique rating per user per content
      const ratingId = `${userId}_${contentId}`;
      
      // Check if rating exists
      const existingRating = await db.collection('ratings').doc(ratingId).get();
      
      if (existingRating.exists) {
        // Update existing rating
        await db.collection('ratings').doc(ratingId).update({
          rating,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Create new rating
        await db.collection('ratings').doc(ratingId).set(ratingData);
      }
      
      // Update user's ratings map
      await db.collection('users').doc(userId).update({
        [`ratings.${contentId}`]: rating
      });
      
      // Recalculate average rating
      await this.updateAverageRating(contentId);
      
      // Update popularity score
      await this.updatePopularityScore(contentId);
      
      console.log(`✅ User ${userId} rated content ${contentId}: ${rating} stars`);
      
      return { success: true, rating };
      
    } catch (error) {
      console.error('Error rating content:', error);
      throw error;
    }
  }
  
  /**
   * Add or update user review
   */
  static async addReview(userId, contentId, reviewText, rating, contentType = 'movie') {
    try {
      // First, add/update rating
      await this.rateContent(userId, contentId, rating, contentType);
      
      // Get user info
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      const reviewData = {
        userId,
        userName: userData.name || 'Anonymous',
        userAvatar: userData.avatar || null,
        contentId,
        contentType,
        rating,
        reviewText,
        helpfulCount: 0,
        helpfulBy: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Add review to collection
      const reviewRef = await db.collection('reviews').add(reviewData);
      
      // Update content review count
      await this.updateReviewCount(contentId);
      
      console.log(`✅ User ${userId} added review for content ${contentId}`);
      
      return { success: true, reviewId: reviewRef.id, review: reviewData };
      
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
  
  /**
   * Update existing review
   */
  static async updateReview(reviewId, userId, updateData) {
    try {
      const reviewDoc = await db.collection('reviews').doc(reviewId).get();
      
      if (!reviewDoc.exists) {
        throw new Error('Review not found');
      }
      
      const reviewData = reviewDoc.data();
      
      // Check if user owns this review
      if (reviewData.userId !== userId) {
        throw new Error('Unauthorized: You can only edit your own reviews');
      }
      
      await db.collection('reviews').doc(reviewId).update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Review ${reviewId} updated`);
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }
  
  /**
   * Delete user review
   */
  static async deleteReview(reviewId, userId) {
    try {
      const reviewDoc = await db.collection('reviews').doc(reviewId).get();
      
      if (!reviewDoc.exists) {
        throw new Error('Review not found');
      }
      
      const reviewData = reviewDoc.data();
      
      // Check if user owns this review
      if (reviewData.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own reviews');
      }
      
      const contentId = reviewData.contentId;
      
      // Delete review
      await db.collection('reviews').doc(reviewId).delete();
      
      // Update review count
      await this.updateReviewCount(contentId);
      
      console.log(`✅ Review ${reviewId} deleted`);
      
      return { success: true };
      
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
  
  /**
   * Mark review as helpful
   */
  static async markReviewHelpful(reviewId, userId) {
    try {
      const reviewDoc = await db.collection('reviews').doc(reviewId).get();
      
      if (!reviewDoc.exists) {
        throw new Error('Review not found');
      }
      
      const reviewData = reviewDoc.data();
      const helpfulBy = reviewData.helpfulBy || [];
      
      if (helpfulBy.includes(userId)) {
        // Already marked helpful - remove
        await db.collection('reviews').doc(reviewId).update({
          helpfulCount: admin.firestore.FieldValue.increment(-1),
          helpfulBy: admin.firestore.FieldValue.arrayRemove(userId)
        });
        
        return { success: true, action: 'removed' };
      } else {
        // Mark as helpful
        await db.collection('reviews').doc(reviewId).update({
          helpfulCount: admin.firestore.FieldValue.increment(1),
          helpfulBy: admin.firestore.FieldValue.arrayUnion(userId)
        });
        
        return { success: true, action: 'added' };
      }
      
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }
  
  /**
   * Get reviews for content
   */
  static async getReviews(contentId, options = {}) {
    try {
      const {
        sortBy = 'mostRecent', // mostRecent, mostHelpful, highestRated, lowestRated
        limit = 20,
        offset = 0
      } = options;
      
      let query = db.collection('reviews').where('contentId', '==', contentId);
      
      // Apply sorting
      switch (sortBy) {
        case 'mostHelpful':
          query = query.orderBy('helpfulCount', 'desc');
          break;
        
        case 'mostRecent':
          query = query.orderBy('createdAt', 'desc');
          break;
        
        case 'highestRated':
          query = query.orderBy('rating', 'desc');
          break;
        
        case 'lowestRated':
          query = query.orderBy('rating', 'asc');
          break;
      }
      
      query = query.limit(limit).offset(offset);
      
      const snapshot = await query.get();
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return reviews;
      
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  }
  
  /**
   * Get average rating for content
   */
  static async getAverageRating(contentId) {
    try {
      const snapshot = await db.collection('ratings')
        .where('contentId', '==', contentId)
        .get();
      
      if (snapshot.empty) {
        return { averageRating: 0, totalRatings: 0 };
      }
      
      let totalRating = 0;
      snapshot.forEach(doc => {
        totalRating += doc.data().rating;
      });
      
      const averageRating = totalRating / snapshot.size;
      
      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: snapshot.size
      };
      
    } catch (error) {
      console.error('Error calculating average rating:', error);
      throw error;
    }
  }
  
  /**
   * Update average rating in content metadata
   */
  static async updateAverageRating(contentId) {
    try {
      const { averageRating, totalRatings } = await this.getAverageRating(contentId);
      
      // Update or create content metadata
      await db.collection('contentMetadata').doc(contentId).set({
        contentId,
        averageRating,
        totalRatings,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log(`✅ Average rating updated for ${contentId}: ${averageRating} (${totalRatings} ratings)`);
      
    } catch (error) {
      console.error('Error updating average rating:', error);
    }
  }
  
  /**
   * Update review count in content metadata
   */
  static async updateReviewCount(contentId) {
    try {
      const snapshot = await db.collection('reviews')
        .where('contentId', '==', contentId)
        .get();
      
      await db.collection('contentMetadata').doc(contentId).set({
        contentId,
        totalReviews: snapshot.size,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log(`✅ Review count updated for ${contentId}: ${snapshot.size} reviews`);
      
    } catch (error) {
      console.error('Error updating review count:', error);
    }
  }
  
  /**
   * Update popularity score
   * Formula: (avgRating * 0.4) + (totalRatings * 0.2) + (totalReviews * 0.2) + (helpfulVotes * 0.1) + (recentWatches * 0.1)
   */
  static async updatePopularityScore(contentId) {
    try {
      // Get content metadata
      const metadataDoc = await db.collection('contentMetadata').doc(contentId).get();
      const metadata = metadataDoc.exists ? metadataDoc.data() : {};
      
      const avgRating = metadata.averageRating || 0;
      const totalRatings = metadata.totalRatings || 0;
      const totalReviews = metadata.totalReviews || 0;
      
      // Get total helpful votes
      const reviewsSnapshot = await db.collection('reviews')
        .where('contentId', '==', contentId)
        .get();
      
      let totalHelpfulVotes = 0;
      reviewsSnapshot.forEach(doc => {
        totalHelpfulVotes += doc.data().helpfulCount || 0;
      });
      
      // Get recent watches (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const watchesSnapshot = await db.collection('watchHistory')
        .where('contentId', '==', contentId)
        .where('watchedAt', '>=', sevenDaysAgo)
        .get();
      
      const recentWatches = watchesSnapshot.size;
      
      // Calculate popularity score
      const popularityScore = 
        (avgRating * 0.4) +
        (Math.min(totalRatings / 100, 1) * 0.2 * 100) +
        (Math.min(totalReviews / 50, 1) * 0.2 * 100) +
        (Math.min(totalHelpfulVotes / 100, 1) * 0.1 * 100) +
        (Math.min(recentWatches / 500, 1) * 0.1 * 100);
      
      // Update metadata
      await db.collection('contentMetadata').doc(contentId).set({
        contentId,
        popularityScore: Math.round(popularityScore * 10) / 10,
        recentWatches,
        totalHelpfulVotes,
        lastPopularityUpdate: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log(`✅ Popularity score updated for ${contentId}: ${popularityScore}`);
      
      return popularityScore;
      
    } catch (error) {
      console.error('Error updating popularity score:', error);
      throw error;
    }
  }
  
  /**
   * Get popular content (sorted by popularity score)
   */
  static async getPopularContent(limit = 20, contentType = null) {
    try {
      let query = db.collection('contentMetadata')
        .orderBy('popularityScore', 'desc')
        .limit(limit);
      
      if (contentType) {
        query = query.where('contentType', '==', contentType);
      }
      
      const snapshot = await query.get();
      const contentIds = snapshot.docs.map(doc => doc.data().contentId);
      
      return contentIds;
      
    } catch (error) {
      console.error('Error getting popular content:', error);
      throw error;
    }
  }
  
  /**
   * Batch update popularity scores (run daily)
   */
  static async batchUpdatePopularityScores() {
    try {
      console.log('🔄 Starting batch popularity score update...');
      
      const snapshot = await db.collection('contentMetadata').get();
      
      const batchSize = 500;
      let processed = 0;
      
      for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = snapshot.docs.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(doc => this.updatePopularityScore(doc.data().contentId))
        );
        
        processed += batch.length;
        console.log(`✅ Processed ${processed}/${snapshot.docs.length} items`);
      }
      
      console.log('✅ Batch popularity score update complete');
      
    } catch (error) {
      console.error('Error in batch update:', error);
    }
  }
}

/**
 * ============================================
 * EXPORTS
 * ============================================
 */

module.exports = {
  RatingReviewService
};
