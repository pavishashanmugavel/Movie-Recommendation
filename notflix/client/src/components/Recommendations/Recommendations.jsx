import React, { useEffect, useMemo, useState } from 'react';
import './Recommendations.css';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { apiService } from '../../services/api';

// helper to infer media type when details object lacks media_type
const inferTypeFromItem = (item) => {
  if (!item) return 'movie';
  if (item.first_air_date || item.number_of_seasons) return 'tv';
  return 'movie';
};

const Recommendations = () => {
  const { viewingHistory, addNotification, isInMyList, addToMyList, removeFromMyList } = useAppContext();

  // Top-level filter category and selections
  const [filterCategory, setFilterCategory] = useState('genre'); // 'genre' | 'person' | 'company'
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  // search inputs and suggestions
  const [personQuery, setPersonQuery] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const [genreSuggestions, setGenreSuggestions] = useState([]);
  const [personSuggestions, setPersonSuggestions] = useState([]);
  const [companySuggestions, setCompanySuggestions] = useState([]);

  const [results, setResults] = useState([]);
  const [baseResults, setBaseResults] = useState([]); // seed: similar to latest watched
  const [loading, setLoading] = useState(false);

  // Seed genres from viewing history (top 3 most frequent genre IDs)
  const seedGenreIdsFromHistory = useMemo(() => {
    const counts = new Map();
    viewingHistory.forEach(item => {
      (item.genres || []).forEach(g => {
        if (g.id) counts.set(g.id, (counts.get(g.id) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
  }, [viewingHistory]);

  // Initial load: similar to most recently watched item; fallback to seed genres then popular
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        // seed from latest history similar
        if (viewingHistory.length > 0) {
          const latest = viewingHistory[0];
          const type = inferTypeFromItem(latest);
          const data = await apiService.getSimilar(type, latest.id);
          if (data?.results?.length) {
            setResults(data.results);
            setBaseResults(data.results);
            return;
          }
        }

        if (seedGenreIdsFromHistory.length > 0) {
          const data = await apiService.discoverMovies({ withGenres: seedGenreIdsFromHistory.join(',') });
          setResults(data.results || []);
          setBaseResults(data.results || []);
        } else {
          const data = await apiService.getPopular('movie');
          setResults(data.results || []);
          setBaseResults(data.results || []);
        }
      } catch (e) {
        console.error(e);
        addNotification('Failed to load recommendations', 'error');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [viewingHistory, seedGenreIdsFromHistory, addNotification]);

  // Preload genre suggestions once
  useEffect(() => {
    let active = true;
    const loadGenres = async () => {
      try {
        const g = await apiService.getGenres('movie');
        if (!active) return;
        setGenreSuggestions((g.genres || []).map(gg => ({ id: gg.id, name: gg.name })));
      } catch (e) {
        setGenreSuggestions([]);
      }
    };
    loadGenres();
    return () => { active = false; };
  }, []);

  // Person suggestions
  useEffect(() => {
    let active = true;
    const fetchPersons = async () => {
      try {
        if (personQuery.trim().length < 2) { setPersonSuggestions([]); return; }
        const p = await apiService.searchPerson(personQuery);
        if (!active) return;
        setPersonSuggestions((p.results || []).map(pp => ({ id: pp.id, name: pp.name })));
      } catch (e) { setPersonSuggestions([]); }
    };
    fetchPersons();
    return () => { active = false; };
  }, [personQuery]);

  // Company suggestions
  useEffect(() => {
    let active = true;
    const fetchCompanies = async () => {
      try {
        if (companyQuery.trim().length < 2) { setCompanySuggestions([]); return; }
        const c = await apiService.searchCompany(companyQuery);
        if (!active) return;
        setCompanySuggestions((c.results || []).map(cc => ({ id: cc.id, name: cc.name })));
      } catch (e) { setCompanySuggestions([]); }
    };
    fetchCompanies();
    return () => { active = false; };
  }, [companyQuery]);

  // Reset selections when category changes
  useEffect(() => {
    setSelectedGenreId('');
    setSelectedPersonId('');
    setSelectedCompanyId('');
    setPersonQuery('');
    setCompanyQuery('');
    // show base again until a specific selection is made
    setResults(baseResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  // Auto-apply when active selection changes
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenreId, selectedPersonId, selectedCompanyId]);

  const applyFilters = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCategory === 'genre' && selectedGenreId) params.withGenres = String(selectedGenreId);
      if (filterCategory === 'person' && selectedPersonId) params.withPeople = String(selectedPersonId);
      if (filterCategory === 'company' && selectedCompanyId) params.withCompanies = String(selectedCompanyId);

      // If no filters selected, show base seed results
      if (!params.withGenres && !params.withPeople && !params.withCompanies) {
        setResults(baseResults);
        addNotification('Showing default similar recommendations', 'info');
        return;
      }

      const data = await apiService.discoverMovies(params);
      const discovered = data.results || [];
      if (baseResults.length) {
        const baseIds = new Set(baseResults.map(x => x.id));
        const intersected = discovered.filter(x => baseIds.has(x.id));
        if (intersected.length > 0) {
          setResults(intersected);
        } else {
          // fallback: no overlap, show discovered list
          setResults(discovered);
          addNotification('No exact matches with your recent watches; showing closest results', 'info');
        }
      } else {
        setResults(discovered);
      }
      addNotification('Recommendations updated', 'success');
    } catch (e) {
      console.error(e);
      addNotification('Failed to fetch recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedGenreId('');
    setSelectedPersonId('');
    setSelectedCompanyId('');
    setPersonQuery('');
    setCompanyQuery('');
    setResults(baseResults);
  };

  const handleAddToList = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInMyList(item.id)) {
      removeFromMyList(item.id);
      addNotification(`Removed ${item.title || item.name} from My List`, 'info');
    } else {
      addToMyList(item);
      addNotification(`Added ${item.title || item.name} to My List`, 'success');
    }
  };

  return (
    <div className="recommendations">
      <h2>Recommended For You</h2>

      <div className="rec-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Filter Category</label>
            <select
              className="select-control"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="genre">Genre</option>
              <option value="person">Actor / Director</option>
              <option value="company">Production Company</option>
            </select>
          </div>

          {filterCategory === 'genre' && (
            <div className="filter-group">
              <label>Genre</label>
              <select
                className="select-control"
                value={selectedGenreId}
                onChange={(e) => setSelectedGenreId(e.target.value)}
              >
                <option value="">All Genres</option>
                {genreSuggestions.map(g => (
                  <option key={`g-${g.id}`} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {filterCategory === 'person' && (
            <div className="filter-group">
              <label>Actor / Director</label>
              <input
                type="text"
                placeholder="Search actor or director"
                value={personQuery}
                onChange={(e) => setPersonQuery(e.target.value)}
              />
              <div className="suggestions">
                {personSuggestions.slice(0, 8).map(s => (
                  <button
                    key={`p-${s.id}`}
                    className={`chip ${selectedPersonId === String(s.id) ? 'selected' : ''}`}
                    onClick={() => setSelectedPersonId(String(s.id))}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filterCategory === 'company' && (
            <div className="filter-group">
              <label>Production Company</label>
              <input
                type="text"
                placeholder="Search production company"
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
              />
              <div className="suggestions">
                {companySuggestions.slice(0, 8).map(s => (
                  <button
                    key={`c-${s.id}`}
                    className={`chip ${selectedCompanyId === String(s.id) ? 'selected' : ''}`}
                    onClick={() => setSelectedCompanyId(String(s.id))}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="filter-actions">
            <button className="btn clear" onClick={clearFilters} disabled={loading}>Reset</button>
          </div>
        </div>
      </div>

      <div className="card-list" style={{ marginTop: 10 }}>
        {loading && <div className="rec-loading">Loading recommendations...</div>}
        {!loading && results.map((card, index) => {
          const isInList = isInMyList(card.id);
          const linkPath = `/player/${card.id}`;
          return (
            <Link to={linkPath} className="card" key={index}>
              <img src={`https://image.tmdb.org/t/p/w500${card.backdrop_path || card.poster_path}`} alt="" />
              <p>{card.title || card.name}</p>
              <button
                className={`add-to-list-btn ${isInList ? 'in-list' : ''}`}
                onClick={(e) => handleAddToList(e, card)}
                title={isInList ? 'Remove from My List' : 'Add to My List'}
              >
                {isInList ? '✓' : '+'}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Recommendations;
