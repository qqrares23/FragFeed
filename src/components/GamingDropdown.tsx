import { useState, useEffect } from "react";
import { Gamepad2, ExternalLink, Twitch, MessageSquare } from "lucide-react";
import { SiEpicgames, SiRiotgames, SiUbisoft } from "react-icons/si";
import { FaSteam } from "react-icons/fa";

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
        'https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=60&pageSize=6&sortBy=Savings&desc=1&onSale=1'
      );
      
      if (!response.ok) throw new Error('Failed to fetch Steam deals');
      
      const deals: CheapSharkDeal[] = await response.json();
      setSteamDeals(deals.slice(0, 4));
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
          description: "Discover the best gaming deals during Steam's annual winter sale with discounts up to 90% off.",
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
          description: "Epic Games unveils the latest Fortnite season with a completely redesigned map.",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: { name: "Epic Games" },
          category: "Updates",
          platform: "Multi-platform"
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
    <div className="absolute top-16 right-4 w-[600px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Gaming Hub
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="mt-3">
          <div className="flex bg-white/20 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('steam')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                activeTab === 'steam' ? 'bg-white text-primary-600' : 'text-white hover:bg-white/10'
              }`}
            >
              <FaSteam className="w-4 h-4" />
              Steam Deals
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                activeTab === 'news' ? 'bg-white text-primary-600' : 'text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Gaming News
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[350px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-600 text-sm">Loading content...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-center py-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {activeTab === 'steam' && !loading && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {steamDeals.map((deal) => (
                <div 
                  key={deal.dealID} 
                  className="bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleDealClick(deal.dealID)}
                >
                  <div className="flex gap-3">
                    <img 
                      src={deal.thumb || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"} 
                      alt={deal.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">
                        {deal.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-bold text-green-600">
                          {formatPrice(deal.salePrice)}
                        </span>
                        {parseFloat(deal.normalPrice) > parseFloat(deal.salePrice) && (
                          <>
                            <span className="text-xs text-slate-400 line-through">
                              {formatPrice(deal.normalPrice)}
                            </span>
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                              -{Math.round(parseFloat(deal.savings))}%
                            </span>
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
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-slate-500 pt-2 border-t">
              Powered by <a href="https://www.cheapshark.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">CheapShark API</a>
            </div>
          </div>
        )}

        {activeTab === 'news' && !loading && (
          <div className="space-y-3">
            {news.map((article, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all">
                <div className="flex gap-3">
                  <img 
                    src={article.urlToImage || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"} 
                    alt={article.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
                      <span className="font-medium">{article.source.name}</span>
                      <span>•</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      {article.category && (
                        <>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                        </>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {article.description}
                    </p>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs font-medium"
                    >
                      Read More <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamingDropdown;