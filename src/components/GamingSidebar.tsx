import { useState, useEffect } from "react";
import { TrendingUp, Users, ExternalLink, Gamepad2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EsportsSidebar from "./EsportsSidebar";

interface SteamGame {
  appid: number;
  name: string;
  current: number;
  peak: number;
}

const GamingSidebar = () => {
  const [topSteamGames, setTopSteamGames] = useState<SteamGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchSteamData = async () => {
    try {
      setLoading(true);
      setError(null);

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

      setTopSteamGames(mockSteamGames);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load Steam data');
      console.error('Steam API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSteamData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchSteamData, 5 * 60 * 1000);
    
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

  if (loading && !topSteamGames.length) {
    return (
      <div className="space-y-4">
        <EsportsSidebar />
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Steam Top Games
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
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
      {/* Esports Matches */}
      <EsportsSidebar />

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
          {error ? (
            <div className="text-center py-3">
              <p className="text-red-500 text-xs">{error}</p>
              <Button 
                onClick={fetchSteamData} 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs h-7"
              >
                Retry
              </Button>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
        </p>
        <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
          Powered by Steam Charts & Esports APIs
        </p>
      </div>
    </div>
  );
};

export default GamingSidebar;