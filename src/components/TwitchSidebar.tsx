import { useState, useEffect } from "react";
import { Play, Users, Eye, ExternalLink, Gamepad2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TwitchStream {
  id: string;
  user_name: string;
  user_login: string;
  game_name: string;
  title: string;
  viewer_count: number;
  thumbnail_url: string;
  started_at: string;
}

interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
}

const TwitchSidebar = () => {
  const [topStreams, setTopStreams] = useState<TwitchStream[]>([]);
  const [topGames, setTopGames] = useState<TwitchGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchTwitchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data since we can't access Twitch API directly from frontend
      // In a real implementation, this would go through your backend
      const mockStreams: TwitchStream[] = [
        {
          id: "1",
          user_name: "Ninja",
          user_login: "ninja",
          game_name: "Fortnite",
          title: "Playing with viewers! !discord !youtube",
          viewer_count: 45230,
          thumbnail_url: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
          started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          user_name: "shroud",
          user_login: "shroud",
          game_name: "Valorant",
          title: "Ranked grind continues",
          viewer_count: 38420,
          thumbnail_url: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
          started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "3",
          user_name: "pokimane",
          user_login: "pokimane",
          game_name: "League of Legends",
          title: "Climbing to Challenger!",
          viewer_count: 32100,
          thumbnail_url: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg",
          started_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "4",
          user_name: "xQcOW",
          user_login: "xqcow",
          game_name: "Grand Theft Auto V",
          title: "NoPixel RP - New character!",
          viewer_count: 28750,
          thumbnail_url: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
          started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "5",
          user_name: "TimTheTatman",
          user_login: "timthetatman",
          game_name: "Call of Duty: Warzone",
          title: "Warzone with the boys",
          viewer_count: 25600,
          thumbnail_url: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
          started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ];

      const mockGames: TwitchGame[] = [
        {
          id: "1",
          name: "League of Legends",
          box_art_url: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg"
        },
        {
          id: "2",
          name: "Fortnite",
          box_art_url: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"
        },
        {
          id: "3",
          name: "Valorant",
          box_art_url: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"
        },
        {
          id: "4",
          name: "Grand Theft Auto V",
          box_art_url: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"
        },
        {
          id: "5",
          name: "Call of Duty: Warzone",
          box_art_url: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTopStreams(mockStreams);
      setTopGames(mockGames);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load Twitch data');
      console.error('Twitch API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwitchData();
    
    // Refresh data every 2 minutes
    const interval = setInterval(fetchTwitchData, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatStreamDuration = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const openTwitchStream = (userLogin: string) => {
    window.open(`https://twitch.tv/${userLogin}`, '_blank');
  };

  if (loading && !topStreams.length) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="w-4 h-4 text-purple-600" />
              Live Streams
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-2">
                    <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Live Streams */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="w-4 h-4 text-purple-600" />
              Top Live Streams
            </CardTitle>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400">LIVE</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="text-center py-3">
              <p className="text-red-500 text-xs">{error}</p>
              <Button 
                onClick={fetchTwitchData} 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs h-7"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {topStreams.slice(0, 3).map((stream, index) => (
                <div 
                  key={stream.id}
                  className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-2 transition-colors"
                  onClick={() => openTwitchStream(stream.user_login)}
                >
                  <div className="flex gap-2">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={stream.thumbnail_url} 
                        alt={stream.title}
                        className="w-12 h-8 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                        }}
                      />
                      <div className="absolute top-0 left-0">
                        <Badge variant="destructive" className="text-xs px-1 py-0 h-4 text-xs">
                          LIVE
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-bold text-purple-600">#{index + 1}</span>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {stream.user_name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-1">
                        {stream.title}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 truncate text-xs">
                          {stream.game_name}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Eye className="w-2.5 h-2.5" />
                          <span className="text-xs">{formatViewerCount(stream.viewer_count)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Games */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Top Games
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {topGames.slice(0, 3).map((game, index) => (
              <div 
                key={game.id}
                className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-2 transition-colors"
                onClick={() => window.open(`https://twitch.tv/directory/game/${encodeURIComponent(game.name)}`, '_blank')}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs font-bold text-green-600 w-4">#{index + 1}</span>
                    <img 
                      src={game.box_art_url} 
                      alt={game.name}
                      className="w-6 h-8 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {game.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Trending
                    </p>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
        </p>
      </div>
    </div>
  );
};

export default TwitchSidebar;