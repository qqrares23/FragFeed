import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostCard from "./PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Users, Zap, Filter, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Feed() {
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('day');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const topPosts = useQuery(api.leaderboard.getTopPosts, { limit: 20 });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'hot': return <TrendingUp className="w-4 h-4" />;
      case 'new': return <Clock className="w-4 h-4" />;
      case 'top': return <Zap className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getSortColor = (sort: string) => {
    switch (sort) {
      case 'hot': return 'from-orange-500 to-red-500';
      case 'new': return 'from-blue-500 to-indigo-500';
      case 'top': return 'from-purple-500 to-pink-500';
      default: return 'from-orange-500 to-red-500';
    }
  };

  if (!topPosts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-r ${getSortColor(sortBy)} rounded-xl flex items-center justify-center shadow-lg`}>
                {getSortIcon(sortBy)}
              </div>
              <span className="animate-bounce-gentle">
                {sortBy === 'hot' && '🔥 Trending Today'}
                {sortBy === 'new' && '⚡ Fresh Content'}
                {sortBy === 'top' && '🏆 Top Posts'}
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {sortBy === 'hot' && 'Discover the hottest posts from your communities'}
              {sortBy === 'new' && 'See the latest posts as they happen'}
              {sortBy === 'top' && `The best posts from the past ${timeRange}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sort by:</span>
          </div>
          
          <div className="flex gap-2">
            {(['hot', 'new', 'top'] as const).map((sort) => (
              <Button
                key={sort}
                onClick={() => setSortBy(sort)}
                variant={sortBy === sort ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-2 transition-all duration-200 ${
                  sortBy === sort 
                    ? `bg-gradient-to-r ${getSortColor(sort)} text-white shadow-lg scale-105` 
                    : 'hover:scale-105'
                }`}
              >
                {getSortIcon(sort)}
                <span className="capitalize">{sort}</span>
              </Button>
            ))}
          </div>

          {sortBy === 'top' && (
            <>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {topPosts.length} posts
            </span>
          </div>
        </div>
      </div>
      
      {/* Enhanced Posts Grid */}
      <div className="space-y-6">
        {topPosts.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No posts found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your filters or check back later for new content
            </p>
          </Card>
        ) : (
          topPosts.map((post, index) => (
            <div 
              key={post._id}
              className="transform hover:scale-[1.01] transition-all duration-300"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="relative">
                {/* Ranking Badge for Top Posts */}
                {sortBy === 'top' && index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <Badge 
                      className={`
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' : ''}
                        ${index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900' : ''}
                        ${index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900' : ''}
                        font-bold shadow-lg
                      `}
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                )}
                
                {/* Hot Badge for Trending Posts */}
                {sortBy === 'hot' && post.score > 50 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg animate-pulse">
                      🔥 HOT
                    </Badge>
                  </div>
                )}

                {/* New Badge for Recent Posts */}
                {sortBy === 'new' && (Date.now() - post._creationTime) < 3600000 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg">
                      ✨ NEW
                    </Badge>
                  </div>
                )}

                <PostCard post={post} showSubreddit={true} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {topPosts.length > 0 && (
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:scale-105 transition-all duration-200"
          >
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
}