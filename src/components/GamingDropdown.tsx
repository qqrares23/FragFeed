import { useState, useEffect } from "react";
import { FaGamepad, FaSteam, FaNewspaper } from "react-icons/fa";
import "../styles/GamingDropdown.css";

interface SteamGame {
  appid: number;
  name: string;
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  header_image: string;
  short_description: string;
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
  const [steamGames, setSteamGames] = useState<SteamGame[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popular game IDs for Steam price checking
  const popularGameIds = [
    730,    // CS2
    440,    // TF2
    570,    // Dota 2
    1172470, // Apex Legends
    271590,  // GTA V
    1091500, // Cyberpunk 2077
    1245620, // Elden Ring
    1938090, // Call of Duty
    1086940, // Baldur's Gate 3
    1174180  // Red Dead Redemption 2
  ];

  useEffect(() => {
    if (isOpen && activeTab === 'steam' && steamGames.length === 0) {
      fetchSteamPrices();
    }
    if (isOpen && activeTab === 'news' && news.length === 0) {
      fetchGamingNews();
    }
  }, [isOpen, activeTab]);

  const fetchSteamPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using a CORS proxy for Steam API
      const gameIds = popularGameIds.slice(0, 6).join(',');
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://store.steampowered.com/api/appdetails?appids=${gameIds}&filters=price_overview,name,header_image,short_description`
        )}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch Steam data');
      
      const data = await response.json();
      const steamData = JSON.parse(data.contents);
      
      const games: SteamGame[] = [];
      Object.entries(steamData).forEach(([appid, gameData]: [string, any]) => {
        if (gameData.success && gameData.data) {
          games.push({
            appid: parseInt(appid),
            name: gameData.data.name,
            price_overview: gameData.data.price_overview,
            header_image: gameData.data.header_image,
            short_description: gameData.data.short_description
          });
        }
      });
      
      setSteamGames(games);
    } catch (err) {
      setError('Failed to load Steam prices');
      console.error('Steam API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGamingNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using NewsAPI with gaming-related keywords
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(
          'https://newsapi.org/v2/everything?q=gaming OR esports OR "new games" OR "game release"&sortBy=publishedAt&pageSize=10&apiKey=demo'
        )}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch news');
      
      const data = await response.json();
      const newsData = JSON.parse(data.contents);
      
      if (newsData.articles) {
        setNews(newsData.articles.slice(0, 8));
      } else {
        // Fallback mock data if API fails
        setNews([
          {
            title: "New Gaming Trends in 2025",
            url: "#",
            urlToImage: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
            description: "Explore the latest gaming trends and upcoming releases for 2025.",
            publishedAt: new Date().toISOString(),
            source: { name: "Gaming News" }
          },
          {
            title: "Esports Championship Updates",
            url: "#",
            urlToImage: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
            description: "Latest updates from major esports tournaments and championships.",
            publishedAt: new Date().toISOString(),
            source: { name: "Esports Today" }
          }
        ]);
      }
    } catch (err) {
      setError('Failed to load gaming news');
      // Set fallback data
      setNews([
        {
          title: "Gaming Industry Updates",
          url: "#",
          urlToImage: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
          description: "Stay updated with the latest gaming industry news and releases.",
          publishedAt: new Date().toISOString(),
          source: { name: "Gaming Hub" }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="gaming-dropdown">
        <div className="gaming-header">
          <h3>Gaming Hub</h3>
          <div className="gaming-tabs">
            <button
              className={`tab-button ${activeTab === 'steam' ? 'active' : ''}`}
              onClick={() => setActiveTab('steam')}
            >
              <FaSteam /> Steam Prices
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
          {loading && <div className="loading-state">Loading...</div>}
          {error && <div className="error-state">{error}</div>}

          {activeTab === 'steam' && !loading && (
            <div className="steam-section">
              <div className="games-grid">
                {steamGames.map((game) => (
                  <div key={game.appid} className="game-card">
                    <div className="game-image">
                      <img src={game.header_image} alt={game.name} />
                    </div>
                    <div className="game-info">
                      <h4 className="game-title">{game.name}</h4>
                      <p className="game-description">
                        {game.short_description?.substring(0, 80)}...
                      </p>
                      <div className="game-price">
                        {game.price_overview ? (
                          <>
                            {game.price_overview.discount_percent > 0 && (
                              <span className="discount">
                                -{game.price_overview.discount_percent}%
                              </span>
                            )}
                            <span className="price">
                              {game.price_overview.final_formatted}
                            </span>
                            {game.price_overview.discount_percent > 0 && (
                              <span className="original-price">
                                {game.price_overview.initial_formatted}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="free">Free to Play</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                        {article.description?.substring(0, 100)}...
                      </p>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="read-more"
                      >
                        Read More
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