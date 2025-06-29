import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaTimes, FaSteam, FaUnlink, FaCheck } from "react-icons/fa";
import { SiEpicgames, SiRiotgames, SiUbisoft } from "react-icons/si";

interface GamingProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GamingProfileModal = ({ isOpen, onClose }: GamingProfileModalProps) => {
  const [activeTab, setActiveTab] = useState<'steam' | 'riot' | 'epic' | 'ubisoft'>('steam');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form states for each platform
  const [steamData, setSteamData] = useState({
    steamId: "",
    username: "",
    profileUrl: "",
    avatarUrl: ""
  });
  
  const [riotData, setRiotData] = useState({
    riotId: "",
    gameName: "",
    tagLine: ""
  });
  
  const [epicData, setEpicData] = useState({
    epicId: "",
    displayName: ""
  });
  
  const [ubisoftData, setUbisoftData] = useState({
    ubisoftId: "",
    username: ""
  });

  const connectSteam = useMutation(api.users.connectSteamProfile);
  const connectRiot = useMutation(api.users.connectRiotProfile);
  const connectEpic = useMutation(api.users.connectEpicProfile);
  const connectUbisoft = useMutation(api.users.connectUbisoftProfile);
  const disconnectProfile = useMutation(api.users.disconnectGamingProfile);

  if (!isOpen) return null;

  const handleSteamConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steamData.steamId || !steamData.username) {
      setError("Steam ID and username are required");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await connectSteam({
        steamId: steamData.steamId,
        username: steamData.username,
        profileUrl: steamData.profileUrl || `https://steamcommunity.com/id/${steamData.steamId}`,
        avatarUrl: steamData.avatarUrl
      });
      setSteamData({ steamId: "", username: "", profileUrl: "", avatarUrl: "" });
    } catch (err: any) {
      setError(err.message || "Failed to connect Steam profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRiotConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riotData.gameName || !riotData.tagLine) {
      setError("Game name and tag line are required");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await connectRiot({
        riotId: `${riotData.gameName}#${riotData.tagLine}`,
        gameName: riotData.gameName,
        tagLine: riotData.tagLine
      });
      setRiotData({ riotId: "", gameName: "", tagLine: "" });
    } catch (err: any) {
      setError(err.message || "Failed to connect Riot profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEpicConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epicData.displayName) {
      setError("Display name is required");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await connectEpic({
        epicId: epicData.displayName,
        displayName: epicData.displayName
      });
      setEpicData({ epicId: "", displayName: "" });
    } catch (err: any) {
      setError(err.message || "Failed to connect Epic Games profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUbisoftConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ubisoftData.username) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await connectUbisoft({
        ubisoftId: ubisoftData.username,
        username: ubisoftData.username
      });
      setUbisoftData({ ubisoftId: "", username: "" });
    } catch (err: any) {
      setError(err.message || "Failed to connect Ubisoft profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (platform: 'steam' | 'riot' | 'epic' | 'ubisoft') => {
    setIsLoading(true);
    try {
      await disconnectProfile({ platform });
    } catch (err: any) {
      setError(err.message || "Failed to disconnect profile");
    } finally {
      setIsLoading(false);
    }
  };

  const platforms = [
    { id: 'steam', name: 'Steam', icon: FaSteam, color: 'from-blue-500 to-blue-600' },
    { id: 'riot', name: 'Riot Games', icon: SiRiotgames, color: 'from-red-500 to-red-600' },
    { id: 'epic', name: 'Epic Games', icon: SiEpicgames, color: 'from-gray-700 to-gray-800' },
    { id: 'ubisoft', name: 'Ubisoft', icon: SiUbisoft, color: 'from-blue-600 to-indigo-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gaming Profiles</h2>
              <p className="text-white/80">Connect your gaming accounts</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          {/* Platform Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setActiveTab(platform.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  activeTab === platform.id 
                    ? 'bg-white text-primary-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <platform.icon className="w-4 h-4" />
                {platform.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-700">
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Steam Tab */}
          {activeTab === 'steam' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaSteam className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Connect Steam</h3>
                <p className="text-slate-600">Link your Steam profile to show your gaming identity</p>
              </div>
              
              <form onSubmit={handleSteamConnect} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Steam ID or Custom URL
                  </label>
                  <input
                    type="text"
                    value={steamData.steamId}
                    onChange={(e) => setSteamData({...steamData, steamId: e.target.value})}
                    placeholder="your_steam_id"
                    className="input"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={steamData.username}
                    onChange={(e) => setSteamData({...steamData, username: e.target.value})}
                    placeholder="Your Steam display name"
                    className="input"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Profile URL (optional)
                  </label>
                  <input
                    type="url"
                    value={steamData.profileUrl}
                    onChange={(e) => setSteamData({...steamData, profileUrl: e.target.value})}
                    placeholder="https://steamcommunity.com/id/yourprofile"
                    className="input"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !steamData.steamId || !steamData.username}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Connect Steam
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Riot Tab */}
          {activeTab === 'riot' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SiRiotgames className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Connect Riot Games</h3>
                <p className="text-slate-600">Link your Riot ID for Valorant, League of Legends, and more</p>
              </div>
              
              <form onSubmit={handleRiotConnect} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Game Name
                  </label>
                  <input
                    type="text"
                    value={riotData.gameName}
                    onChange={(e) => setRiotData({...riotData, gameName: e.target.value})}
                    placeholder="YourGameName"
                    className="input"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tag Line
                  </label>
                  <input
                    type="text"
                    value={riotData.tagLine}
                    onChange={(e) => setRiotData({...riotData, tagLine: e.target.value})}
                    placeholder="TAG"
                    className="input"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Your Riot ID will be: {riotData.gameName}#{riotData.tagLine}
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !riotData.gameName || !riotData.tagLine}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Connect Riot Games
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Epic Tab */}
          {activeTab === 'epic' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SiEpicgames className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Connect Epic Games</h3>
                <p className="text-slate-600">Link your Epic Games account for Fortnite, Rocket League, and more</p>
              </div>
              
              <form onSubmit={handleEpicConnect} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Epic Games Display Name
                  </label>
                  <input
                    type="text"
                    value={epicData.displayName}
                    onChange={(e) => setEpicData({...epicData, displayName: e.target.value})}
                    placeholder="YourEpicName"
                    className="input"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !epicData.displayName}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Connect Epic Games
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Ubisoft Tab */}
          {activeTab === 'ubisoft' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SiUbisoft className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Connect Ubisoft</h3>
                <p className="text-slate-600">Link your Ubisoft account for Rainbow Six Siege, Assassin's Creed, and more</p>
              </div>
              
              <form onSubmit={handleUbisoftConnect} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ubisoft Username
                  </label>
                  <input
                    type="text"
                    value={ubisoftData.username}
                    onChange={(e) => setUbisoftData({...ubisoftData, username: e.target.value})}
                    placeholder="YourUbisoftUsername"
                    className="input"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !ubisoftData.username}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Connect Ubisoft
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamingProfileModal;