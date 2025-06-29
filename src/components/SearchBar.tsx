import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, Users, TrendingUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";

interface SearchResult {
  _id: string;
  type: string;
  title: string;
  name: string;
  description?: string;
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

  useEffect(() => {
    const savedHistory = localStorage.getItem('fragfeed-search-history');
    const savedRecent = localStorage.getItem('fragfeed-recent-searches');
    
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent));
    }
  }, []);

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
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('fragfeed-search-history', JSON.stringify(newHistory));

    const newRecent: RecentSearch = {
      query,
      timestamp: Date.now(),
      type: currentSubreddit ? 'post' : 'community'
    };
    const updatedRecent = [newRecent, ...recentSearches.filter(r => r.query !== query)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('fragfeed-recent-searches', JSON.stringify(updatedRecent));

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
    localStorage.removeItem('fragfeed-search-history');
    localStorage.removeItem('fragfeed-recent-searches');
  };

  const clearSearchQuery = () => {
    setSearchQuery("");
    inputRef.current?.focus();
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
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className={`relative flex items-center bg-white/50 backdrop-blur-sm border border-slate-300 rounded-xl transition-all duration-200 ${
        isFocused ? 'ring-2 ring-primary-500 border-primary-500' : 'hover:border-slate-400'
      }`}>
        <Search className="w-4 h-4 text-slate-400 ml-4" />
        <input
          ref={inputRef}
          className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none placeholder-slate-500"
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
          <button 
            onClick={clearSearchQuery}
            className="p-2 mr-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}

        {currentSubreddit && (
          <div className="mr-3 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-lg">
            r/{currentSubreddit}
          </div>
        )}
      </div>

      {isActive && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h4 className="font-semibold text-slate-700">
              {searchQuery ? 'Search Results' : 'Recent & Suggestions'}
            </h4>
            {(searchHistory.length > 0 || recentSearches.length > 0) && (
              <button 
                onClick={clearSearchHistory}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {searchQuery === "" ? (
              <div className="p-4">
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Recent Searches</span>
                    </div>
                    {recentSearches.map((recent, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(recent.query)}
                        className="w-full p-2 hover:bg-slate-50 rounded-lg text-left transition-colors"
                      >
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">{recent.query}</div>
                          <div className="text-slate-500">
                            {recent.type} • {formatTimeAgo(recent.timestamp)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchHistory.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Search History</span>
                    </div>
                    {searchHistory.slice(0, 5).map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(query)}
                        className="w-full p-2 hover:bg-slate-50 rounded-lg text-left transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-900">{query}</span>
                      </button>
                    ))}
                  </div>
                )}

                {recentSearches.length === 0 && searchHistory.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Start typing to search</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Search for communities and posts
                    </p>
                  </div>
                )}
              </div>
            ) : results && results.length > 0 ? (
              <div className="p-2">
                {results.map((result) => (
                  <button
                    key={result._id}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 hover:bg-slate-50 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        {result.type === 'community' ? (
                          <Users className="w-4 h-4 text-slate-600" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-slate-900 truncate">{result.title}</div>
                        <div className="text-sm text-slate-500">
                          {result.type === 'community' ? 'Community' : 'Post'}
                          {result.type === 'community' && ` • r/${result.name}`}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No results found</p>
                <p className="text-sm text-slate-400 mt-1">
                  Try different keywords or check spelling
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Keep typing...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;