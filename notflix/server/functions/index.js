/**
 * ============================================
 * NOTFLIX - FIREBASE CLOUD FUNCTIONS
 * Production-Ready Serverless Functions
 * ============================================
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { NotificationService, RecommendationEngine, NotificationScheduler, NOTIFICATION_TYPES } = require('../services/notificationService');

admin.initializeApp();
const db = admin.firestore();

/**
 * ============================================
 * SCHEDULED FUNCTIONS (CRON JOBS)
 * ============================================
 */

/**
 * Send daily personalized picks
 * Runs every day at 9:00 AM
 */
exports.sendDailyPicks = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('🚀 Starting daily picks job...');
    await NotificationScheduler.sendDailyPicksToAllUsers();
    return null;
  });

/**
 * Send weekly personalized recommendations
 * Runs every Monday at 10:00 AM
 */
exports.sendWeeklyPicks = functions.pubsub
  .schedule('0 10 * * 1')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('🚀 Starting weekly picks job...');
    
    try {
      const users = await db.collection('users')
        .where('notificationPreferences.weeklyPicks', '==', true)
        .get();

      const notifications = [];

      for (const userDoc of users.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        const picks = await RecommendationEngine.getDailyPicks(userId, 10);

        notifications.push({
          fcmToken: userData.fcmToken,
          type: NOTIFICATION_TYPES.WEEKLY_PICKS,
          data: {
            userId,
            count: picks.length,
            userName: userData.name,
            movies: picks
          }
        });
      }

      await NotificationService.sendBatchNotifications(notifications);
      console.log(`✅ Weekly picks sent to ${notifications.length} users`);

    } catch (error) {
      console.error('Error sending weekly picks:', error);
    }

    return null;
  });

/**
 * Check for new releases from followed actors/directors
 * Runs every 6 hours
 */
exports.checkNewReleases = functions.pubsub
  .schedule('0 */6 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('🚀 Checking for new releases...');
    await NotificationScheduler.checkNewReleases();
    return null;
  });

/**
 * Send continue watching reminders
 * Runs every day at 7:00 PM
 */
exports.sendContinueWatchingReminders = functions.pubsub
  .schedule('0 19 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('🚀 Sending continue watching reminders...');
    await NotificationScheduler.sendContinueWatchingReminders();
    return null;
  });

/**
 * ============================================
 * TRIGGER FUNCTIONS (EVENT-BASED)
 * ============================================
 */

/**
 * Trigger when user watches a movie
 * Generates instant recommendations
 */
exports.onMovieWatched = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const before = change.before.data();
    const after = change.after.data();

    // Check if watchHistory was updated
    const beforeHistory = before.watchHistory || [];
    const afterHistory = after.watchHistory || [];

    if (afterHistory.length > beforeHistory.length) {
      console.log(`🎬 User ${userId} watched a new movie!`);

      // Get latest watched movie
      const latestMovie = afterHistory[0];

      // Generate recommendations based on this movie
      const recommendations = await RecommendationEngine.getDailyPicks(userId, 5);

      // Send notification with recommendations
      if (after.fcmToken && after.notificationPreferences?.dailyPicks) {
        await NotificationService.sendNotification(
          userId,
          NOTIFICATION_TYPES.GENRE_RECOMMENDATION,
          {
            genreName: latestMovie.genres[0]?.name || 'Similar',
            count: recommendations.length,
            movies: recommendations
          },
          after.fcmToken
        );
      }

      // Update user stats
      await updateUserStats(userId, latestMovie);
    }

    return null;
  });

/**
 * Trigger when new movie is added to watchlist
 */
exports.onMovieAddedToWatchlist = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const before = change.before.data();
    const after = change.after.data();

    const beforeList = before.myList || [];
    const afterList = after.myList || [];

    if (afterList.length > beforeList.length) {
      const newMovie = afterList.find(
        movie => !beforeList.find(m => m.id === movie.id)
      );

      console.log(`⭐ User ${userId} added ${newMovie.title} to watchlist`);

      // Check movie availability periodically
      // This would be handled by a separate cron job
    }

    return null;
  });

/**
 * Trigger achievement unlocks
 */
exports.checkAchievements = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const userData = change.after.data();
    const stats = userData.stats || {};

    const achievements = [];

    // Check various achievement conditions
    if (stats.totalWatched === 10 && !hasAchievement(userData, 'first_ten')) {
      achievements.push({
        id: 'first_ten',
        name: 'Movie Buff',
        description: 'Watched 10 movies!',
        badge: 'movie_buff'
      });
    }

    if (stats.totalWatched === 50 && !hasAchievement(userData, 'fifty_movies')) {
      achievements.push({
        id: 'fifty_movies',
        name: 'Cinephile',
        description: 'Watched 50 movies!',
        badge: 'cinephile'
      });
    }

    if (stats.streak?.current === 7 && !hasAchievement(userData, 'week_streak')) {
      achievements.push({
        id: 'week_streak',
        name: '7-Day Streak',
        description: 'Watched movies for 7 days straight!',
        badge: 'week_streak'
      });
    }

    // Award achievements
    for (const achievement of achievements) {
      await db.collection('users').doc(userId).update({
        achievements: admin.firestore.FieldValue.arrayUnion({
          ...achievement,
          unlockedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      });

      // Send notification
      if (userData.fcmToken && userData.notificationPreferences?.achievements) {
        await NotificationService.sendNotification(
          userId,
          NOTIFICATION_TYPES.ACHIEVEMENT,
          achievement,
          userData.fcmToken
        );
      }
    }

    return null;
  });

/**
 * ============================================
 * HTTP FUNCTIONS (API ENDPOINTS)
 * ============================================
 */

/**
 * Register FCM token for user
 * POST /registerFCMToken
 */
exports.registerFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { fcmToken } = data;
  const userId = context.auth.uid;

  if (!fcmToken) {
    throw new functions.https.HttpsError('invalid-argument', 'FCM token is required');
  }

  try {
    await db.collection('users').doc(userId).update({
      fcmToken,
      fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: 'FCM token registered successfully' };

  } catch (error) {
    console.error('Error registering FCM token:', error);
    throw new functions.https.HttpsError('internal', 'Failed to register FCM token');
  }
});

/**
 * Get personalized recommendations
 * GET /getRecommendations
 */
exports.getRecommendations = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { count = 20, filterType, filterValue } = data;

  try {
    let recommendations;

    if (filterType === 'mood') {
      recommendations = await RecommendationEngine.getMoodRecommendations(userId, filterValue);
    } else {
      recommendations = await RecommendationEngine.getDailyPicks(userId, count);
    }

    return { success: true, recommendations };

  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get recommendations');
  }
});

/**
 * Update notification preferences
 * POST /updateNotificationPreferences
 */
exports.updateNotificationPreferences = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { preferences } = data;

  try {
    await db.collection('users').doc(userId).update({
      notificationPreferences: preferences
    });

    return { success: true, message: 'Preferences updated successfully' };

  } catch (error) {
    console.error('Error updating preferences:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update preferences');
  }
});

/**
 * Follow actor/director
 * POST /followPerson
 */
exports.followPerson = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { personId, personName, type } = data; // type: 'actor' or 'director'

  try {
    const fieldName = type === 'actor' ? 'followedActors' : 'followedDirectors';

    await db.collection('users').doc(userId).update({
      [fieldName]: admin.firestore.FieldValue.arrayUnion({
        id: personId,
        name: personName,
        followedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    });

    return { success: true, message: `Now following ${personName}` };

  } catch (error) {
    console.error('Error following person:', error);
    throw new functions.https.HttpsError('internal', 'Failed to follow person');
  }
});

/**
 * Get user notifications
 * GET /getNotifications
 */
exports.getNotifications = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { limit = 20 } = data;

  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, notifications };

  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch notifications');
  }
});

/**
 * Mark notification as read
 * POST /markNotificationRead
 */
exports.markNotificationRead = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { notificationId } = data;

  try {
    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: 'Notification marked as read' };

  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new functions.https.HttpsError('internal', 'Failed to mark notification as read');
  }
});

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

function hasAchievement(userData, achievementId) {
  const achievements = userData.achievements || [];
  return achievements.some(a => a.id === achievementId);
}

async function updateUserStats(userId, movie) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  const stats = userData.stats || {};

  const updates = {
    'stats.totalWatched': (stats.totalWatched || 0) + 1,
    'stats.totalWatchTime': (stats.totalWatchTime || 0) + (movie.runtime || 0)
  };

  // Update streak
  const now = new Date();
  const lastWatch = stats.streak?.lastWatchDate?.toDate();
  
  if (lastWatch) {
    const daysDiff = Math.floor((now - lastWatch) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Continue streak
      updates['stats.streak.current'] = (stats.streak?.current || 0) + 1;
      updates['stats.streak.longest'] = Math.max(
        stats.streak?.longest || 0,
        (stats.streak?.current || 0) + 1
      );
    } else if (daysDiff > 1) {
      // Streak broken, reset
      updates['stats.streak.current'] = 1;
    }
  } else {
    updates['stats.streak.current'] = 1;
    updates['stats.streak.longest'] = 1;
  }

  updates['stats.streak.lastWatchDate'] = admin.firestore.FieldValue.serverTimestamp();

  await userRef.update(updates);
}
