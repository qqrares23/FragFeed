import { useState, useEffect } from "react";
import { Gamepad2, Trophy, Users, Clock, ExternalLink, TrendingUp, Play, Star, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GameTrackerSession {
  id: string;
  game: string;
  platform: string;
  duration: number;
  score?: number;
  achievements?: number;
  lastPlayed: string;
  gameIcon: string;
}

interface SteamGame {
  appid: number;
  name: string;
  current: number;
  peak: number;
}

const GamingSidebar = () => {
  const [recentGames, setRecentGames] = useState<GameTrackerSession[]>([]);
  const [topSteamGames, setTopSteamGames] = useState<SteamGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchGamingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock GameTracker data (in real implementation, this would use GameTracker.gg API)
      const mockRecentGames: GameTrackerSession[] = [
        {
          id: "1",
          game: "Cyberpunk 2077",
          platform: "Steam",
          duration: 145,
          score: 8.5,
          achievements: 12,
          lastPlayed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          gameIcon: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"
        },
        {
          id: "2",
          game: "Valorant",
          platform: "Riot Games",
          duration: 89,
          score: 7.2,
          achievements: 5,
          lastPlayed: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          gameIcon: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"
        },
        {
          id: "3",
          game: "Elden Ring",
          platform: "Steam",
          duration: 234,
          score: 9.1,
          achievements: 28,
          lastPlayed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          gameIcon: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg"
        }
      ];

      // Mock Steam Charts data (in real implementation, this would use Steam Charts API)
      const mockSteamGames: SteamGame[] = [
        { appid: 730, name: "Counter-Strike 2", current: 1234567, peak: 1456789 },
        { appid: 570, name: "Dota 2", current: 567890, peak: 789012 },
        { appid: 1172470, name: "Apex Legends", current: 234567, peak: 345678 },
        { appid: 271590, name: "Grand Theft Auto V", current: 123456, peak: 234567 },
        { appid: 1085660, name: "Destiny 2", current: 98765, peak: 123456 }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRecentGames(mockRecentGames);
      setTopSteamGames(mockSteamGames);
      setIsLoggedIn(true); // Mock login status
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load gaming data');
      console.error('Gaming API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamingData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchGamingData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPlayerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  const handleGameTrackerLogin = () => {
    // In real implementation, this would redirect to GameTracker.gg OAuth
    window.open('https://gametracker.gg/login', '_blank');
  };

  if (loading && !recentGames.length) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gamepad2 className="w-4 h-4 text-blue-600" />
              Gaming Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
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
      {/* Recent Gaming Activity */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gamepad2 className="w-4 h-4 text-blue-600" />
              Recent Gaming
            </CardTitle>
            {!isLoggedIn && (
              <Button 
                onClick={handleGameTrackerLogin}
                variant="outline" 
                size="sm" 
                className="text-xs h-6 px-2"
              >
                Login
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="text-center py-3">
              <p className="text-red-500 text-xs">{error}</p>
              <Button 
                onClick={fetchGamingData} 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs h-7"
              >
                Retry
              </Button>
            </div>
          ) : !isLoggedIn ? (
            <div className="text-center py-4">
              <Gamepad2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Connect GameTracker.gg to see your recent gaming activity
              </p>
              <Button 
                onClick={handleGameTrackerLogin}
                size="sm" 
                className="text-xs h-7"
              >
                Connect Account
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentGames.map((session, index) => (
                <div 
                  key={session.id}
                  className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-2 transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex gap-2">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={session.gameIcon} 
                        alt={session.game}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                        }}
                      />
                      <div className="absolute -top-1 -right-1">
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate mb-1">
                        {session.game}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatDuration(session.duration)}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(session.lastPlayed)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {session.platform}
                        </span>
                        {session.score && (
                          <div className="flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 text-yellow-500" />
                            <span className="text-xs font-medium text-yellow-600">
                              {session.score}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Steam Games */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Steam Top Games
            </CardTitle>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400">LIVE</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {topSteamGames.map((game, index) => (
              <div 
                key={game.appid}
                className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-2 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => window.open(`https://store.steampowered.com/app/${game.appid}`, '_blank')}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs font-bold text-orange-600 w-4">#{index + 1}</span>
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center">
                      <Gamepad2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate mb-1">
                      {game.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-green-600">
                        <Users className="w-2.5 h-2.5" />
                        <span className="font-medium">{formatPlayerCount(game.current)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>Peak: {formatPlayerCount(game.peak)}</span>
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
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
        </p>
        <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
          Powered by GameTracker.gg & Steam Charts
        </p>
      </div>
    </div>
  );
};

export default GamingSidebar;