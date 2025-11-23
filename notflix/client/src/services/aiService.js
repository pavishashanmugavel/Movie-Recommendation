// src/services/aiService.js
// Lightweight "AI" service that uses TMDB data and simple intent detection
// so the chatbot keeps working even without OpenAI.

import { apiService } from './api';

const formatTitleLine = (item) => {
  const title = item.title || item.name || 'Unknown title';
  const date = item.release_date || item.first_air_date;
  const year = date ? new Date(date).getFullYear() : 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  return `${title} (${year}) • ⭐ ${rating}/10`;
};

const formatOverview = (item) => {
  if (!item.overview) return 'No overview available.';
  return item.overview.length > 420 ? `${item.overview.slice(0, 417)}...` : item.overview;
};

export const aiService = {
  async generateAIResponse(messages, context = {}) {
    const last = messages[messages.length - 1];
    const raw = last?.content || '';
    const input = raw.toLowerCase();

    // 1) Popular / trending movies
    if (input.includes('popular') || input.includes('trending') || input.includes('top')) {
      try {
        const data = await apiService.getMovies('popular', 1);
        const results = data.results?.slice(0, 5) || [];
        if (!results.length) {
          return 'I could not fetch popular movies right now. Please try again later.';
        }
        const lines = results.map((m, i) => `${i + 1}. ${formatTitleLine(m)}`);
        return `Here are some popular movies right now:\n\n${lines.join('\n')}`;
      } catch (e) {
        console.error('TMDB popular error:', e);
        return 'I had trouble fetching popular movies. Please try again later.';
      }
    }

    // 2) "Tell me about <title>" or general "about" queries
    const aboutMatch = raw.match(/tell me about (.+)/i) || raw.match(/about (.+)/i);
    if (aboutMatch && aboutMatch[1]) {
      const query = aboutMatch[1].trim();
      try {
        const search = await apiService.search(query, 1);
        const first = search.results?.[0];
        if (!first) {
          return `I couldn't find anything called "${query}". Try another title or check the spelling.`;
        }
        const type = first.media_type === 'tv' ? 'tv' : 'movie';
        const details = await apiService.getDetails(first.id, type);
        const header = formatTitleLine(details);
        const overview = formatOverview(details);
        return `${header}\n\n${overview}`;
      } catch (e) {
        console.error('TMDB details error:', e);
        return 'I had trouble fetching information about that title. Please try again later.';
      }
    }

    // 3) Recommendations based on viewing history
    if (input.includes('recommend') || input.includes('suggest')) {
      const history = context.viewingHistory || [];
      if (!history.length) {
        return 'You have no viewing history yet. Start watching something and I will recommend similar titles for you!';
      }
      const lastWatched = history[0];
      const baseTitle = lastWatched.title || lastWatched.name || 'your recent watch';
      return `Based on ${baseTitle}, you might enjoy similar thrillers and sci‑fi movies. I recommend checking the popular section and continuing any unfinished series in your My List.`;
    }

    // 4) Generic help text
    const name = context.userProfile?.name || 'there';
    return `Hi ${name}! I can help you with movies and TV shows even without a cloud AI. You can ask me things like:\n\n• What are some popular movies?\n• Tell me about Inception\n• Recommend something to watch next\n\nWhat would you like to know?`;
  }
};