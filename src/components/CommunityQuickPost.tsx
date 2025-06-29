import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaTimes, FaPlus, FaEdit, FaChevronDown, FaSearch } from "react-icons/fa";

interface CommunityQuickPostProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommunityQuickPost = ({ isOpen, onClose }: CommunityQuickPostProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Get user's communities
  const memberships = useQuery(
    api.subreddit.getUserMemberships, 
    user?.username ? { username: user.username } : "skip"
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCommunity("");
      setSearchQuery("");
      setShowDropdown(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCommunities = memberships?.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCommunitySelect = (communityName: string) => {
    setSelectedCommunity(communityName);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleCreatePost = () => {
    if (selectedCommunity) {
      navigate(`/r/${selectedCommunity}/submit`);
      onClose();
    }
  };

  const handleGoToCommunity = () => {
    if (selectedCommunity) {
      navigate(`/r/${selectedCommunity}`);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Panel positioned for both mobile and desktop */}
      <div className="absolute right-4 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FaUsers className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold">Quick Post</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-2">Post to your communities</p>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {memberships === undefined ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your communities...</p>
            </div>
          ) : memberships.length === 0 ? (
            <div className="text-center py-8">
              <FaUsers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No communities joined</p>
              <p className="text-sm text-slate-400 mt-1">
                Join communities to start posting
              </p>
            </div>
          ) : (
            <>
              {/* Community Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Select Community
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between p-3 border border-slate-300 rounded-xl bg-white hover:border-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <span className={selectedCommunity ? "text-slate-900" : "text-slate-500"}>
                      {selectedCommunity ? `r/${selectedCommunity}` : "Choose a community..."}
                    </span>
                    <FaChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-80 overflow-hidden">
                      {/* Search */}
                      {memberships.length > 5 && (
                        <div className="p-3 border-b border-slate-100">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search communities..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                              autoFocus
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Communities List */}
                      <div className="max-h-64 overflow-y-auto">
                        {filteredCommunities.length === 0 ? (
                          <div className="p-4 text-center text-slate-500">
                            {searchQuery ? "No communities found" : "No communities available"}
                          </div>
                        ) : (
                          filteredCommunities.map((community) => (
                            <button
                              key={community._id}
                              onClick={() => handleCommunitySelect(community.name)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left focus:outline-none focus:bg-slate-50"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                  {community.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900">r/{community.name}</div>
                                {community.description && (
                                  <div className="text-sm text-slate-500 truncate">
                                    {community.description}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Auto-show dropdown if no community selected and there are communities */}
              {!selectedCommunity && !showDropdown && memberships.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaUsers className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      You have {memberships.length} communit{memberships.length === 1 ? 'y' : 'ies'} available
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Click the dropdown above to select where you want to post
                  </p>
                </div>
              )}

              {/* Selected Community Info */}
              {selectedCommunity && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">
                        {selectedCommunity.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">r/{selectedCommunity}</div>
                      <div className="text-sm text-slate-600">Ready to post!</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCreatePost}
                  disabled={!selectedCommunity}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaEdit className="w-4 h-4" />
                  Create Post
                </button>
                
                {selectedCommunity && (
                  <button
                    onClick={handleGoToCommunity}
                    className="w-full btn btn-secondary"
                  >
                    <FaUsers className="w-4 h-4" />
                    Visit r/{selectedCommunity}
                  </button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="border-t border-slate-200 pt-4">
                <div className="text-xs text-slate-500 text-center">
                  You're a member of {memberships.length} communit{memberships.length === 1 ? 'y' : 'ies'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CommunityQuickPost;