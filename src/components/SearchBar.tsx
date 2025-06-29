import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, Users, TrendingUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
        <Input
          ref={inputRef}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
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
          <Button 
            variant="ghost"
            size="sm"
            onClick={clearSearchQuery}
            className="mr-2 p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {currentSubreddit && (
          <Badge variant="secondary" className="mr-3">
            r/{currentSubreddit}
          </Badge>
        )}
      </div>

      {isActive && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h4 className="font-semibold text-slate-700">
              {searchQuery ? 'Search Results' : 'Recent & Suggestions'}
            </h4>
            {(searchHistory.length > 0 || recentSearches.length > 0) && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={clearSearchHistory}
                className="text-xs"
              >
                Clear All
              </Button>
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
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleHistoryClick(recent.query)}
                        className="w-full justify-start p-2 h-auto"
                      >
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">{recent.query}</div>
                          <div className="text-slate-500">
                            {recent.type} • {formatTimeAgo(recent.timestamp)}
                          </div>
                        </div>
                      </Button>
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
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleHistoryClick(query)}
                        className="w-full justify-start p-2 h-auto"
                      >
                        <span className="text-sm font-medium text-slate-900">{query}</span>
                      </Button>
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
                  <Button
                    key={result._id}
                    variant="ghost"
                    onClick={() => handleResultClick(result)}
                    className="w-full justify-start p-3 h-auto"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {result.type === 'community' ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            <TrendingUp className="w-4 h-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-slate-900 truncate">{result.title}</div>
                        <div className="text-sm text-slate-500">
                          {result.type === 'community' ? 'Community' : 'Post'}
                          {result.type === 'community' && ` • r/${result.name}`}
                        </div>
                      </div>
                    </div>
                  </Button>
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
        </Card>
      )}
    </div>
  );
};

export default SearchBar;