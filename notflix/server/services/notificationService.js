/**
 * NOTFLIX - Intelligent Notification Service
 * Production-Ready Notification System with Firebase Cloud Messaging
 * Supports millions of users with scalable architecture
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require('../firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://your-project-id.firebaseio.com"
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * ============================================
 * NOTIFICATION TYPES & TEMPLATES
 * ============================================
 */

const NOTIFICATION_TYPES = {
  DAILY_PICKS: 'daily_picks',
  WEEKLY_PICKS: 'weekly_picks',
  NEW_RELEASE: 'new_release',
  ACTOR_RELEASE: 'actor_release',
  DIRECTOR_RELEASE: 'director_release',
  CONTINUE_WATCHING: 'continue_watching',
  MOOD_BASED: 'mood_based',
  WATCHLIST_AVAILABLE: 'watchlist_available',
  FRIEND_ACTIVITY: 'friend_activity',
  ACHIEVEMENT: 'achievement',
  TRENDING: 'trending',
  GENRE_RECOMMENDATION: 'genre_recommendation'
};

const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.DAILY_PICKS]: {
    title: "🎬 Your Daily Movie Picks",
    body: "{{count}} new movies picked just for you based on your taste!",
    imageKey: "backdrop_path",
    action: "recommendations",
    priority: "normal"
  },
  
  [NOTIFICATION_TYPES.WEEKLY_PICKS]: {
    title: "⭐ Weekly Personalized Recommendations",
    body: "{{userName}}, we found {{count}} movies you'll love this week!",
    imageKey: "poster_path",
    action: "weekly_picks",
    priority: "normal"
  },
  
  [NOTIFICATION_TYPES.NEW_RELEASE]: {
    title: "🆕 New Release Alert",
    body: "{{title}} is now available! {{genre}} • {{rating}}⭐",
    imageKey: "backdrop_path",
    action: "player",
    priority: "high"
  },
  
  [NOTIFICATION_TYPES.ACTOR_RELEASE]: {
    title: "🌟 {{actorName}} is back!",
    body: "New movie '{{title}}' featuring {{actorName}} just dropped!",
    imageKey: "backdrop_path",
    action: "player",
    priority: "high"
  },
  
  [NOTIFICATION_TYPES.DIRECTOR_RELEASE]: {
    title: "🎥 New from {{directorName}}",
    body: "{{title}} - The latest masterpiece from director {{directorName}}",
    imageKey: "poster_path",
    action: "player",
    priority: "high"
  },
  
  [NOTIFICATION_TYPES.CONTINUE_WATCHING]: {
    title: "▶️ Continue Watching",
    body: "Pick up where you left off in '{{title}}' - {{progress}}% complete",
    imageKey: "backdrop_path",
    action: "player",
    priority: "normal"
  },
  
  [NOTIFICATION_TYPES.MOOD_BASED]: {
    title: "{{moodEmoji}} {{moodName}} Mood Movies",
    body: "Feeling {{moodName}}? Try these {{count}} movies perfect for your vibe!",
    imageKey: "backdrop_path",
    action: "mood_recommendations",
    priority: "normal"
  },
  
  [NOTIFICATION_TYPES.WATCHLIST_AVAILABLE]: {
    title: "✅ Watchlist Update",
    body: "'{{title}}' from your watchlist is now streaming!",
    imageKey: "poster_path",
    action: "player",
    priority: "high"
  },
  
  [NOTIFICATION_TYPES.FRIEND_ACTIVITY]: {
    title: "👥 {{friendName}} watched",
    body: "{{friendName}} just watched '{{title}}' and rated it {{rating}}⭐",
    imageKey: "backdrop_path",
    action: "social",
    priority: "low"
  },
  
  [NOTIFICATION_TYPES.ACHIEVEMENT]: {
    title: "🏆 Achievement Unlocked!",
    body: "{{achievementName}} - {{description}}",
    imageKey: "badge",
    action: "achievements",
    priority: "normal"
  },
  
  [NOTIFICATION_TYPES.TRENDING]: {
    title: "🔥 Trending Now",
    body: "'{{title}}' is trending! Join {{viewCount}} others watching now",
    imageKey: "backdrop_path",
    action: "player",
    priority: "normal"
  },
  
  [NOTIFICATION_TYPES.GENRE_RECOMMENDATION]: {
    title: "{{genreName}} Movies for You",
    body: "Based on your love for {{genreName}}, here are {{count}} new picks!",
    imageKey: "poster_path",
    action: "genre_filter",
    priority: "normal"
  }
};

/**
 * ============================================
 * MOOD DETECTION ENGINE
 * ============================================
 */

const MOOD_MAPPINGS = {
  happy: {
    emoji: "😊",
    genres: [35, 10751, 16, 10402], // Comedy, Family, Animation, Music
    keywords: "uplifting, fun, cheerful, lighthearted"
  },
  sad: {
    emoji: "😢",
    genres: [18, 10749], // Drama, Romance
    keywords: "emotional, touching, heartwarming"
  },
  excited: {
    emoji: "🤩",
    genres: [28, 12, 878], // Action, Adventure, Sci-Fi
    keywords: "thrilling, exciting, action-packed"
  },
  relaxed: {
    emoji: "😌",
    genres: [99, 10402, 36], // Documentary, Music, History
    keywords: "calm, peaceful, relaxing"
  },
  scared: {
    emoji: "😱",
    genres: [27, 9648], // Horror, Mystery
    keywords: "scary, suspenseful, thrilling"
  },
  romantic: {
    emoji: "💕",
    genres: [10749, 35], // Romance, Comedy
    keywords: "romantic, love, heartwarming"
  }
};

/**
 * ============================================
 * CORE NOTIFICATION FUNCTIONS
 * ============================================
 */

class NotificationService {
  
  /**
   * Send personalized notification to a user
   */
  static async sendNotification(userId, type, data, fcmToken) {
    try {
      const template = NOTIFICATION_TEMPLATES[type];
      if (!template) {
        throw new Error(`Unknown notification type: ${type}`);
      }

      // Build notification payload
      const message = {
        token: fcmToken,
        notification: {
          title: this.replaceTemplateVars(template.title, data),
          body: this.replaceTemplateVars(template.body, data),
          imageUrl: data[template.imageKey] 
            ? `https://image.tmdb.org/t/p/w500${data[template.imageKey]}`
            : null
        },
        data: {
          type: type,
          action: template.action,
          movieId: data.movieId?.toString() || '',
          ...data
        },
        android: {
          priority: template.priority,
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      // Send via FCM
      const response = await messaging.send(message);
      
      // Store notification in database
      await db.collection('notifications').add({
        userId,
        type,
        title: message.notification.title,
        body: message.notification.body,
        data,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        fcmResponse: response
      });

      console.log(`✅ Notification sent to user ${userId}:`, response);
      return response;

    } catch (error) {
      console.error(`❌ Error sending notification:`, error);
      throw error;
    }
  }

  /**
   * Send batch notifications (for millions of users)
   */
  static async sendBatchNotifications(notifications) {
    try {
      const messages = notifications.map(({ fcmToken, type, data }) => {
        const template = NOTIFICATION_TEMPLATES[type];
        return {
          token: fcmToken,
          notification: {
            title: this.replaceTemplateVars(template.title, data),
            body: this.replaceTemplateVars(template.body, data)
          },
          data: { type, ...data }
        };
      });

      // Send in batches of 500 (FCM limit)
      const batchSize = 500;
      const results = [];

      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const response = await messaging.sendAll(batch);
        results.push(response);
      }

      console.log(`✅ Batch notifications sent:`, results);
      return results;

    } catch (error) {
      console.error(`❌ Batch notification error:`, error);
      throw error;
    }
  }

  /**
   * Replace template variables with actual data
   */
  static replaceTemplateVars(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }
}

/**
 * ============================================
 * RECOMMENDATION ENGINE
 * ============================================
 */

class RecommendationEngine {
  
  /**
   * Get daily personalized picks
   */
  static async getDailyPicks(userId, count = 10) {
    try {
      const user = await db.collection('users').doc(userId).get();
      const userData = user.data();
      
      const watchHistory = userData.watchHistory || [];
      const favoriteGenres = await this.extractFavoriteGenres(watchHistory);
      const favoriteActors = await this.extractFavoriteActors(watchHistory);
      
      // Call TMDB API for recommendations
      const recommendations = await this.fetchMovieRecommendations({
        genres: favoriteGenres,
        actors: favoriteActors,
        limit: count
      });

      return recommendations;

    } catch (error) {
      console.error('Error generating daily picks:', error);
      throw error;
    }
  }

  /**
   * Extract favorite genres from watch history
   */
  static async extractFavoriteGenres(watchHistory) {
    const genreCount = {};
    
    watchHistory.forEach(item => {
      (item.genres || []).forEach(genre => {
        genreCount[genre.id] = (genreCount[genre.id] || 0) + 1;
      });
    });

    return Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => parseInt(id));
  }

  /**
   * Extract favorite actors from watch history
   */
  static async extractFavoriteActors(watchHistory) {
    const actorCount = {};
    
    watchHistory.forEach(item => {
      if (item.credits && item.credits.cast) {
        item.credits.cast.slice(0, 3).forEach(actor => {
          actorCount[actor.id] = (actorCount[actor.id] || 0) + 1;
        });
      }
    });

    return Object.entries(actorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => parseInt(id));
  }

  /**
   * Fetch movie recommendations from TMDB
   */
  static async fetchMovieRecommendations({ genres, actors, limit }) {
    // Implementation depends on your TMDB API integration
    // This is a placeholder
    return [];
  }

  /**
   * Get mood-based recommendations
   */
  static async getMoodRecommendations(userId, mood) {
    const moodConfig = MOOD_MAPPINGS[mood];
    if (!moodConfig) {
      throw new Error(`Invalid mood: ${mood}`);
    }

    // Fetch movies matching mood genres
    const recommendations = await this.fetchMovieRecommendations({
      genres: moodConfig.genres,
      limit: 10
    });

    return {
      mood,
      emoji: moodConfig.emoji,
      recommendations
    };
  }
}

/**
 * ============================================
 * SCHEDULED NOTIFICATION TRIGGERS
 * ============================================
 */

class NotificationScheduler {
  
  /**
   * Send daily picks to all active users
   * Schedule: Every day at 9 AM user's timezone
   */
  static async sendDailyPicksToAllUsers() {
    try {
      const users = await db.collection('users')
        .where('notificationPreferences.dailyPicks', '==', true)
        .get();

      const notifications = [];

      for (const userDoc of users.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;

        if (!fcmToken) continue;

        const picks = await RecommendationEngine.getDailyPicks(userId, 5);

        notifications.push({
          fcmToken,
          type: NOTIFICATION_TYPES.DAILY_PICKS,
          data: {
            userId,
            count: picks.length,
            userName: userData.name,
            movies: picks
          }
        });
      }

      // Send batch notifications
      await NotificationService.sendBatchNotifications(notifications);
      
      console.log(`✅ Daily picks sent to ${notifications.length} users`);

    } catch (error) {
      console.error('Error sending daily picks:', error);
    }
  }

  /**
   * Check for new releases from followed actors/directors
   * Schedule: Every 6 hours
   */
  static async checkNewReleases() {
    try {
      const users = await db.collection('users')
        .where('followedActors', '!=', [])
        .get();

      // Get new releases from last 24 hours
      const newReleases = await this.fetchNewReleases();

      for (const userDoc of users.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const followedActors = userData.followedActors || [];
        const followedDirectors = userData.followedDirectors || [];

        // Check if any new release features followed people
        for (const movie of newReleases) {
          const movieActors = movie.credits?.cast?.map(c => c.id) || [];
          const movieDirectors = movie.credits?.crew
            ?.filter(c => c.job === 'Director')
            ?.map(c => c.id) || [];

          const matchedActor = followedActors.find(id => movieActors.includes(id));
          const matchedDirector = followedDirectors.find(id => movieDirectors.includes(id));

          if (matchedActor || matchedDirector) {
            await NotificationService.sendNotification(
              userId,
              matchedActor ? NOTIFICATION_TYPES.ACTOR_RELEASE : NOTIFICATION_TYPES.DIRECTOR_RELEASE,
              {
                movieId: movie.id,
                title: movie.title,
                actorName: movie.credits.cast.find(c => c.id === matchedActor)?.name,
                directorName: movie.credits.crew.find(c => c.id === matchedDirector)?.name,
                backdrop_path: movie.backdrop_path
              },
              userData.fcmToken
            );
          }
        }
      }

    } catch (error) {
      console.error('Error checking new releases:', error);
    }
  }

  /**
   * Fetch new releases from last 24 hours
   */
  static async fetchNewReleases() {
    // Implementation with TMDB API
    return [];
  }

  /**
   * Send continue watching reminders
   * Schedule: Every 3 days
   */
  static async sendContinueWatchingReminders() {
    try {
      const users = await db.collection('users').get();

      for (const userDoc of users.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const watchHistory = userData.watchHistory || [];

        // Find incomplete movies (watched < 90%)
        const incomplete = watchHistory.filter(item => {
          const progress = item.progress || 0;
          return progress > 10 && progress < 90;
        });

        if (incomplete.length > 0) {
          const movie = incomplete[0]; // Most recent incomplete

          await NotificationService.sendNotification(
            userId,
            NOTIFICATION_TYPES.CONTINUE_WATCHING,
            {
              movieId: movie.id,
              title: movie.title,
              progress: movie.progress,
              backdrop_path: movie.backdrop_path
            },
            userData.fcmToken
          );
        }
      }

    } catch (error) {
      console.error('Error sending continue watching reminders:', error);
    }
  }
}

/**
 * ============================================
 * EXPORTS
 * ============================================
 */

module.exports = {
  NotificationService,
  RecommendationEngine,
  NotificationScheduler,
  NOTIFICATION_TYPES,
  NOTIFICATION_TEMPLATES,
  MOOD_MAPPINGS
};
