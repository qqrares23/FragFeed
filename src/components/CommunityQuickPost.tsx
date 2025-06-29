import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Edit, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommunityQuickPostProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommunityQuickPost = ({ isOpen, onClose }: CommunityQuickPostProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
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
    }
  }, [isOpen]);

  const filteredCommunities = memberships?.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCommunitySelect = (communityName: string) => {
    setSelectedCommunity(communityName);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {memberships === undefined ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your communities...</p>
            </div>
          ) : memberships.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className={selectedCommunity ? "text-slate-900" : "text-slate-500"}>
                        {selectedCommunity ? `r/${selectedCommunity}` : "Choose a community..."}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    {/* Search */}
                    {memberships.length > 5 && (
                      <>
                        <div className="p-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              placeholder="Search communities..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    {/* Communities List */}
                    <div className="max-h-64 overflow-y-auto">
                      {filteredCommunities.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">
                          {searchQuery ? "No communities found" : "No communities available"}
                        </div>
                      ) : (
                        filteredCommunities.map((community) => (
                          <DropdownMenuItem
                            key={community._id}
                            onClick={() => handleCommunitySelect(community.name)}
                            className="p-3 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {community.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900">r/{community.name}</div>
                                {community.description && (
                                  <div className="text-sm text-slate-500 truncate">
                                    {community.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Auto-show hint if no community selected */}
              {!selectedCommunity && memberships.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Users className="w-4 h-4" />
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
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {selectedCommunity.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900">r/{selectedCommunity}</div>
                      <div className="text-sm text-slate-600">Ready to post!</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleCreatePost}
                  disabled={!selectedCommunity}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
                
                {selectedCommunity && (
                  <Button
                    onClick={handleGoToCommunity}
                    variant="outline"
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Visit r/{selectedCommunity}
                  </Button>
                )}
              </div>

              {/* Quick Stats */}
              <DropdownMenuSeparator />
              <div className="text-xs text-slate-500 text-center">
                You're a member of {memberships.length} communit{memberships.length === 1 ? 'y' : 'ies'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityQuickPost;