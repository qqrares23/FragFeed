import { useState, useEffect } from "react";
import { FaGamepad, FaSteam, FaNewspaper, FaExternalLinkAlt } from "react-icons/fa";
import "../styles/GamingDropdown.css";

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
      // CheapShark API - Get deals from Steam (storeID=1) with good ratings and savings
      const response = await fetch(
        'https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=60&pageSize=12&sortBy=Savings&desc=1&onSale=1&AAA=1'
      );
      
      if (!response.ok) throw new Error('Failed to fetch Steam deals');
      
      const deals: CheapSharkDeal[] = await response.json();
      
      // Filter for deals with good savings and ratings
      const filteredDeals = deals.filter(deal => 
        parseFloat(deal.savings) >= 25 && // At least 25% off
        deal.steamRatingPercent && 
        parseFloat(deal.steamRatingPercent) >= 70 // At least 70% positive reviews
      );
      
      setSteamDeals(filteredDeals.slice(0, 8));
    } catch (err) {
      setError('Failed to load Steam deals');
      console.error('CheapShark API error:', err);
      
      // Set fallback mock data when API fails
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
        } as CheapSharkDeal
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGamingNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using a simple gaming news mock since external news APIs often require keys
      setNews([
        {
          title: "Steam Winter Sale 2025: Best Deals and Discounts",
          url: "https://store.steampowered.com/",
          urlToImage: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
          description: "Discover the best gaming deals during Steam's annual winter sale with discounts up to 90% off on popular titles.",
          publishedAt: new Date().toISOString(),
          source: { name: "Steam News" }
        },
        {
          title: "Top 10 Most Anticipated Games of 2025",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
          description: "From AAA blockbusters to indie gems, here are the most anticipated game releases coming this year.",
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: "Gaming Weekly" }
        },
        {
          title: "Esports Championship Series Announces New Tournament",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg",
          description: "Major esports organizations team up for the biggest competitive gaming event of the year.",
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: { name: "Esports Central" }
        },
        {
          title: "Gaming Hardware: RTX 5000 Series Performance Review",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg",
          description: "In-depth analysis of the latest graphics cards and their impact on gaming performance.",
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: { name: "Tech Gaming" }
        }
      ]);
    } catch (err) {
      setError('Failed to load gaming news');
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDealClick = (dealID: string) => {
    // Redirect to CheapShark deal page which will then redirect to Steam
    window.open(`https://www.cheapshark.com/redirect?dealID=${dealID}`, '_blank');
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? 'Free' : `$${numPrice.toFixed(2)}`;
  };

  const getSavingsColor = (savings: string) => {
    const savingsNum = parseFloat(savings);
    if (savingsNum >= 75) return '#e74c3c'; // Red for huge savings
    if (savingsNum >= 50) return '#f39c12'; // Orange for good savings
    if (savingsNum >= 25) return '#27ae60'; // Green for decent savings
    return '#95a5a6'; // Gray for small savings
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="gaming-dropdown">
        <div className="gaming-header">
          <h3><FaGamepad /> Gaming Hub</h3>
          <div className="gaming-tabs">
            <button
              className={`tab-button ${activeTab === 'steam' ? 'active' : ''}`}
              onClick={() => setActiveTab('steam')}
            >
              <FaSteam /> Steam Deals
            </button>
            <button
              className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <FaNewspaper /> Gaming News
            </button>
          </div>
        </div>

        <div className="gaming-content">
          {loading && <div className="loading-state">Loading amazing deals...</div>}
          {error && <div className="error-state">{error}</div>}

          {activeTab === 'steam' && !loading && (
            <div className="steam-section">
              <div className="deals-grid">
                {steamDeals.map((deal) => (
                  <div 
                    key={deal.dealID} 
                    className="deal-card"
                    onClick={() => handleDealClick(deal.dealID)}
                  >
                    <div className="deal-image">
                      <img 
                        src={deal.thumb || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"} 
                        alt={deal.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                        }}
                      />
                      {parseFloat(deal.savings) > 0 && (
                        <div 
                          className="savings-badge"
                          style={{ backgroundColor: getSavingsColor(deal.savings) }}
                        >
                          -{Math.round(parseFloat(deal.savings))}%
                        </div>
                      )}
                    </div>
                    <div className="deal-info">
                      <h4 className="deal-title">{deal.title}</h4>
                      <div className="deal-store">
                        <span className="store-name">
                          <FaSteam /> Steam
                        </span>
                      </div>
                      <div className="deal-pricing">
                        <span className="current-price">
                          {formatPrice(deal.salePrice)}
                        </span>
                        {parseFloat(deal.normalPrice) > parseFloat(deal.salePrice) && (
                          <span className="original-price">
                            {formatPrice(deal.normalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="deal-meta">
                        {deal.steamRatingText && deal.steamRatingPercent && (
                          <div className="rating">
                            <span className="rating-text">
                              {deal.steamRatingText} ({deal.steamRatingPercent}%)
                            </span>
                          </div>
                        )}
                        {deal.metacriticScore && deal.metacriticScore !== "0" && (
                          <div className="metacritic-score">
                            Metacritic: {deal.metacriticScore}/100
                          </div>
                        )}
                      </div>
                      <div className="deal-action">
                        <FaExternalLinkAlt />
                        <span>View on Steam</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="powered-by">
                Powered by <a href="https://www.cheapshark.com/" target="_blank" rel="noopener noreferrer">CheapShark API</a>
              </div>
            </div>
          )}

          {activeTab === 'news' && !loading && (
            <div className="news-section">
              <div className="news-grid">
                {news.map((article, index) => (
                  <div key={index} className="news-card">
                    <div className="news-image">
                      <img 
                        src={article.urlToImage || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"} 
                        alt={article.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg";
                        }}
                      />
                    </div>
                    <div className="news-content">
                      <div className="news-meta">
                        <span className="news-source">{article.source.name}</span>
                        <span className="news-date">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="news-title">{article.title}</h4>
                      <p className="news-description">
                        {article.description?.substring(0, 120)}...
                      </p>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="read-more"
                      >
                        Read More <FaExternalLinkAlt />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GamingDropdown;