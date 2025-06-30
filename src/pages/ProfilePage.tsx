import { useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import GamingProfileModal from "../components/GamingProfileModal";
import ProfileEditModal from "../components/ProfileEditModal";
import { 
  User, 
  Users, 
  Minus, 
  CalendarDays, 
  Plus, 
  Unlink, 
  Edit, 
  MapPin, 
  Globe, 
  Camera, 
  Gamepad2, 
  UserPlus, 
  UserMinus, 
  Eye, 
  EyeOff,
  Crown,
  Star,
  TrendingUp,
  MessageCircle,
  Heart,
  Award,
  Zap,
  Target,
  Shield,
  Bookmark
} from "lucide-react";
import { SiEpicgames, SiRiotgames, SiUbisoft } from "react-icons/si";
import { FaSteam } from "react-icons/fa";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useUser();
  const isOwnProfile = user?.username === username;
  const [showGamingModal, setShowGamingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  
  const {results: posts, loadMore, status} = usePaginatedQuery(api.post.userPosts, {
    authorUsername: username || "",
  }, {initialNumItems: 20});
  
  const stats = useQuery(api.users.getPublicUser, {username: username || ""});
  const memberships = useQuery(api.subreddit.getUserMemberships, {username: username || ""});
  
  // Follow system queries - only if we have a valid user ID
  const isFollowing = useQuery(api.follows.isFollowing, 
    stats?._id && !isOwnProfile ? { targetUserId: stats._id } : "skip"
  );
  const followerCount = useQuery(api.follows.getFollowerCount, 
    stats?._id ? { userId: stats._id } : "skip"
  );
  const followingCount = useQuery(api.follows.getFollowingCount, 
    stats?._id ? { userId: stats._id } : "skip"
  );
  const followers = useQuery(api.follows.getFollowers,
    stats?._id && showFollowers ? { userId: stats._id, limit: 20 } : "skip"
  );
  const following = useQuery(api.follows.getFollowing,
    stats?._id && showFollowing ? { userId: stats._id, limit: 20 } : "skip"
  );
  
  const leaveSubreddit = useMutation(api.subreddit.leave);
  const disconnectProfile = useMutation(api.users.disconnectGamingProfile);
  const followUser = useMutation(api.follows.followUser);
  const unfollowUser = useMutation(api.follows.unfollowUser);

  const handleLeaveSubreddit = async (subredditId: string) => {
    if (!isOwnProfile) return;
    
    try {
      await leaveSubreddit({ subredditId: subredditId as any });
    } catch (error) {
      console.error("Error leaving subreddit:", error);
    }
  };

  const handleDisconnectGamingProfile = async (platform: 'steam' | 'riot' | 'epic' | 'ubisoft') => {
    if (!isOwnProfile) return;
    
    try {
      await disconnectProfile({ platform });
    } catch (error) {
      console.error("Error disconnecting profile:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!stats?._id || isOwnProfile) return;
    
    try {
      if (isFollowing) {
        await unfollowUser({ targetUserId: stats._id });
      } else {
        await followUser({ targetUserId: stats._id });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
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

  const getProfileBadges = () => {
    const badges = [];
    const postCount = stats?.posts || 0;
    const membershipCount = memberships?.length || 0;
    const followerCountNum = followerCount || 0;

    if (postCount >= 100) badges.push({ icon: Crown, label: "Prolific Creator", color: "from-yellow-500 to-orange-500" });
    if (postCount >= 50) badges.push({ icon: Star, label: "Active Contributor", color: "from-blue-500 to-purple-500" });
    if (followerCountNum >= 100) badges.push({ icon: Users, label: "Influencer", color: "from-pink-500 to-red-500" });
    if (membershipCount >= 10) badges.push({ icon: Target, label: "Community Explorer", color: "from-green-500 to-teal-500" });
    if (stats?.steamProfile || stats?.riotProfile || stats?.epicProfile || stats?.ubisoftProfile) {
      badges.push({ icon: Gamepad2, label: "Gamer", color: "from-indigo-500 to-purple-500" });
    }

    return badges;
  };

  if (posts === undefined || stats === undefined) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-slate-200 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // If user doesn't exist, stats will have no _id
  if (!stats._id) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md mx-4">
          <CardContent>
            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">User not found</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The user <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">u/{username}</span> does not exist.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileBadges = getProfileBadges();

  return (
    <TooltipProvider>
      <div className="min-h-screen pt-20 pb-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Profile Header */}
          <Card className="mb-8 overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-2xl border-0">
            {/* Banner Section */}
            <div className="relative h-48 lg:h-64">
              {stats?.bannerImageUrl ? (
                <div className="relative w-full h-full">
                  <img 
                    src={stats.bannerImageUrl} 
                    alt="Profile banner" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
                </div>
              )}
              
              {isOwnProfile && (
                <Button
                  onClick={() => setShowEditModal(true)}
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 backdrop-blur-md bg-white/90 hover:bg-white text-slate-900 shadow-lg border-0"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Edit Banner
                </Button>
              )}
            </div>

            {/* Profile Info Section */}
            <CardContent className="p-6 lg:p-8 relative">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Profile Picture */}
                <div className="relative -mt-16 lg:-mt-20 flex-shrink-0">
                  <div className="relative">
                    <Avatar className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-white dark:border-slate-800 shadow-2xl">
                      <AvatarImage src={stats?.profilePictureUrl} className="object-cover" />
                      <AvatarFallback className="text-2xl lg:text-4xl font-bold bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                        {username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <Button
                        onClick={() => setShowEditModal(true)}
                        variant="secondary"
                        size="sm"
                        className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-white hover:bg-slate-50 text-slate-900 shadow-lg border-2 border-white"
                      >
                        <Camera className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Username and Badges */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
                          u/{username}
                        </h1>
                        {profileBadges.slice(0, 2).map((badge, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger>
                              <Badge className={`bg-gradient-to-r ${badge.color} text-white border-0 shadow-lg`}>
                                <badge.icon className="w-3 h-3 mr-1" />
                                {badge.label}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{badge.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>

                      {/* Bio */}
                      {stats?.bio && (
                        <p className="text-slate-600 dark:text-slate-400 text-lg mb-4 leading-relaxed">
                          {stats.bio}
                        </p>
                      )}

                      {/* Location and Website */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {stats?.location && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">{stats.location}</span>
                          </div>
                        )}
                        {stats?.website && (
                          <a 
                            href={stats.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            <span className="text-sm font-medium">Website</span>
                          </a>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{stats?.posts || 0}</span>
                            <span className="text-slate-600 dark:text-slate-400 text-sm ml-1">posts</span>
                          </div>
                        </div>
                        
                        {(followerCount && followerCount > 0) && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                              <Heart className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{followerCount}</span>
                              <span className="text-slate-600 dark:text-slate-400 text-sm ml-1">followers</span>
                            </div>
                          </div>
                        )}
                        
                        {(followingCount && followingCount > 0) && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                              <UserPlus className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{followingCount}</span>
                              <span className="text-slate-600 dark:text-slate-400 text-sm ml-1">following</span>
                            </div>
                          </div>
                        )}
                        
                        {(memberships?.length && memberships.length > 0) && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{memberships.length}</span>
                              <span className="text-slate-600 dark:text-slate-400 text-sm ml-1">communities</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {!isOwnProfile && user && stats?._id && (
                        <Button
                          onClick={handleFollowToggle}
                          variant={isFollowing ? "outline" : "default"}
                          disabled={!stats._id}
                          className={`px-6 py-2 font-semibold transition-all duration-300 ${
                            isFollowing 
                              ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-300' 
                              : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserMinus className="w-4 h-4 mr-2" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                      )}
                      
                      {isOwnProfile && (
                        <Button
                          onClick={() => setShowEditModal(true)}
                          variant="outline"
                          className="px-6 py-2 font-semibold border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-2">
              <TabsTrigger value="posts" className="rounded-xl font-medium">
                <MessageCircle className="w-4 h-4 mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="gaming" className="rounded-xl font-medium">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Gaming
              </TabsTrigger>
              {(followerCount && followerCount > 0) && (
                <TabsTrigger value="followers" className="rounded-xl font-medium">
                  <Heart className="w-4 h-4 mr-2" />
                  Followers
                </TabsTrigger>
              )}
              {(followingCount && followingCount > 0) && (
                <TabsTrigger value="following" className="rounded-xl font-medium">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Following
                </TabsTrigger>
              )}
              {(memberships?.length && memberships.length > 0) && (
                <TabsTrigger value="communities" className="rounded-xl font-medium">
                  <Users className="w-4 h-4 mr-2" />
                  Communities
                </TabsTrigger>
              )}
              <TabsTrigger value="achievements" className="rounded-xl font-medium">
                <Award className="w-4 h-4 mr-2" />
                Badges
              </TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-6">
              {posts.length === 0 ? (
                <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">No posts yet</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {isOwnProfile 
                      ? "You haven't created any posts yet. Join a community and start sharing!"
                      : `${username} hasn't posted anything yet.`
                    }
                  </p>
                </Card>
              ) : (
                <>
                  {posts.map((post, index) => (
                    <div 
                      key={post._id}
                      className="animate-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <PostCard post={post} showSubreddit={true} />
                    </div>
                  ))}
                  {status === "CanLoadMore" && (
                    <div className="text-center">
                      <Button 
                        onClick={() => loadMore(20)}
                        variant="outline"
                        className="px-8 py-3 rounded-xl font-medium"
                      >
                        Load More Posts
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Gaming Tab */}
            <TabsContent value="gaming">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-white" />
                      </div>
                      Gaming Profiles
                    </CardTitle>
                    {isOwnProfile && (
                      <Button
                        onClick={() => setShowGamingModal(true)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-purple-300 hover:bg-purple-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Connect Account
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Steam Profile */}
                    {stats?.steamProfile && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                              <FaSteam className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{stats.steamProfile.username}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Steam</p>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <Button
                              onClick={() => handleDisconnectGamingProfile('steam')}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Unlink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {stats.steamProfile.profileUrl && (
                          <a
                            href={stats.steamProfile.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            View Steam Profile
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Riot Profile */}
                    {stats?.riotProfile && (
                      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                              <SiRiotgames className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{stats.riotProfile.gameName}#{stats.riotProfile.tagLine}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Riot Games</p>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <Button
                              onClick={() => handleDisconnectGamingProfile('riot')}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Unlink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Epic Profile */}
                    {stats?.epicProfile && (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                              <SiEpicgames className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{stats.epicProfile.displayName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Epic Games</p>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <Button
                              onClick={() => handleDisconnectGamingProfile('epic')}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Unlink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ubisoft Profile */}
                    {stats?.ubisoftProfile && (
                      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                              <SiUbisoft className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{stats.ubisoftProfile.username}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Ubisoft</p>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <Button
                              onClick={() => handleDisconnectGamingProfile('ubisoft')}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Unlink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* No gaming profiles */}
                    {!stats?.steamProfile && !stats?.riotProfile && !stats?.epicProfile && !stats?.ubisoftProfile && (
                      <div className="col-span-full text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Gamepad2 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">No gaming profiles connected</h3>
                        {isOwnProfile && (
                          <p className="text-slate-600 dark:text-slate-400 mb-6">Connect your gaming accounts to show your gaming identity</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Followers Tab */}
            {(followerCount && followerCount > 0) && (
              <TabsContent value="followers">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      Followers ({followerCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {followers && followers.length > 0 ? (
                        followers.map((follower) => (
                          <div key={follower._id} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-semibold">
                                {follower.user?.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                u/{follower.user?.username}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Followed {formatTimeAgo(follower.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="col-span-full text-slate-500 dark:text-slate-400 text-center py-8">No followers to display</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Following Tab */}
            {(followingCount && followingCount > 0) && (
              <TabsContent value="following">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-white" />
                      </div>
                      Following ({followingCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {following && following.length > 0 ? (
                        following.map((follow) => (
                          <div key={follow._id} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-semibold">
                                {follow.user?.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                u/{follow.user?.username}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Following since {formatTimeAgo(follow.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="col-span-full text-slate-500 dark:text-slate-400 text-center py-8">No following to display</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Communities Tab */}
            {(memberships?.length && memberships.length > 0) && (
              <TabsContent value="communities">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      Communities ({memberships.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {memberships.map((membership) => (
                        <div key={membership._id} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={membership.logoImageUrl} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-bold">
                                    {membership.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-bold text-slate-900 dark:text-slate-100">r/{membership.name}</h3>
                                  {membership.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                                      {membership.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <CalendarDays className="w-3 h-3" />
                                <span>Joined {new Date(membership.joinedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {isOwnProfile && (
                              <Button 
                                onClick={() => handleLeaveSubreddit(membership._id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    Profile Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profileBadges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profileBadges.map((badge, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-center">
                          <div className={`w-16 h-16 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                            <badge.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{badge.label}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Earned through community participation
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">No badges yet</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {isOwnProfile 
                          ? "Keep posting and engaging to earn profile badges!"
                          : `${username} hasn't earned any badges yet.`
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Gaming Profile Modal */}
        {showGamingModal && (
          <GamingProfileModal
            isOpen={showGamingModal}
            onClose={() => setShowGamingModal(false)}
          />
        )}

        {/* Profile Edit Modal */}
        {showEditModal && stats && (
          <ProfileEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            currentProfile={{
              bio: stats.bio,
              location: stats.location,
              website: stats.website,
              profilePictureUrl: stats.profilePictureUrl,
              bannerImageUrl: stats.bannerImageUrl,
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default ProfilePage;