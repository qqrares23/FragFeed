import { useState, useEffect } from "react";
import { FaGamepad, FaSteam, FaNewspaper, FaExternalLinkAlt } from "react-icons/fa";

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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGamingNews = async () => {
    setLoading(true);
    setError(null);
    try {
      setNews([
        {
          title: "Steam Winter Sale 2025: Best Deals and Discounts",
          url: "https://store.steampowered.com/",
          urlToImage: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
          description: "Discover the best gaming deals during Steam's annual winter sale.",
          publishedAt: new Date().toISOString(),
          source: { name: "Steam News" }
        },
        {
          title: "Top 10 Most Anticipated Games of 2025",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
          description: "From AAA blockbusters to indie gems, here are the most anticipated releases.",
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: "Gaming Weekly" }
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-[800px] max-w-[95vw] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-[600px] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
            <FaGamepad className="w-6 h-6" />
            Gaming Hub
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('steam')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'steam' 
                  ? 'bg-white text-primary-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <FaSteam className="w-4 h-4 inline mr-2" />
              Steam Deals
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'news' 
                  ? 'bg-white text-primary-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <FaNewspaper className="w-4 h-4 inline mr-2" />
              Gaming News
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Loading amazing deals...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {activeTab === 'steam' && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {steamDeals.map((deal) => (
                  <div 
                    key={deal.dealID} 
                    onClick={() => handleDealClick(deal.dealID)}
                    className="card p-4 cursor-pointer hover:shadow-lg transition-all"
                  >
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
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
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
              <div className="text-center text-xs text-slate-500 pt-4 border-t">
                Powered by <a href="https://www.cheapshark.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">CheapShark API</a>
              </div>
            </div>
          )}

          {activeTab === 'news' && !loading && (
            <div className="space-y-4">
              {news.map((article, index) => (
                <div key={index} className="card p-4 hover:shadow-lg transition-all">
                  <div className="flex gap-4">
                    <img 
                      src={article.urlToImage || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"} 
                      alt={article.title}
                      className="w-20 h-20 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="font-medium">{article.source.name}</span>
                        <span>•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
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
                        Read More <FaExternalLinkAlt className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GamingDropdown;