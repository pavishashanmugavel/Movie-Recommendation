const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjM2FjYzVlOGIxYTljNzM2ZGM3OThjNDllM2M5MDY5ZiIsIm5iZiI6MTc1MTc3NjU5MS4yODEsInN1YiI6IjY4NjlmZDRmOWRiZTkxODkxNjEwMzI4YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.wQarnuqPkkSaKXTyjUmHfFt32hF8O6d828L_pqvi28s';

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${API_KEY}`
};

export const apiService = {
  // Movies
  getMovies: async (category = 'now_playing', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/movie/${category}?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // TV Shows
  getTVShows: async (category = 'popular', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/tv/${category}?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // New & Popular (Trending)
  getTrending: async (mediaType = 'all', timeWindow = 'week', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/trending/${mediaType}/${timeWindow}?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Search
  search: async (query, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Movie/TV Show Details
  getDetails: async (id, type = 'movie') => {
    const response = await fetch(`${API_BASE_URL}/${type}/${id}?language=en-US`, { headers });
    return response.json();
  },

  // Genres for Browse by Languages
  getGenres: async (type = 'movie') => {
    const response = await fetch(`${API_BASE_URL}/genre/${type}/list?language=en-US`, { headers });
    return response.json();
  },

  // Movies/TV Shows by Genre
  getByGenre: async (type = 'movie', genreId, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/discover/${type}?with_genres=${genreId}&language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Top Rated
  getTopRated: async (type = 'movie', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/${type}/top_rated?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Upcoming Movies
  getUpcoming: async (page = 1) => {
    const response = await fetch(`${API_BASE_URL}/movie/upcoming?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Popular
  getPopular: async (type = 'movie', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/${type}/popular?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Similar titles for a given content id
  getSimilar: async (type = 'movie', id, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/${type}/${id}/similar?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Videos (trailers, teasers) for a given content id
  getVideos: async (type = 'movie', id) => {
    const response = await fetch(`${API_BASE_URL}/${type}/${id}/videos?language=en-US`, { headers });
    return response.json();
  },

  // Search People (actors/directors)
  searchPerson: async (query, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/search/person?query=${encodeURIComponent(query)}&language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Search Companies (production companies)
  searchCompany: async (query, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/search/company?query=${encodeURIComponent(query)}&page=${page}`, { headers });
    return response.json();
  },

  // Discover movies with flexible filters
  discoverMovies: async ({
    withGenres,        // comma-separated genre IDs
    withPeople,        // comma-separated person IDs (actors/directors)
    withCompanies,     // comma-separated company IDs
    withOriginalLanguage, // ISO 639-1 language code
    sortBy = 'popularity.desc',
    page = 1
  } = {}) => {
    const params = new URLSearchParams({ language: 'en-US', sort_by: sortBy, page: String(page) });
    if (withGenres) params.set('with_genres', withGenres);
    if (withPeople) params.set('with_people', withPeople);
    if (withCompanies) params.set('with_companies', withCompanies);
    if (withOriginalLanguage) params.set('with_original_language', withOriginalLanguage);
    const response = await fetch(`${API_BASE_URL}/discover/movie?${params.toString()}`, { headers });
    return response.json();
  }
};
