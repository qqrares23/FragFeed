import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Edit, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const filteredCommunities = memberships?.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCommunitySelect = (communityName: string) => {
    setSelectedCommunity(communityName);
    setSearchQuery("");
    setShowDropdown(false);
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

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Quick Post</h3>
              <p className="text-white/80 text-sm">Post to your communities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
        {memberships === undefined ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading your communities...</p>
          </div>
        ) : memberships.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No communities joined</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Join communities to start posting
            </p>
          </div>
        ) : (
          <>
            {/* Community Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select Community
              </label>
              <div className="relative">
                <button 
                  className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-slate-100"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className={selectedCommunity ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}>
                    {selectedCommunity ? `r/${selectedCommunity}` : "Choose a community..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </button>
                
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg z-10 max-h-64 overflow-hidden">
                    {/* Search */}
                    {memberships.length > 5 && (
                      <div className="p-3 border-b border-slate-100 dark:border-slate-600">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                          <Input
                            type="text"
                            placeholder="Search communities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Communities List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCommunities.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                          {searchQuery ? "No communities found" : "No communities available"}
                        </div>
                      ) : (
                        filteredCommunities.map((community) => (
                          <button
                            key={community._id}
                            onClick={() => handleCommunitySelect(community.name)}
                            className="w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-3 text-left transition-colors"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={community.logoImageUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-bold text-xs">
                                {community.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 dark:text-slate-100">r/{community.name}</div>
                              {community.description && (
                                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
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

            {/* Auto-show hint if no community selected */}
            {!selectedCommunity && memberships.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    You have {memberships.length} communit{memberships.length === 1 ? 'y' : 'ies'} available
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Click the dropdown above to select where you want to post
                </p>
              </div>
            )}

            {/* Selected Community Info */}
            {selectedCommunity && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={memberships?.find(m => m.name === selectedCommunity)?.logoImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-bold">
                      {selectedCommunity.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">r/{selectedCommunity}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Ready to post!</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleCreatePost}
                disabled={!selectedCommunity}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              
              {selectedCommunity && (
                <Button
                  onClick={handleGoToCommunity}
                  variant="secondary"
                  className="w-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Visit r/{selectedCommunity}
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                You're a member of {memberships.length} communit{memberships.length === 1 ? 'y' : 'ies'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityQuickPost;