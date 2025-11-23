/**
 * ============================================
 * NOTFLIX - ADVANCED RECOMMENDATION ENGINE
 * Hybrid Content + Behavior-Based System
 * ============================================
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * ============================================
 * RECOMMENDATION ALGORITHM
 * ============================================
 */

class RecommendationEngine {
  
  /**
   * Generate Top Picks for User
   * Uses hybrid approach: Content-based + Collaborative Filtering
   */
  static async generateTopPicks(userId, limit = 20) {
    try {
      console.log(`🎯 Generating top picks for user ${userId}...`);
      
      // Get user data
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      const watchHistory = userData.watchHistory || [];
      const ratings = userData.ratings || {};
      const languagePreference = userData.languagePreference || {};
      
      if (watchHistory.length === 0) {
        // No history - return trending content
        return await this.getTrendingContent(limit);
      }
      
      // Calculate user preferences
      const preferences = this.analyzeUserPreferences(watchHistory, ratings);
      
      // Get recommendations from multiple sources
      const [
        genreBasedRecs,
        actorBasedRecs,
        directorBasedRecs,
        languageBasedRecs,
        similarityBasedRecs
      ] = await Promise.all([
        this.getGenreBasedRecommendations(preferences.topGenres, limit),
        this.getActorBasedRecommendations(preferences.topActors, limit),
        this.getDirectorBasedRecommendations(preferences.topDirectors, limit),
        this.getLanguageBasedRecommendations(preferences.topLanguages, limit),
        this.getSimilarityBasedRecommendations(watchHistory, limit)
      ]);
      
      // Merge and score recommendations
      const scoredRecs = this.scoreAndMergeRecommendations({
        genreBasedRecs,
        actorBasedRecs,
        directorBasedRecs,
        languageBasedRecs,
        similarityBasedRecs,
        preferences,
        watchHistory
      });
      
      // Filter out already watched
      const watchedIds = new Set(watchHistory.map(item => item.id));
      const filtered = scoredRecs.filter(rec => !watchedIds.has(rec.id));
      
      // Sort by score and return top N
      return filtered
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      
    } catch (error) {
      console.error('Error generating top picks:', error);
      throw error;
    }
  }
  
  /**
   * Analyze user preferences from watch history and ratings
   */
  static analyzeUserPreferences(watchHistory, ratings) {
    const genreCounts = {};
    const actorCounts = {};
    const directorCounts = {};
    const languageCounts = {};
    const completionRates = [];
    
    watchHistory.forEach(item => {
      const weight = ratings[item.id] ? ratings[item.id] / 5 : 0.5; // Rating influence
      const completionWeight = item.completionRate || 0.5;
      
      // Genre analysis
      (item.genres || []).forEach(genre => {
        genreCounts[genre.id] = (genreCounts[genre.id] || 0) + weight * completionWeight;
      });
      
      // Actor analysis
      if (item.credits && item.credits.cast) {
        item.credits.cast.slice(0, 3).forEach(actor => {
          actorCounts[actor.id] = (actorCounts[actor.id] || 0) + weight * completionWeight;
        });
      }
      
      // Director analysis
      if (item.credits && item.credits.crew) {
        item.credits.crew
          .filter(person => person.job === 'Director')
          .forEach(director => {
            directorCounts[director.id] = (directorCounts[director.id] || 0) + weight * completionWeight;
          });
      }
      
      // Language analysis
      if (item.original_language) {
        languageCounts[item.original_language] = (languageCounts[item.original_language] || 0) + weight;
      }
      
      // Completion rate tracking
      if (item.completionRate !== undefined) {
        completionRates.push(item.completionRate);
      }
    });
    
    // Calculate average completion rate
    const avgCompletionRate = completionRates.length > 0
      ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
      : 0.5;
    
    return {
      topGenres: this.getTopItems(genreCounts, 5),
      topActors: this.getTopItems(actorCounts, 10),
      topDirectors: this.getTopItems(directorCounts, 5),
      topLanguages: this.getTopItems(languageCounts, 3),
      avgCompletionRate,
      totalWatched: watchHistory.length
    };
  }
  
  /**
   * Get top N items from counts object
   */
  static getTopItems(counts, n) {
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([id, count]) => ({ id: parseInt(id) || id, count }));
  }
  
  /**
   * Score and merge recommendations from multiple sources
   */
  static scoreAndMergeRecommendations({
    genreBasedRecs,
    actorBasedRecs,
    directorBasedRecs,
    languageBasedRecs,
    similarityBasedRecs,
    preferences,
    watchHistory
  }) {
    const scoreMap = new Map();
    
    // Scoring weights
    const weights = {
      genre: 0.25,
      actor: 0.20,
      director: 0.20,
      language: 0.15,
      similarity: 0.20
    };
    
    // Score genre-based recommendations
    genreBasedRecs.forEach(rec => {
      const score = this.calculateScore(rec, preferences, 'genre') * weights.genre;
      this.addOrUpdateScore(scoreMap, rec, score);
    });
    
    // Score actor-based recommendations
    actorBasedRecs.forEach(rec => {
      const score = this.calculateScore(rec, preferences, 'actor') * weights.actor;
      this.addOrUpdateScore(scoreMap, rec, score);
    });
    
    // Score director-based recommendations
    directorBasedRecs.forEach(rec => {
      const score = this.calculateScore(rec, preferences, 'director') * weights.director;
      this.addOrUpdateScore(scoreMap, rec, score);
    });
    
    // Score language-based recommendations
    languageBasedRecs.forEach(rec => {
      const score = this.calculateScore(rec, preferences, 'language') * weights.language;
      this.addOrUpdateScore(scoreMap, rec, score);
    });
    
    // Score similarity-based recommendations
    similarityBasedRecs.forEach(rec => {
      const score = weights.similarity;
      this.addOrUpdateScore(scoreMap, rec, score);
    });
    
    return Array.from(scoreMap.values());
  }
  
  /**
   * Calculate recommendation score based on type
   */
  static calculateScore(rec, preferences, type) {
    let score = 0;
    
    switch (type) {
      case 'genre':
        if (rec.genres) {
          rec.genres.forEach(genre => {
            const pref = preferences.topGenres.find(g => g.id === genre.id);
            if (pref) score += pref.count;
          });
        }
        break;
      
      case 'actor':
        if (rec.credits && rec.credits.cast) {
          rec.credits.cast.forEach(actor => {
            const pref = preferences.topActors.find(a => a.id === actor.id);
            if (pref) score += pref.count;
          });
        }
        break;
      
      case 'director':
        if (rec.credits && rec.credits.crew) {
          rec.credits.crew
            .filter(person => person.job === 'Director')
            .forEach(director => {
              const pref = preferences.topDirectors.find(d => d.id === director.id);
              if (pref) score += pref.count;
            });
        }
        break;
      
      case 'language':
        if (rec.original_language) {
          const pref = preferences.topLanguages.find(l => l.id === rec.original_language);
          if (pref) score += pref.count;
        }
        break;
    }
    
    // Boost score based on popularity and rating
    if (rec.vote_average) {
      score *= (1 + rec.vote_average / 10);
    }
    
    return score;
  }
  
  /**
   * Add or update score in score map
   */
  static addOrUpdateScore(scoreMap, rec, score) {
    if (scoreMap.has(rec.id)) {
      const existing = scoreMap.get(rec.id);
      existing.score += score;
    } else {
      scoreMap.set(rec.id, { ...rec, score });
    }
  }
  
  /**
   * Get genre-based recommendations
   */
  static async getGenreBasedRecommendations(topGenres, limit) {
    // Call TMDB API for genre-based discovery
    // This is a placeholder - implement TMDB API call
    return [];
  }
  
  /**
   * Get actor-based recommendations
   */
  static async getActorBasedRecommendations(topActors, limit) {
    // Call TMDB API for actor-based discovery
    return [];
  }
  
  /**
   * Get director-based recommendations
   */
  static async getDirectorBasedRecommendations(topDirectors, limit) {
    // Call TMDB API for director-based discovery
    return [];
  }
  
  /**
   * Get language-based recommendations
   */
  static async getLanguageBasedRecommendations(topLanguages, limit) {
    // Call TMDB API for language-based discovery
    return [];
  }
  
  /**
   * Get similarity-based recommendations
   */
  static async getSimilarityBasedRecommendations(watchHistory, limit) {
    // Get similar movies to recently watched
    return [];
  }
  
  /**
   * Get trending content for new users
   */
  static async getTrendingContent(limit) {
    // Call TMDB API for trending content
    return [];
  }
  
  /**
   * Generate page-specific content
   */
  static async generatePageContent(userId, page, options = {}) {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    switch (page) {
      case 'home':
        return await this.generateHomePageContent(userData, options);
      
      case 'tv':
        return await this.generateTVPageContent(userData, options);
      
      case 'movies':
        return await this.generateMoviesPageContent(userData, options);
      
      case 'new-popular':
        return await this.generateNewPopularContent(userData, options);
      
      case 'my-list':
        return await this.generateMyListContent(userData, options);
      
      case 'browse-languages':
        return await this.generateLanguagePageContent(userData, options);
      
      default:
        return {};
    }
  }
  
  /**
   * Generate Home Page Content
   */
  static async generateHomePageContent(userData, options) {
    const watchHistory = userData.watchHistory || [];
    
    return {
      continueWatching: this.getContinueWatching(watchHistory),
      topPicks: await this.generateTopPicks(userData.userId, 20),
      trending: await this.getTrendingContent(20),
      genreBased: await this.getGenreBasedSuggestions(userData),
      languageBased: await this.getLanguageBasedSuggestions(userData),
      mixed: true // Movies + Shows
    };
  }
  
  /**
   * Get Continue Watching items
   */
  static getContinueWatching(watchHistory) {
    return watchHistory
      .filter(item => item.completionRate > 0 && item.completionRate < 90)
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
      .slice(0, 10);
  }
  
  /**
   * Generate TV Page Content (TV Shows ONLY)
   */
  static async generateTVPageContent(userData, options) {
    return {
      recommendedShows: await this.getRecommendedTVShows(userData),
      popularShows: await this.getPopularTVShows(),
      topRatedShows: await this.getTopRatedTVShows(),
      trendingShows: await this.getTrendingTVShows(),
      tvOnly: true
    };
  }
  
  /**
   * Generate Movies Page Content (Movies ONLY)
   */
  static async generateMoviesPageContent(userData, options) {
    return {
      recommendedMovies: await this.getRecommendedMovies(userData),
      popularMovies: await this.getPopularMovies(),
      newlyAdded: await this.getNewlyAddedMovies(),
      topRated: await this.getTopRatedMovies(),
      moviesOnly: true
    };
  }
  
  /**
   * Generate New & Popular Content
   */
  static async generateNewPopularContent(userData, options) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    return {
      newReleases: await this.getNewReleases(thirtyDaysAgo),
      currentlyTrending: await this.getCurrentTrending(),
      highestRated: await this.getHighestRated(),
      noOldContent: true
    };
  }
  
  /**
   * Generate My List Content
   */
  static async generateMyListContent(userData, options) {
    const myList = userData.myList || [];
    
    // Sort options
    const sortBy = options.sortBy || 'recentlyAdded';
    
    switch (sortBy) {
      case 'recentlyAdded':
        return myList.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      
      case 'mostWatched':
        return myList.sort((a, b) => (b.watchCount || 0) - (a.watchCount || 0));
      
      case 'releaseDate':
        return myList.sort((a, b) => 
          new Date(b.release_date || b.first_air_date) - 
          new Date(a.release_date || a.first_air_date)
        );
      
      default:
        return myList;
    }
  }
  
  /**
   * Generate Browse by Languages Content
   */
  static async generateLanguagePageContent(userData, options) {
    const preferences = this.analyzeUserPreferences(
      userData.watchHistory || [],
      userData.ratings || {}
    );
    
    const languages = ['en', 'es', 'ja', 'ko', 'fr', 'hi', 'zh', 'de'];
    const content = {};
    
    // Prioritize user's preferred languages
    const sortedLanguages = this.sortLanguagesByPreference(
      languages,
      preferences.topLanguages
    );
    
    for (const lang of sortedLanguages) {
      content[lang] = {
        trending: await this.getTrendingByLanguage(lang),
        popular: await this.getPopularByLanguage(lang),
        recommended: await this.getRecommendedByLanguage(userData, lang)
      };
    }
    
    return content;
  }
  
  /**
   * Sort languages by user preference
   */
  static sortLanguagesByPreference(languages, topLanguages) {
    const preferredLangs = topLanguages.map(l => l.id);
    
    return languages.sort((a, b) => {
      const aIndex = preferredLangs.indexOf(a);
      const bIndex = preferredLangs.indexOf(b);
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });
  }
}

/**
 * ============================================
 * EXPORTS
 * ============================================
 */

module.exports = {
  RecommendationEngine
};
