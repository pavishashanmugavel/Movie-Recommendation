/**
 * ============================================
 * NOTFLIX - FIREBASE FIRESTORE DATABASE SCHEMA
 * Production-Ready Database Structure
 * Optimized for Millions of Users
 * ============================================
 */

/**
 * Collection: users
 * Document ID: userId (Firebase Auth UID)
 * Purpose: Store user profile and preferences
 */
const userSchema = {
  // Basic Info
  userId: "string",
  email: "string",
  name: "string",
  avatar: "string (URL)",
  joinDate: "timestamp",
  
  // FCM Token for push notifications
  fcmToken: "string",
  fcmTokenUpdatedAt: "timestamp",
  
  // Notification Preferences
  notificationPreferences: {
    dailyPicks: "boolean",
    weeklyPicks: "boolean",
    newReleases: "boolean",
    actorReleases: "boolean",
    directorReleases: "boolean",
    continueWatching: "boolean",
    moodBased: "boolean",
    watchlistAlerts: "boolean",
    friendActivity: "boolean",
    achievements: "boolean",
    trending: "boolean",
    quietHours: {
      enabled: "boolean",
      startTime: "string (HH:MM)",
      endTime: "string (HH:MM)"
    }
  },
  
  // Following
  followedActors: [
    {
      id: "number",
      name: "string",
      followedAt: "timestamp"
    }
  ],
  
  followedDirectors: [
    {
      id: "number",
      name: "string",
      followedAt: "timestamp"
    }
  ],
  
  // Watch History (last 100 items)
  watchHistory: [
    {
      id: "number",
      title: "string",
      type: "string (movie|tv)",
      watchedAt: "timestamp",
      progress: "number (0-100)",
      genres: ["array of genre objects"],
      credits: {
        cast: ["array"],
        crew: ["array"]
      },
      rating: "number (user's rating)",
      backdrop_path: "string",
      poster_path: "string"
    }
  ],
  
  // My List
  myList: [
    {
      id: "number",
      title: "string",
      addedAt: "timestamp",
      available: "boolean",
      type: "string"
    }
  ],
  
  // User Statistics
  stats: {
    totalWatched: "number",
    totalWatchTime: "number (minutes)",
    favoriteGenres: ["array of genre IDs"],
    streak: {
      current: "number (days)",
      longest: "number (days)",
      lastWatchDate: "timestamp"
    }
  },
  
  // Achievements
  achievements: [
    {
      id: "string",
      name: "string",
      unlockedAt: "timestamp",
      category: "string"
    }
  ],
  
  // Social
  friends: ["array of user IDs"],
  
  // Privacy
  privacySettings: {
    shareWatchHistory: "boolean",
    showFriendActivity: "boolean"
  },
  
  // Metadata
  createdAt: "timestamp",
  updatedAt: "timestamp",
  lastActive: "timestamp"
};

/**
 * Collection: notifications
 * Document ID: Auto-generated
 * Purpose: Store notification history
 */
const notificationSchema = {
  userId: "string",
  type: "string",
  title: "string",
  body: "string",
  imageUrl: "string (URL)",
  
  data: {
    // Dynamic based on notification type
    movieId: "number",
    action: "string",
    // ... other custom fields
  },
  
  read: "boolean",
  readAt: "timestamp",
  
  delivered: "boolean",
  deliveredAt: "timestamp",
  
  fcmResponse: "string",
  
  createdAt: "timestamp"
};

// Indexes for notifications collection
const notificationIndexes = [
  { fields: ["userId", "createdAt"], order: "desc" },
  { fields: ["userId", "read"], order: "desc" },
  { fields: ["type", "createdAt"], order: "desc" }
];

/**
 * Collection: movieMetadata
 * Document ID: movieId (TMDB ID)
 * Purpose: Cache movie data to reduce TMDB API calls
 */
const movieMetadataSchema = {
  movieId: "number",
  title: "string",
  overview: "string",
  releaseDate: "timestamp",
  genres: ["array"],
  credits: {
    cast: ["array"],
    crew: ["array"]
  },
  backdrop_path: "string",
  poster_path: "string",
  vote_average: "number",
  runtime: "number",
  
  // Tracking
  viewCount: "number",
  addedToListCount: "number",
  
  // Cache management
  lastUpdated: "timestamp",
  ttl: "number (seconds)"
};

/**
 * Collection: userActivityLog
 * Document ID: Auto-generated
 * Purpose: Track user activity for analytics and ML
 * TTL: 90 days (auto-delete)
 */
const activityLogSchema = {
  userId: "string",
  action: "string (watch|rate|add_to_list|share|follow)",
  movieId: "number",
  metadata: {
    // Action-specific data
  },
  timestamp: "timestamp",
  device: "string",
  location: "geopoint"
};

/**
 * Collection: scheduledNotifications
 * Document ID: Auto-generated
 * Purpose: Queue for scheduled notifications
 */
const scheduledNotificationSchema = {
  userId: "string",
  type: "string",
  data: "object",
  scheduledFor: "timestamp",
  status: "string (pending|sent|failed)",
  attempts: "number",
  lastAttempt: "timestamp",
  error: "string",
  createdAt: "timestamp"
};

/**
 * Collection: userSessions
 * Document ID: sessionId
 * Purpose: Track active user sessions
 */
const sessionSchema = {
  userId: "string",
  deviceId: "string",
  fcmToken: "string",
  platform: "string (web|android|ios)",
  lastActive: "timestamp",
  ipAddress: "string",
  userAgent: "string",
  createdAt: "timestamp"
};

/**
 * ============================================
 * FIRESTORE SECURITY RULES
 * ============================================
 */

const firestoreSecurityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Allow limited read for friends
      allow read: if request.auth != null && 
                     resource.data.privacySettings.shareWatchHistory == true &&
                     request.auth.uid in resource.data.friends;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid &&
                       request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read', 'readAt']);
    }
    
    // Movie metadata (public read)
    match /movieMetadata/{movieId} {
      allow read: if true;
      allow write: if false; // Only backend can write
    }
    
    // Activity log
    match /userActivityLog/{logId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
`;

/**
 * ============================================
 * COMPOSITE INDEXES (for Firestore)
 * ============================================
 */

const compositeIndexes = [
  // Notifications by user and time
  {
    collection: "notifications",
    fields: [
      { name: "userId", order: "ASCENDING" },
      { name: "createdAt", order: "DESCENDING" }
    ]
  },
  
  // Unread notifications
  {
    collection: "notifications",
    fields: [
      { name: "userId", order: "ASCENDING" },
      { name: "read", order: "ASCENDING" },
      { name: "createdAt", order: "DESCENDING" }
    ]
  },
  
  // Watch history by user
  {
    collection: "users",
    fields: [
      { name: "userId", order: "ASCENDING" },
      { name: "watchHistory.watchedAt", order: "DESCENDING" }
    ]
  },
  
  // Scheduled notifications
  {
    collection: "scheduledNotifications",
    fields: [
      { name: "status", order: "ASCENDING" },
      { name: "scheduledFor", order: "ASCENDING" }
    ]
  }
];

/**
 * ============================================
 * EXPORTS
 * ============================================
 */

module.exports = {
  userSchema,
  notificationSchema,
  movieMetadataSchema,
  activityLogSchema,
  scheduledNotificationSchema,
  sessionSchema,
  firestoreSecurityRules,
  compositeIndexes
};
