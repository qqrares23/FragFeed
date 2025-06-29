import { useState, useEffect } from "react";
import { Gamepad2, ExternalLink, Twitch, MessageSquare } from "lucide-react";
import { SiEpicgames, SiRiotgames, SiUbisoft } from "react-icons/si";
import { FaSteam } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CheapSharkDeal {
  internalName: string;
  title: string;
  metacriticLink: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
}

interface NewsItem {
  title: string;
  url: string;
  urlToImage: string;
  description: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: string;
  platform?: string;
}

interface GamingDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const GamingDropdown = ({ isOpen, onClose }: GamingDropdownProps) => {
  const [activeTab, setActiveTab] = useState<'steam' | 'news'>('steam');
  const [steamDeals, setSteamDeals] = useState<CheapSharkDeal[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'steam' && steamDeals.length === 0) {
      fetchSteamDeals();
    }
    if (isOpen && activeTab === 'news' && news.length === 0) {
      fetchGamingNews();
    }
  }, [isOpen, activeTab]);

  const fetchSteamDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=60&pageSize=8&sortBy=Savings&desc=1&onSale=1'
      );
      
      if (!response.ok) throw new Error('Failed to fetch Steam deals');
      
      const deals: CheapSharkDeal[] = await response.json();
      setSteamDeals(deals.slice(0, 6));
    } catch (err) {
      setError('Failed to load Steam deals');
      console.error('CheapShark API error:', err);
      
      // Fallback mock data
      setSteamDeals([
        {
          title: "Counter-Strike 2",
          salePrice: "0.00",
          normalPrice: "0.00",
          savings: "0",
          steamRatingText: "Very Positive",
          steamRatingPercent: "87",
          thumb: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
          dealID: "mock1",
          storeID: "1",
          gameID: "730",
          steamAppID: "730",
          isOnSale: "0",
          metacriticScore: "81",
          steamRatingCount: "1000000",
          dealRating: "9.5",
          internalName: "COUNTERSTRIKE2",
          metacriticLink: "",
          releaseDate: 0,
          lastChange: 0
        } as CheapSharkDeal,
        {
          title: "Cyberpunk 2077",
          salePrice: "29.99",
          normalPrice: "59.99",
          savings: "50.00",
          steamRatingText: "Very Positive",
          steamRatingPercent: "78",
          thumb: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
          dealID: "mock2",
          storeID: "1",
          gameID: "1091500",
          steamAppID: "1091500",
          isOnSale: "1",
          metacriticScore: "86",
          steamRatingCount: "500000",
          dealRating: "8.9",
          internalName: "CYBERPUNK2077",
          metacriticLink: "",
          releaseDate: 0,
          lastChange: 0
        } as CheapSharkDeal,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGamingNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Enhanced gaming news with more variety and platforms
      setNews([
        {
          title: "Steam Winter Sale 2025: Best Deals and Discounts",
          url: "https://store.steampowered.com/",
          urlToImage: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
          description: "Discover the best gaming deals during Steam's annual winter sale with discounts up to 90% off on popular titles including AAA games and indie favorites.",
          publishedAt: new Date().toISOString(),
          source: { name: "Steam News" },
          category: "Sales",
          platform: "PC"
        },
        {
          title: "Valorant Champions 2025: Tournament Schedule Announced",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg",
          description: "Riot Games reveals the complete schedule for Valorant Champions 2025, featuring 16 teams competing for the $2.5 million prize pool.",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: { name: "Riot Games" },
          category: "Esports",
          platform: "PC"
        },
        {
          title: "Fortnite Chapter 5 Season 2: New Map and Features",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
          description: "Epic Games unveils the latest Fortnite season with a completely redesigned map, new weapons, and exciting gameplay mechanics.",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: { name: "Epic Games" },
          category: "Updates",
          platform: "Multi-platform"
        },
        {
          title: "Rainbow Six Siege: Operation Crimson Heist Now Live",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg",
          description: "Ubisoft launches the latest Rainbow Six Siege operation featuring new operator Flores, map rework, and weapon balancing changes.",
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: "Ubisoft" },
          category: "Updates",
          platform: "PC/Console"
        },
        {
          title: "Gaming Hardware: RTX 5000 Series Performance Review",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg",
          description: "Comprehensive analysis of NVIDIA's latest RTX 5000 series graphics cards and their impact on 4K gaming performance across popular titles.",
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: { name: "Tech Gaming" },
          category: "Hardware",
          platform: "PC"
        },
      ]);
    } catch (err) {
      setError('Failed to load gaming news');
    } finally {
      setLoading(false);
    }
  };

  const handleDealClick = (dealID: string) => {
    window.open(`https://www.cheapshark.com/redirect?dealID=${dealID}`, '_blank');
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? 'Free' : `$${numPrice.toFixed(2)}`;
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      'Sales': 'bg-green-100 text-green-700',
      'Esports': 'bg-purple-100 text-purple-700',
      'Updates': 'bg-blue-100 text-blue-700',
      'Hardware': 'bg-orange-100 text-orange-700',
      'Awards': 'bg-yellow-100 text-yellow-700',
    };
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'PC': return <FaSteam className="w-3 h-3" />;
      case 'PlayStation': return <span className="text-xs font-bold">PS</span>;
      case 'Xbox/PC': return <span className="text-xs font-bold">XB</span>;
      case 'Nintendo Switch': return <span className="text-xs font-bold">NS</span>;
      case 'Mobile': return <span className="text-xs font-bold">📱</span>;
      case 'Multi-platform': return <span className="text-xs font-bold">🎮</span>;
      case 'Streaming': return <Twitch className="w-3 h-3" />;
      case 'Development': return <span className="text-xs font-bold">🛠️</span>;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Gamepad2 className="w-6 h-6" />
              Gaming Hub
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'steam' | 'news')} className="mt-4">
            <TabsList className="bg-white/20 border-0">
              <TabsTrigger value="steam" className="data-[state=active]:bg-white data-[state=active]:text-primary-600">
                <FaSteam className="w-4 h-4 mr-2" />
                Steam Deals
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:bg-white data-[state=active]:text-primary-600">
                <MessageSquare className="w-4 h-4 mr-2" />
                Gaming News
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Loading amazing content...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'steam' | 'news')}>
            <TabsContent value="steam" className="mt-0">
              {!loading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {steamDeals.map((deal) => (
                      <Card 
                        key={deal.dealID} 
                        className="cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => handleDealClick(deal.dealID)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <img 
                              src={deal.thumb || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"} 
                              alt={deal.title}
                              className="w-16 h-16 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 line-clamp-2 text-sm">
                                {deal.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg font-bold text-green-600">
                                  {formatPrice(deal.salePrice)}
                                </span>
                                {parseFloat(deal.normalPrice) > parseFloat(deal.salePrice) && (
                                  <>
                                    <span className="text-sm text-slate-400 line-through">
                                      {formatPrice(deal.normalPrice)}
                                    </span>
                                    <Badge variant="destructive" className="text-xs">
                                      -{Math.round(parseFloat(deal.savings))}%
                                    </Badge>
                                  </>
                                )}
                              </div>
                              {deal.steamRatingText && (
                                <div className="text-xs text-slate-500 mt-1">
                                  {deal.steamRatingText} ({deal.steamRatingPercent}%)
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="text-center text-xs text-slate-500 pt-4 border-t">
                    Powered by <a href="https://www.cheapshark.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">CheapShark API</a>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="news" className="mt-0">
              {!loading && (
                <div className="space-y-4">
                  {news.map((article, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img 
                            src={article.urlToImage || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"} 
                            alt={article.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
                              <span className="font-medium">{article.source.name}</span>
                              <span>•</span>
                              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                              {article.category && (
                                <>
                                  <span>•</span>
                                  <Badge variant="secondary" className={`text-xs ${getCategoryColor(article.category)}`}>
                                    {article.category}
                                  </Badge>
                                </>
                              )}
                              {article.platform && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                    {getPlatformIcon(article.platform)}
                                    {article.platform}
                                  </Badge>
                                </>
                              )}
                            </div>
                            <h4 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                              {article.title}
                            </h4>
                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                              {article.description}
                            </p>
                            <a 
                              href={article.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Read More <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GamingDropdown;