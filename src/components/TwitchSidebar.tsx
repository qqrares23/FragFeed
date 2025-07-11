import { useState, useEffect } from "react";
import { Play, Users, Eye, ExternalLink, TrendingUp, Zap, Star, Crown } from "lucide-react";
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
  is_mature: boolean;
  language: string;
}

interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
  viewer_count?: number;
}

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

const TwitchSidebar = () => {
  const [topStreams, setTopStreams] = useState<TwitchStream[]>([]);
  const [topGames, setTopGames] = useState<TwitchGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Twitch API credentials - In production, these should be environment variables
  const CLIENT_ID = 'your_twitch_client_id'; // Replace with actual client ID
  const CLIENT_SECRET = 'your_twitch_client_secret'; // Replace with actual client secret

  const getAccessToken = async (): Promise<string> => {
    if (accessToken) return accessToken;

    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
      }

      const data: TwitchTokenResponse = await response.json();
      setAccessToken(data.access_token);
      return data.access_token;
    } catch (error) {
      console.error('Failed to get Twitch access token:', error);
      throw error;
    }
  };

  const fetchTwitchStreams = async (token: string): Promise<TwitchStream[]> => {
    const response = await fetch('https://api.twitch.tv/helix/streams?first=5&language=en', {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Streams API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((stream: any) => ({
      ...stream,
      thumbnail_url: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
    }));
  };

  const fetchTwitchGames = async (token: string): Promise<TwitchGame[]> => {
    const response = await fetch('https://api.twitch.tv/helix/games/top?first=5', {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Games API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((game: any) => ({
      ...game,
      box_art_url: game.box_art_url.replace('{width}', '80').replace('{height}', '106'),
    }));
  };

  const fetchTwitchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have valid credentials
      if (!CLIENT_ID || CLIENT_ID === 'your_twitch_client_id') {
        // Fall back to enhanced mock data if no real credentials
        const mockStreams: TwitchStream[] = [
          {
            id: "1",
            user_name: "Ninja",
            user_login: "ninja",
            game_name: "Fortnite",
            title: "🔥 INSANE BUILD BATTLES! Playing with viewers! !discord !youtube",
            viewer_count: 45230,
            thumbnail_url: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
            started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            is_mature: false,
            language: "en"
          },
          {
            id: "2",
            user_name: "shroud",
            user_login: "shroud",
            game_name: "Valorant",
            title: "🎯 RADIANT RANK GRIND - Insane Aim Training Session",
            viewer_count: 38420,
            thumbnail_url: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
            started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            is_mature: false,
            language: "en"
          },
          {
            id: "3",
            user_name: "pokimane",
            user_login: "pokimane",
            game_name: "League of Legends",
            title: "✨ Climbing to Challenger! Road to Rank 1 💪",
            viewer_count: 32100,
            thumbnail_url: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg",
            started_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            is_mature: false,
            language: "en"
          },
          {
            id: "4",
            user_name: "xQcOW",
            user_login: "xqcow",
            game_name: "Grand Theft Auto V",
            title: "🚗 NoPixel RP - New character arc begins! CHAOS MODE",
            viewer_count: 28750,
            thumbnail_url: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
            started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            is_mature: true,
            language: "en"
          },
          {
            id: "5",
            user_name: "TimTheTatman",
            user_login: "timthetatman",
            game_name: "Call of Duty: Warzone",
            title: "🎮 Warzone with the boys - Victory Royale hunting!",
            viewer_count: 25600,
            thumbnail_url: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
            started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            is_mature: false,
            language: "en"
          }
        ];

        const mockGames: TwitchGame[] = [
          {
            id: "1",
            name: "League of Legends",
            box_art_url: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg",
            viewer_count: 234567
          },
          {
            id: "2",
            name: "Fortnite",
            box_art_url: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
            viewer_count: 198432
          },
          {
            id: "3",
            name: "Valorant",
            box_art_url: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
            viewer_count: 156789
          },
          {
            id: "4",
            name: "Grand Theft Auto V",
            box_art_url: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
            viewer_count: 134567
          },
          {
            id: "5",
            name: "Call of Duty: Warzone",
            box_art_url: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
            viewer_count: 98765
          }
        ];

        // Add some randomization to simulate real-time updates
        const randomizedStreams = mockStreams.map(stream => ({
          ...stream,
          viewer_count: stream.viewer_count + Math.floor(Math.random() * 2000) - 1000,
        }));

        const randomizedGames = mockGames.map(game => ({
          ...game,
          viewer_count: (game.viewer_count || 0) + Math.floor(Math.random() * 10000) - 5000,
        }));

        setTopStreams(randomizedStreams);
        setTopGames(randomizedGames);
        setLastUpdate(new Date());
        return;
      }

      // Get access token and fetch real data
      const token = await getAccessToken();
      
      // Fetch streams and games in parallel
      const [streams, games] = await Promise.all([
        fetchTwitchStreams(token),
        fetchTwitchGames(token)
      ]);

      // Get viewer counts for top games by fetching streams for each game
      const gamesWithViewers = await Promise.all(
        games.map(async (game) => {
          try {
            const gameStreamsResponse = await fetch(
              `https://api.twitch.tv/helix/streams?game_id=${game.id}&first=100`,
              {
                headers: {
                  'Client-ID': CLIENT_ID,
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            
            if (gameStreamsResponse.ok) {
              const gameStreamsData = await gameStreamsResponse.json();
              const totalViewers = gameStreamsData.data.reduce(
                (sum: number, stream: any) => sum + stream.viewer_count,
                0
              );
              return { ...game, viewer_count: totalViewers };
            }
            return game;
          } catch (error) {
            console.error(`Failed to get viewer count for ${game.name}:`, error);
            return game;
          }
        })
      );

      setTopStreams(streams);
      setTopGames(gamesWithViewers);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load Twitch data');
      console.error('Twitch API error:', err);
      
      // Fall back to mock data on error
      const fallbackStreams: TwitchStream[] = [
        {
          id: "fallback1",
          user_name: "StreamerOne",
          user_login: "streamerone",
          game_name: "Popular Game",
          title: "Live streaming now! Come join the fun!",
          viewer_count: Math.floor(Math.random() * 50000) + 10000,
          thumbnail_url: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
          started_at: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
          is_mature: false,
          language: "en"
        }
      ];
      
      setTopStreams(fallbackStreams);
      setTopGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwitchData();
    
    // Refresh data every 2 minutes for real-time updates
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

  const openTwitchGame = (gameName: string) => {
    window.open(`https://twitch.tv/directory/game/${encodeURIComponent(gameName)}`, '_blank');
  };

  const getStreamBadgeColor = (index: number) => {
    switch (index) {
      case 0: return "from-yellow-400 to-yellow-600"; // Gold
      case 1: return "from-gray-300 to-gray-500"; // Silver
      case 2: return "from-orange-400 to-orange-600"; // Bronze
      default: return "from-purple-400 to-purple-600"; // Purple
    }
  };

  const getGameBadgeColor = (index: number) => {
    switch (index) {
      case 0: return "from-green-400 to-green-600";
      case 1: return "from-blue-400 to-blue-600";
      case 2: return "from-red-400 to-red-600";
      default: return "from-indigo-400 to-indigo-600";
    }
  };

  if (loading && !topStreams.length) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                Live Streams
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
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
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                🔥 Top Live Streams
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
              <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                LIVE
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-500 text-sm font-medium">{error}</p>
              <Button 
                onClick={fetchTwitchData} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                <Zap className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {topStreams.slice(0, 3).map((stream, index) => (
                <div 
                  key={stream.id}
                  className="group cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                  onClick={() => openTwitchStream(stream.user_login)}
                >
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 bg-gradient-to-br ${getStreamBadgeColor(index)} rounded flex items-center justify-center`}>
                          {index === 0 ? (
                            <Crown className="w-2 h-2 text-white" />
                          ) : (
                            <span className="text-white font-bold text-xs">#{index + 1}</span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {stream.game_name}
                        </span>
                      </div>
                      <Badge className="text-xs px-1.5 py-0.5 h-5 bg-red-500 text-white">
                        LIVE
                      </Badge>
                    </div>

                    {/* Stream Info */}
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={stream.thumbnail_url} 
                          alt={stream.title}
                          className="w-16 h-10 rounded-lg object-cover shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {stream.user_name}
                          </h4>
                          {stream.is_mature && (
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                              18+
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                          {stream.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Eye className="w-3 h-3" />
                            <span className="text-xs font-semibold">{formatViewerCount(stream.viewer_count)}</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatStreamDuration(stream.started_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                        <ExternalLink className="w-4 h-4 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Games */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold">
              🎮 Trending Games
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {topGames.slice(0, 3).map((game, index) => (
              <div 
                key={game.id}
                className="group cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-green-200 dark:hover:border-green-700"
                onClick={() => openTwitchGame(game.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={game.box_art_url} 
                      alt={game.name}
                      className="w-10 h-12 rounded-lg object-cover shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                      }}
                    />
                    <div className="absolute -top-1 -left-1">
                      <div className={`w-5 h-5 bg-gradient-to-br ${getGameBadgeColor(index)} rounded-full flex items-center justify-center shadow-lg`}>
                        {index === 0 ? (
                          <Star className="w-2.5 h-2.5 text-white" />
                        ) : (
                          <span className="text-white font-bold text-xs">#{index + 1}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate mb-1">
                      {game.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Trending
                      </Badge>
                      {game.viewer_count && (
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Users className="w-3 h-3" />
                          <span className="text-xs font-semibold">{formatViewerCount(game.viewer_count)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                    <ExternalLink className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center space-y-1">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {lastUpdate && `🔄 Updated: ${lastUpdate.toLocaleTimeString()}`}
        </p>
        <p className="text-xs text-slate-300 dark:text-slate-600">
          Powered by <span className="text-purple-500 font-semibold">Twitch API</span>
        </p>
      </div>
    </div>
  );
};

export default TwitchSidebar;