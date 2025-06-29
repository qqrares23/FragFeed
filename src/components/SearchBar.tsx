import { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes, FaFire, FaClock, FaUsers } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import "../styles/SearchBar.css";

interface SearchResult {
  _id: string;
  type: string;
  title: string;
  name: string;
  description?: string;
  memberCount?: number;
  createdAt?: string;
}

interface RecentSearch {
  query: string;
  timestamp: number;
  type: 'community' | 'post';
}

const SearchBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const subredditMatch = location.pathname.match(/^\/r\/([^/]+)/);
  const currentSubreddit = subredditMatch ? subredditMatch[1] : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Enhanced search queries with debouncing
  const subredditSearch = useQuery(
    api.subreddit.search, 
    searchQuery.length >= 2 && !currentSubreddit ? { queryStr: searchQuery } : "skip"
  );
  
  const postSearch = useQuery(
    api.post.search, 
    searchQuery.length >= 2 && currentSubreddit ? {
      queryStr: searchQuery,
      subreddit: currentSubreddit,
    } : "skip"
  );

  const results = currentSubreddit ? postSearch : subredditSearch;

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('reddit-search-history');
    const savedRecent = localStorage.getItem('reddit-recent-searches');
    
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent));
    }
  }, []);

  // Handle clicks outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsActive(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsActive(true);
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Keep active for a moment to allow clicks
    setTimeout(() => {
      if (!searchRef.current?.contains(document.activeElement)) {
        setIsActive(false);
      }
    }, 150);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
    if (e.key === 'Escape') {
      setIsActive(false);
      setSearchQuery("");
      inputRef.current?.blur();
    }
  };

  const performSearch = (query: string) => {
    // Add to search history
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('reddit-search-history', JSON.stringify(newHistory));

    // Add to recent searches
    const newRecent: RecentSearch = {
      query,
      timestamp: Date.now(),
      type: currentSubreddit ? 'post' : 'community'
    };
    const updatedRecent = [newRecent, ...recentSearches.filter(r => r.query !== query)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('reddit-recent-searches', JSON.stringify(updatedRecent));

    setIsActive(false);
    setSearchQuery("");
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "post") {
      navigate(`/post/${result._id}`);
    } else {
      navigate(`/r/${result.name}`);
    }
    performSearch(result.title);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    setRecentSearches([]);
    localStorage.removeItem('reddit-search-history');
    localStorage.removeItem('reddit-recent-searches');
  };

  const clearSearchQuery = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "community":
        return <FaUsers className="result-type-icon community" />;
      case "post":
        return <FaFire className="result-type-icon post" />;
      default:
        return <FaSearch className="result-type-icon" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div className={`search-container ${isFocused ? 'focused' : ''} ${isActive ? 'active' : ''}`}>
        <FaSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={
            currentSubreddit
              ? `Search posts in r/${currentSubreddit}`
              : "Search communities, posts, and more..."
          }
          value={searchQuery}
          onChange={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        
        {searchQuery && (
          <button className="clear-search" onClick={clearSearchQuery}>
            <FaTimes />
          </button>
        )}

        {currentSubreddit && (
          <div className="search-scope">
            <span>r/{currentSubreddit}</span>
          </div>
        )}
      </div>

      {isActive && (
        <div className="search-results">
          <div className="search-results-header">
            <h4>
              {searchQuery ? 'Search Results' : 'Recent & Suggestions'}
            </h4>
            {(searchHistory.length > 0 || recentSearches.length > 0) && (
              <button className="clear-history" onClick={clearSearchHistory}>
                Clear All
              </button>
            )}
          </div>

          <div className="search-results-content">
            {searchQuery === "" ? (
              // Show recent searches and history when no query
              <div className="search-suggestions">
                {recentSearches.length > 0 && (
                  <div className="suggestion-section">
                    <div className="suggestion-header">
                      <FaClock className="section-icon" />
                      <span>Recent Searches</span>
                    </div>
                    {recentSearches.map((recent, index) => (
                      <div
                        key={index}
                        className="suggestion-item recent"
                        onClick={() => handleHistoryClick(recent.query)}
                      >
                        <div className="suggestion-content">
                          <span className="suggestion-text">{recent.query}</span>
                          <span className="suggestion-meta">
                            {recent.type} • {formatTimeAgo(recent.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchHistory.length > 0 && (
                  <div className="suggestion-section">
                    <div className="suggestion-header">
                      <FaSearch className="section-icon" />
                      <span>Search History</span>
                    </div>
                    {searchHistory.slice(0, 5).map((query, index) => (
                      <div
                        key={index}
                        className="suggestion-item history"
                        onClick={() => handleHistoryClick(query)}
                      >
                        <div className="suggestion-content">
                          <span className="suggestion-text">{query}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {recentSearches.length === 0 && searchHistory.length === 0 && (
                  <div className="empty-state">
                    <FaSearch className="empty-icon" />
                    <p>Start typing to search for communities and posts</p>
                    <div className="search-tips">
                      <span>💡 Tips:</span>
                      <ul>
                        <li>Use specific keywords for better results</li>
                        <li>Search works across titles and content</li>
                        <li>Recent searches are saved for quick access</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : results && results.length > 0 ? (
              // Show search results
              <div className="results-list">
                {results.map((result) => (
                  <div
                    key={result._id}
                    className="result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="result-icon">
                      {getIconForType(result.type)}
                    </div>
                    <div className="result-content">
                      <div className="result-title">{result.title}</div>
                      <div className="result-meta">
                        <span className="result-type">
                          {result.type === 'community' ? 'Community' : 'Post'}
                        </span>
                        {result.type === 'community' && (
                          <>
                            <span className="result-separator">•</span>
                            <span className="result-info">r/{result.name}</span>
                          </>
                        )}
                        {result.description && (
                          <>
                            <span className="result-separator">•</span>
                            <span className="result-description">
                              {result.description.substring(0, 60)}...
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="result-action">
                      <span>View</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              // No results found
              <div className="empty-state">
                <FaSearch className="empty-icon" />
                <p>No results found for "{searchQuery}"</p>
                <div className="search-suggestions-alt">
                  <span>Try:</span>
                  <ul>
                    <li>Different keywords or phrases</li>
                    <li>Checking spelling</li>
                    <li>Using more general terms</li>
                  </ul>
                </div>
              </div>
            ) : (
              // Typing but not enough characters
              <div className="empty-state">
                <FaSearch className="empty-icon" />
                <p>Keep typing to see results...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;