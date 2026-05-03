import { useEffect, useState } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import FighterCard from './components/FighterCard.jsx'
import FighterModal from './components/FighterModal.jsx'
import { getTrendingFighters, updateFighterSearchCount } from './appwrite.js'

const API_BASE_URL = import.meta.env.VITE_OCTAGON_API_URL || 'https://api.octagon-api.com';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [fighterList, setFighterList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingFighters, setTrendingFighters] = useState([]);
  const [selectedFighter, setSelectedFighter] = useState(null);
  const [activeWeightClass, setActiveWeightClass] = useState(null);

  // Wait 500ms after user stops typing before triggering a fetch.
  // Drops the request count from one-per-keystroke to one-per-search.
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchFighters = async (query = '', weightClass = null) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = `${API_BASE_URL}/fighters`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data || (Array.isArray(data) && data.length === 0)) {
        setErrorMessage('No fighter data received from the API.');
        setFighterList([]);
        return;
      }

      // The API returns fighters as an object keyed by slug, not an array.
      // Convert to a flat array so we can filter and map normally.
      let fighters = Object.entries(data).map(([slug, fighter]) => ({
        ...fighter,
        slug,
        id: slug,
      }));

      if (weightClass) {
        fighters = fighters.filter(f =>
          f.category && f.category.toLowerCase().includes(weightClass.toLowerCase())
        );
      }

      if (query) {
        const lowerQuery = query.toLowerCase();
        fighters = fighters.filter(f =>
          f.name && f.name.toLowerCase().includes(lowerQuery)
        );
      }

      setFighterList(fighters);

      // Log the search to Appwrite so it can show up in trending.
      // Only log meaningful searches that actually returned results.
      if (query && fighters.length > 0) {
        await updateFighterSearchCount(query, fighters[0]);
      }
    } catch (error) {
      console.error('Error fetching fighters:', error);
      setErrorMessage('Error fetching fighters. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingFighters = async () => {
    try {
      const fighters = await getTrendingFighters();
      setTrendingFighters(fighters);
    } catch (error) {
      console.error('Error loading trending fighters:', error);
    }
  };

  // Refetch whenever the debounced query or active weight class changes.
  useEffect(() => {
    fetchFighters(debouncedSearchTerm, activeWeightClass);
  }, [debouncedSearchTerm, activeWeightClass]);

  // Load trending fighters once on mount.
  useEffect(() => {
    loadTrendingFighters();
  }, []);

  const weightClasses = [
    'Heavyweight', 'Light Heavyweight', 'Middleweight',
    'Welterweight', 'Lightweight', 'Featherweight',
    'Bantamweight', 'Flyweight',
  ];

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <h1>
            Find Active <span className="text-gradient">UFC Fighters</span>{' '}
            Stats & Profiles
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Hide weight class filters during an active search — name match
            already covers all divisions. */}
        {!searchTerm && (
          <section className="weight-class-filters">
            <button
              className={`filter-btn ${activeWeightClass === null ? 'active' : ''}`}
              onClick={() => setActiveWeightClass(null)}
            >
              All
            </button>
            {weightClasses.map((wc) => (
              <button
                key={wc}
                className={`filter-btn ${activeWeightClass === wc ? 'active' : ''}`}
                onClick={() => setActiveWeightClass(wc)}
              >
                {wc}
              </button>
            ))}
          </section>
        )}

        {trendingFighters.length > 0 && (
          <section className="trending">
            <h2>🔥 Trending Fighters</h2>
            <ul>
              {trendingFighters.map((fighter, index) => (
                <li key={fighter.$id}>
                  <p>{index + 1}</p>
                  <img
                    src={fighter.fighter_image_url || '/no-fighter.svg'}
                    alt={fighter.fighter_name}
                    onError={(e) => { e.target.src = '/no-fighter.svg'; }}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-fighters">
          <h2>
            {searchTerm
              ? `Search Results for "${searchTerm}"`
              : activeWeightClass
              ? `${activeWeightClass} Fighters`
              : 'All Fighters'
            }
          </h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : fighterList.length === 0 ? (
            <div className="no-results">
              <p>No fighters found{searchTerm ? ` for "${searchTerm}"` : ''}.</p>
              {searchTerm && (
                <p className="no-results-hint">
                  Try a different name or check the spelling.
                </p>
              )}
            </div>
          ) : (
            <ul>
              {fighterList.map((fighter) => (
                <FighterCard
                  key={fighter.id}
                  fighter={fighter}
                  onSelect={() => setSelectedFighter(fighter)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {selectedFighter && (
        <FighterModal
          fighter={selectedFighter}
          onClose={() => setSelectedFighter(null)}
        />
      )}
    </main>
  );
};

export default App;
