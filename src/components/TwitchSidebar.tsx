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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-600" />
              Live Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-16 h-12 bg-slate-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
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
    <div className="space-y-6">
      {/* Top Live Streams */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-600" />
              Top Live Streams
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">LIVE</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-4">
              <p className="text-red-500 text-sm">{error}</p>
              <Button 
                onClick={fetchTwitchData} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {topStreams.slice(0, 5).map((stream, index) => (
                <div 
                  key={stream.id}
                  className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
                  onClick={() => openTwitchStream(stream.user_login)}
                >
                  <div className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={stream.thumbnail_url} 
                        alt={stream.title}
                        className="w-16 h-12 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                        }}
                      />
                      <div className="absolute top-1 left-1">
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          LIVE
                        </Badge>
                      </div>
                      <div className="absolute bottom-1 right-1">
                        <Badge variant="secondary" className="text-xs px-1 py-0 bg-black/70 text-white">
                          {formatStreamDuration(stream.started_at)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-purple-600">#{index + 1}</span>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {stream.user_name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">
                        {stream.title}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 truncate">
                          {stream.game_name}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Eye className="w-3 h-3" />
                          <span>{formatViewerCount(stream.viewer_count)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Games */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Top Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topGames.slice(0, 5).map((game, index) => (
              <div 
                key={game.id}
                className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
                onClick={() => window.open(`https://twitch.tv/directory/game/${encodeURIComponent(game.name)}`, '_blank')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-green-600 w-6">#{index + 1}</span>
                    <img 
                      src={game.box_art_url} 
                      alt={game.name}
                      className="w-10 h-14 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {game.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Trending game
                    </p>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
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
          {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Data refreshes every 2 minutes
        </p>
      </div>
    </div>
  );
};

export default TwitchSidebar;