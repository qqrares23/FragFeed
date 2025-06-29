import { useState, useEffect } from "react";
import { FaGamepad, FaSteam, FaNewspaper, FaExternalLinkAlt, FaTwitch, FaDiscord, FaTimes } from "react-icons/fa";
import { SiEpicgames, SiRiotgames, SiUbisoft } from "react-icons/si";

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
        {
          title: "Indie Game Spotlight: Pizza Tower Wins Independent Game Award",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg",
          description: "The critically acclaimed indie platformer Pizza Tower takes home the prestigious Independent Game Festival award for excellence in design.",
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: { name: "Indie Focus" },
          category: "Awards",
          platform: "PC/Console"
        },
        {
          title: "PlayStation VR2: Top 10 Must-Play Games",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg",
          description: "Explore the best virtual reality experiences available on PlayStation VR2, from immersive adventures to innovative puzzle games.",
          publishedAt: new Date(Date.now() - 345600000).toISOString(),
          source: { name: "PlayStation Blog" },
          category: "VR",
          platform: "PlayStation"
        },
        {
          title: "Mobile Gaming Revenue Hits Record $120 Billion in 2024",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg",
          description: "Mobile gaming continues to dominate the industry with innovative gameplay mechanics and successful free-to-play monetization strategies.",
          publishedAt: new Date(Date.now() - 432000000).toISOString(),
          source: { name: "Mobile Gaming Today" },
          category: "Industry",
          platform: "Mobile"
        },
        {
          title: "Game Development: Unity 2025.1 Features AI-Powered Tools",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg",
          description: "Unity Technologies announces revolutionary AI-powered development tools that streamline game creation and reduce development time by 40%.",
          publishedAt: new Date(Date.now() - 518400000).toISOString(),
          source: { name: "Unity Technologies" },
          category: "Development",
          platform: "Development"
        },
        {
          title: "Accessibility in Gaming: Microsoft's Adaptive Controller 2.0",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg",
          description: "Microsoft unveils the next generation of their adaptive controller, making gaming more accessible for players with disabilities worldwide.",
          publishedAt: new Date(Date.now() - 604800000).toISOString(),
          source: { name: "Microsoft Gaming" },
          category: "Accessibility",
          platform: "Xbox/PC"
        },
        {
          title: "Retro Gaming: Nintendo Direct Announces Classic Game Collection",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg",
          description: "Nintendo surprises fans with a comprehensive collection of classic NES, SNES, and N64 games coming to Nintendo Switch Online.",
          publishedAt: new Date(Date.now() - 691200000).toISOString(),
          source: { name: "Nintendo" },
          category: "Retro",
          platform: "Nintendo Switch"
        },
        {
          title: "Cloud Gaming: Xbox Game Pass Ultimate Adds 50 New Titles",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg",
          description: "Microsoft expands Xbox Game Pass Ultimate with 50 new games including day-one releases and popular indie titles for cloud gaming.",
          publishedAt: new Date(Date.now() - 777600000).toISOString(),
          source: { name: "Xbox Wire" },
          category: "Cloud Gaming",
          platform: "Xbox/PC"
        },
        {
          title: "Twitch Introduces New Creator Monetization Features",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg",
          description: "Twitch announces enhanced monetization tools for streamers including improved subscription tiers and integrated merchandise sales.",
          publishedAt: new Date(Date.now() - 864000000).toISOString(),
          source: { name: "Twitch Blog" },
          category: "Streaming",
          platform: "Streaming"
        },
        {
          title: "Gaming Laptops: ASUS ROG 2025 Lineup Features Liquid Cooling",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg",
          description: "ASUS Republic of Gamers unveils their 2025 gaming laptop lineup featuring advanced liquid cooling systems and RTX 5000 series GPUs.",
          publishedAt: new Date(Date.now() - 950400000).toISOString(),
          source: { name: "ASUS ROG" },
          category: "Hardware",
          platform: "PC"
        },
        {
          title: "Discord Gaming: Voice Channels Get Spatial Audio Update",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg",
          description: "Discord rolls out spatial audio for voice channels, enhancing communication for gaming communities with 3D positional audio.",
          publishedAt: new Date(Date.now() - 1036800000).toISOString(),
          source: { name: "Discord" },
          category: "Communication",
          platform: "Multi-platform"
        }
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
      'VR': 'bg-cyan-100 text-cyan-700',
      'Industry': 'bg-pink-100 text-pink-700',
      'Development': 'bg-indigo-100 text-indigo-700',
      'Accessibility': 'bg-emerald-100 text-emerald-700',
      'Retro': 'bg-red-100 text-red-700',
      'Cloud Gaming': 'bg-sky-100 text-sky-700',
      'Streaming': 'bg-violet-100 text-violet-700',
      'Communication': 'bg-teal-100 text-teal-700',
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
      case 'Streaming': return <FaTwitch className="w-3 h-3" />;
      case 'Development': return <span className="text-xs font-bold">🛠️</span>;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - clicking this will close the modal */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <FaGamepad className="w-7 h-7" />
              Gaming Hub
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('steam')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'steam' 
                  ? 'bg-white text-primary-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <FaSteam className="w-5 h-5 inline mr-2" />
              Steam Deals
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'news' 
                  ? 'bg-white text-primary-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <FaNewspaper className="w-5 h-5 inline mr-2" />
              Gaming News
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-slate-600 text-lg">Loading amazing content...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          )}

          {activeTab === 'steam' && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {steamDeals.map((deal) => (
                  <div 
                    key={deal.dealID} 
                    onClick={() => handleDealClick(deal.dealID)}
                    className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div className="flex gap-4">
                      <img 
                        src={deal.thumb || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"} 
                        alt={deal.title}
                        className="w-20 h-20 rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 line-clamp-2 mb-3">
                          {deal.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl font-bold text-green-600">
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
                          <div className="text-sm text-slate-500">
                            {deal.steamRatingText} ({deal.steamRatingPercent}%)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-slate-500 pt-6 border-t">
                Powered by <a href="https://www.cheapshark.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">CheapShark API</a>
              </div>
            </div>
          )}

          {activeTab === 'news' && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {news.map((article, index) => (
                  <div key={index} className="card p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex gap-4">
                      <img 
                        src={article.urlToImage || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"} 
                        alt={article.title}
                        className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 flex-wrap">
                          <span className="font-medium">{article.source.name}</span>
                          <span>•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                          {article.category && (
                            <>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                {article.category}
                              </span>
                            </>
                          )}
                          {article.platform && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                {getPlatformIcon(article.platform)}
                                {article.platform}
                              </span>
                            </>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-900 line-clamp-2 mb-3">
                          {article.title}
                        </h4>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamingDropdown;