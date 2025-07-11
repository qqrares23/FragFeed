import { useState, useEffect } from "react";
import { Trophy, Clock, Users, Play, Star, Zap, Target, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EsportsMatch {
  id: string;
  game: string;
  tournament: string;
  team1: {
    name: string;
    logo: string;
    score?: number;
  };
  team2: {
    name: string;
    logo: string;
    score?: number;
  };
  status: 'live' | 'upcoming' | 'finished';
  startTime: string;
  viewers?: number;
  streamUrl?: string;
  bestOf?: number;
}

const EsportsSidebar = () => {
  const [matches, setMatches] = useState<EsportsMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchEsportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock esports data from various games
      const mockMatches: EsportsMatch[] = [
        {
          id: "1",
          game: "League of Legends",
          tournament: "LCS Championship",
          team1: { name: "Team Liquid", logo: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg", score: 2 },
          team2: { name: "Cloud9", logo: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg", score: 1 },
          status: 'live',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          viewers: 125000,
          streamUrl: "https://twitch.tv/riotgames",
          bestOf: 5
        },
        {
          id: "2",
          game: "Valorant",
          tournament: "VCT Champions",
          team1: { name: "Sentinels", logo: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg", score: 13 },
          team2: { name: "FNC", logo: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg", score: 8 },
          status: 'live',
          startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          viewers: 89000,
          streamUrl: "https://twitch.tv/valorant",
          bestOf: 3
        },
        {
          id: "3",
          game: "CS2",
          tournament: "IEM Katowice",
          team1: { name: "NAVI", logo: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg" },
          team2: { name: "FaZe", logo: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg" },
          status: 'upcoming',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          bestOf: 3
        },
        {
          id: "4",
          game: "Dota 2",
          tournament: "The International",
          team1: { name: "Team Spirit", logo: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg", score: 2 },
          team2: { name: "PSG.LGD", logo: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg", score: 0 },
          status: 'finished',
          startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          viewers: 234000,
          bestOf: 3
        },
        {
          id: "5",
          game: "Overwatch 2",
          tournament: "OWL Grand Finals",
          team1: { name: "San Francisco Shock", logo: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg" },
          team2: { name: "Dallas Fuel", logo: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg" },
          status: 'upcoming',
          startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          bestOf: 7
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMatches(mockMatches);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load esports data');
      console.error('Esports API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEsportsData();
    
    // Refresh data every 3 minutes
    const interval = setInterval(fetchEsportsData, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toLocaleString();
  };

  const formatTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) {
      const pastHours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
      const pastMinutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));
      if (pastHours > 0) return `${pastHours}h ${pastMinutes}m ago`;
      return `${pastMinutes}m ago`;
    }

    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500 text-white';
      case 'upcoming': return 'bg-blue-500 text-white';
      case 'finished': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getGameColor = (game: string) => {
    switch (game) {
      case 'League of Legends': return 'from-blue-500 to-purple-600';
      case 'Valorant': return 'from-red-500 to-pink-600';
      case 'CS2': return 'from-orange-500 to-yellow-600';
      case 'Dota 2': return 'from-red-600 to-orange-600';
      case 'Overwatch 2': return 'from-orange-400 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading && !matches.length) {
    return (
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-yellow-600" />
            Esports Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
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
    );
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <Trophy className="w-3 h-3 text-white" />
            </div>
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent font-bold">
              🏆 Live Esports
            </span>
          </CardTitle>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <Badge variant="destructive" className="text-xs font-bold animate-pulse">
              LIVE
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-4">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-red-500 text-xs">{error}</p>
            <Button 
              onClick={fetchEsportsData} 
              variant="outline" 
              size="sm" 
              className="mt-2 text-xs h-7"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.slice(0, 5).map((match, index) => (
              <div 
                key={match.id}
                className="group cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl p-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md border border-transparent hover:border-yellow-200 dark:hover:border-yellow-700"
                onClick={() => match.streamUrl && window.open(match.streamUrl, '_blank')}
              >
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 bg-gradient-to-br ${getGameColor(match.game)} rounded flex items-center justify-center`}>
                        <Target className="w-2 h-2 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {match.game}
                      </span>
                    </div>
                    <Badge className={`text-xs px-1.5 py-0.5 h-5 ${getStatusColor(match.status)}`}>
                      {match.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Tournament */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                    {match.tournament}
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <img 
                        src={match.team1.logo} 
                        alt={match.team1.name}
                        className="w-4 h-4 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                        }}
                      />
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                        {match.team1.name}
                      </span>
                      {match.team1.score !== undefined && (
                        <span className="text-xs font-bold text-green-600 ml-1">
                          {match.team1.score}
                        </span>
                      )}
                    </div>

                    <div className="px-2 text-xs text-slate-500 dark:text-slate-400 font-bold">
                      VS
                    </div>

                    <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                      {match.team2.score !== undefined && (
                        <span className="text-xs font-bold text-green-600 mr-1">
                          {match.team2.score}
                        </span>
                      )}
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                        {match.team2.name}
                      </span>
                      <img 
                        src={match.team2.logo} 
                        alt={match.team2.name}
                        className="w-4 h-4 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTimeUntil(match.startTime)}</span>
                      </div>
                      {match.bestOf && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          BO{match.bestOf}
                        </Badge>
                      )}
                    </div>
                    {match.viewers && (
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Users className="w-2.5 h-2.5" />
                        <span className="font-medium">{formatViewerCount(match.viewers)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-yellow-200 dark:border-yellow-800 pt-3 mt-3">
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {lastUpdate && `🔄 Updated: ${lastUpdate.toLocaleTimeString()}`}
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-600">
              Live esports from multiple games
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EsportsSidebar;