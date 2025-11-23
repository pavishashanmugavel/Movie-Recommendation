/**
 * ============================================
 * NOTFLIX - COMPLETE DATABASE SCHEMA
 * Firebase Firestore Collections & Documents
 * ============================================
 */

/**
 * Collection: users
 * Document ID: userId (Firebase Auth UID)
 */
const userSchema = {
  userId: "string",
  email: "string",
  name: "string",
  avatar: "string (URL)",
  joinDate: "timestamp",
  
  // FCM Token
  fcmToken: "string",
  
  // Ratings map (contentId → rating)
  ratings: {
    "movieId1": 4.5,
    "movieId2": 3.0
  },
  
  // Language Preferences (auto-learned)
  languagePreference: {
    "en": 0.6,  // 60% English content watched
    "es": 0.2,  // 20% Spanish content watched
    "ja": 0.1   // 10% Japanese content watched
  },
  
  // Watch History (last 100 items)
  watchHistory: [
    {
      id: "number",
      title: "string",
      type: "string (movie|tv)",
      watchedAt: "timestamp",
      completionRate: "number (0-100)",
      duration: "number (minutes)",
      genres: ["array of genre objects"],
      credits: {
        cast: ["array"],
        crew: ["array"]
      },
      original_language: "string",
      rating: "number (user's rating)",
      backdrop_path: "string",
      poster_path: "string",
      vote_average: "number",
      production_companies: ["array"]
    }
  ],
  
  // My List
  myList: [
    {
      id: "number",
      title: "string",
      addedAt: "timestamp",
      watchCount: "number",
      type: "string",
      release_date: "string",
      first_air_date: "string"
    }
  ],
  
  // Statistics
  stats: {
    totalWatched: "number",
    totalWatchTime: "number (minutes)",
    favoriteGenres: ["array of genre IDs"],
    favoriteActors: ["array of person IDs"],
    favoriteDirectors: ["array of person IDs"],
    avgCompletionRate: "number (0-100)",
    streak: {
      current: "number (days)",
      longest: "number (days)",
      lastWatchDate: "timestamp"
    }
  },
  
  // Notification Preferences
  notificationPreferences: {
    dailyPicks: "boolean",
    newReleases: "boolean",
    recommendations: "boolean"
  },
  
  createdAt: "timestamp",
  updatedAt: "timestamp",
  lastActive: "timestamp"
};

/**
 * Collection: ratings
 * Document ID: {userId}_{contentId}
 * Purpose: Store all user ratings
 */
const ratingSchema = {
  userId: "string",
  contentId: "string",
  contentType: "string (movie|tv)",
  rating: "number (1-5)",
  createdAt: "timestamp",
  updatedAt: "timestamp"
};

// Composite Indexes for ratings
const ratingIndexes = [
  { fields: ["contentId", "rating"], order: ["ASC", "DESC"] },
  { fields: ["userId", "createdAt"], order: ["ASC", "DESC"] }
];

/**
 * Collection: reviews
 * Document ID: Auto-generated
 * Purpose: Store user reviews
 */
const reviewSchema = {
  userId: "string",
  userName: "string",
  userAvatar: "string (URL)",
  contentId: "string",
  contentType: "string (movie|tv)",
  rating: "number (1-5)",
  reviewText: "string",
  helpfulCount: "number",
  helpfulBy: ["array of user IDs who marked this helpful"],
  createdAt: "timestamp",
  updatedAt: "timestamp"
};

// Composite Indexes for reviews
const reviewIndexes = [
  { fields: ["contentId", "createdAt"], order: ["ASC", "DESC"] },
  { fields: ["contentId", "helpfulCount"], order: ["ASC", "DESC"] },
  { fields: ["contentId", "rating"], order: ["ASC", "DESC"] },
  { fields: ["userId", "createdAt"], order: ["ASC", "DESC"] }
];

/**
 * Collection: contentMetadata
 * Document ID: contentId (TMDB ID)
 * Purpose: Store calculated metadata for content
 */
const contentMetadataSchema = {
  contentId: "string",
  contentType: "string (movie|tv)",
  
  // Rating Stats
  averageRating: "number (0-5)",
  totalRatings: "number",
  
  // Review Stats
  totalReviews: "number",
  totalHelpfulVotes: "number",
  
  // Popularity Score (0-100)
  // Formula: (avgRating * 0.4) + (totalRatings * 0.2) + (totalReviews * 0.2) + (helpfulVotes * 0.1) + (recentWatches * 0.1)
  popularityScore: "number (0-100)",
  
  // Watch Stats
  recentWatches: "number (last 7 days)",
  totalWatches: "number (all time)",
  
  // Trending Score
  trendingScore: "number",
  
  // Metadata
  lastUpdated: "timestamp",
  lastPopularityUpdate: "timestamp"
};

// Composite Indexes for contentMetadata
const contentMetadataIndexes = [
  { fields: ["popularityScore"], order: ["DESC"] },
  { fields: ["trendingScore"], order: ["DESC"] },
  { fields: ["averageRating"], order: ["DESC"] },
  { fields: ["contentType", "popularityScore"], order: ["ASC", "DESC"] }
];

/**
 * Collection: watchHistory
 * Document ID: Auto-generated
 * Purpose: Track all watch events (for analytics)
 */
const watchHistorySchema = {
  userId: "string",
  contentId: "string",
  contentType: "string (movie|tv)",
  completionRate: "number (0-100)",
  duration: "number (minutes)",
  watchedAt: "timestamp",
  device: "string",
  location: "geopoint"
};

// Composite Indexes for watchHistory
const watchHistoryIndexes = [
  { fields: ["userId", "watchedAt"], order: ["ASC", "DESC"] },
  { fields: ["contentId", "watchedAt"], order: ["ASC", "DESC"] },
  { fields: ["watchedAt"], order: ["DESC"] }
];

/**
 * Collection: recommendations
 * Document ID: {userId}
 * Purpose: Store pre-calculated recommendations (cached)
 */
const recommendationSchema = {
  userId: "string",
  
  // Top Picks
  topPicks: [
    {
      id: "number",
      title: "string",
      score: "number (recommendation score)",
      reasons: ["array of reasons: 'genre match', 'actor match', etc."],
      type: "string (movie|tv)",
      poster_path: "string",
      backdrop_path: "string"
    }
  ],
  
  // Page-specific recommendations
  homePageRecs: ["array of content IDs"],
  tvPageRecs: ["array of TV show IDs"],
  moviesPageRecs: ["array of movie IDs"],
  
  // Language-based recommendations
  languageRecs: {
    "en": ["array of English content IDs"],
    "es": ["array of Spanish content IDs"]
  },
  
  // Metadata
  generatedAt: "timestamp",
  expiresAt: "timestamp",
  lastUpdated: "timestamp"
};

/**
 * Collection: popularityRanking
 * Document ID: Auto-generated or date-based (e.g., "2025-11-20")
 * Purpose: Daily popularity rankings
 */
const popularityRankingSchema = {
  date: "string (YYYY-MM-DD)",
  
  // Overall Rankings
  overall: [
    {
      contentId: "string",
      rank: "number",
      popularityScore: "number",
      change: "number (rank change from previous day)"
    }
  ],
  
  // Movies Only
  movies: ["array similar to overall"],
  
  // TV Shows Only
  tvShows: ["array similar to overall"],
  
  // By Language
  byLanguage: {
    "en": ["array"],
    "es": ["array"]
  },
  
  createdAt: "timestamp"
};

/**
 * Collection: trendingContent
 * Document ID: timeWindow (e.g., "today", "week", "month")
 * Purpose: Trending content by time window
 */
const trendingContentSchema = {
  timeWindow: "string (today|week|month)",
  
  content: [
    {
      contentId: "string",
      trendingScore: "number",
      watchCount: "number",
      ratingCount: "number",
      reviewCount: "number"
    }
  ],
  
  lastUpdated: "timestamp"
};

/**
 * ============================================
 * EXAMPLE JSON DOCUMENTS
 * ============================================
 */

// Example User Document
const exampleUser = {
  userId: "user123",
  email: "user@example.com",
  name: "John Doe",
  avatar: "https://example.com/avatar.jpg",
  joinDate: new Date("2024-01-15"),
  fcmToken: "fcm_token_here",
  
  ratings: {
    "550": 4.5,      // Fight Club
    "13": 5.0,       // Forrest Gump
    "238": 3.5       // The Godfather
  },
  
  languagePreference: {
    "en": 0.7,
    "es": 0.2,
    "ja": 0.1
  },
  
  watchHistory: [
    {
      id: 550,
      title: "Fight Club",
      type: "movie",
      watchedAt: new Date("2025-11-19"),
      completionRate: 95,
      duration: 139,
      genres: [{ id: 18, name: "Drama" }],
      credits: {
        cast: [
          { id: 287, name: "Brad Pitt", character: "Tyler Durden" }
        ],
        crew: [
          { id: 7467, name: "David Fincher", job: "Director" }
        ]
      },
      original_language: "en",
      rating: 4.5,
      vote_average: 8.4
    }
  ],
  
  myList: [
    {
      id: 13,
      title: "Forrest Gump",
      addedAt: new Date("2025-11-10"),
      watchCount: 2,
      type: "movie",
      release_date: "1994-07-06"
    }
  ],
  
  stats: {
    totalWatched: 45,
    totalWatchTime: 5400,
    favoriteGenres: [18, 28, 878],
    favoriteActors: [287, 3223, 6193],
    favoriteDirectors: [7467, 138],
    avgCompletionRate: 85,
    streak: {
      current: 7,
      longest: 15,
      lastWatchDate: new Date("2025-11-20")
    }
  },
  
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2025-11-20"),
  lastActive: new Date("2025-11-20")
};

// Example Content Metadata Document
const exampleContentMetadata = {
  contentId: "550",
  contentType: "movie",
  averageRating: 4.3,
  totalRatings: 15420,
  totalReviews: 3245,
  totalHelpfulVotes: 8940,
  popularityScore: 87.5,
  recentWatches: 2340,
  totalWatches: 45678,
  trendingScore: 92.3,
  lastUpdated: new Date("2025-11-20"),
  lastPopularityUpdate: new Date("2025-11-20")
};

// Example Review Document
const exampleReview = {
  userId: "user123",
  userName: "John Doe",
  userAvatar: "https://example.com/avatar.jpg",
  contentId: "550",
  contentType: "movie",
  rating: 5,
  reviewText: "Absolutely mind-blowing! One of the best films ever made. The plot twist was incredible and the performances were outstanding.",
  helpfulCount: 234,
  helpfulBy: ["user456", "user789"],
  createdAt: new Date("2025-11-15"),
  updatedAt: new Date("2025-11-15")
};

// Example Top Picks Response
const exampleTopPicksResponse = {
  success: true,
  topPicks: [
    {
      id: 680,
      title: "Pulp Fiction",
      score: 92.5,
      reasons: ["Genre match: Drama", "Director match: Quentin Tarantino", "High rating"],
      type: "movie",
      poster_path: "/path.jpg",
      backdrop_path: "/path.jpg",
      vote_average: 8.5,
      genres: [{ id: 18, name: "Drama" }]
    }
  ]
};

// Example Home Page Response
const exampleHomePageResponse = {
  success: true,
  content: {
    continueWatching: [
      {
        id: 550,
        title: "Fight Club",
        completionRate: 65,
        watchedAt: "2025-11-19T10:30:00Z"
      }
    ],
    topPicks: [...exampleTopPicksResponse.topPicks],
    trending: [],
    genreBased: {
      drama: [],
      action: []
    },
    languageBased: {
      spanish: [],
      japanese: []
    },
    mixed: true
  }
};

/**
 * ============================================
 * EXPORTS
 * ============================================
 */

module.exports = {
  userSchema,
  ratingSchema,
  reviewSchema,
  contentMetadataSchema,
  watchHistorySchema,
  recommendationSchema,
  popularityRankingSchema,
  trendingContentSchema,
  
  // Indexes
  ratingIndexes,
  reviewIndexes,
  contentMetadataIndexes,
  watchHistoryIndexes,
  
  // Examples
  exampleUser,
  exampleContentMetadata,
  exampleReview,
  exampleTopPicksResponse,
  exampleHomePageResponse
};
