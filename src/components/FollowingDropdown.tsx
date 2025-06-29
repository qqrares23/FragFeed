import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserPlus, UserMinus, Eye, Users, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FollowingDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const FollowingDropdown = ({ isOpen, onClose }: FollowingDropdownProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const currentUser = useQuery(api.users.current);
  const following = useQuery(
    api.follows.getFollowing,
    currentUser ? { userId: currentUser._id, limit: 100 } : "skip"
  );
  const followingCount = useQuery(
    api.follows.getFollowingCount,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  
  const unfollowUser = useMutation(api.follows.unfollowUser);

  const handleUnfollow = async (userId: string) => {
    if (window.confirm("Are you sure you want to unfollow this user?")) {
      try {
        await unfollowUser({ targetUserId: userId as any });
      } catch (error) {
        console.error("Error unfollowing user:", error);
      }
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredFollowing = following?.filter(follow =>
    follow.user?.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 w-96 max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-semibold">Following</h3>
            {followingCount !== undefined && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                {followingCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search */}
        {following && following.length > 5 && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                placeholder="Search following..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {!following ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Loading...</p>
            </div>
          </div>
        ) : following.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Not following anyone yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Start following users to see their posts in your feed
            </p>
          </div>
        ) : filteredFollowing.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No users found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredFollowing.map((follow) => (
              <div
                key={follow._id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Link
                    to={`/u/${follow.user?.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-semibold">
                        {follow.user?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        u/{follow.user?.username}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Following since {formatTimeAgo(follow.createdAt)}
                      </p>
                    </div>
                  </Link>
                  
                  <Button
                    onClick={() => follow.user && handleUnfollow(follow.user._id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {following && following.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Following {followingCount} {followingCount === 1 ? 'user' : 'users'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              You'll get notified when they post
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowingDropdown;