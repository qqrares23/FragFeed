import { useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import GamingProfileModal from "../components/GamingProfileModal";
import ProfileEditModal from "../components/ProfileEditModal";
import { User, Users, Minus, CalendarDays, Plus, Unlink, Edit, MapPin, Globe, Camera, Gamepad2, UserPlus, UserMinus, Eye, EyeOff } from "lucide-react";
import { SiEpicgames, SiRiotgames, SiUbisoft } from "react-icons/si";
import { FaSteam } from "react-icons/fa";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useUser();
  const isOwnProfile = user?.username === username;
  const [showGamingModal, setShowGamingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  
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

  if (posts === undefined || stats === undefined) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If user doesn't exist, stats will have no _id
  if (!stats._id) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">User not found</h1>
          <p className="text-slate-600 dark:text-slate-400">The user u/{username} does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          {/* Banner */}
          <div className="relative h-48 bg-gradient-to-r from-primary-500 to-secondary-500">
            {stats?.bannerImageUrl ? (
              <img 
                src={stats.bannerImageUrl} 
                alt="Profile banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary-500 to-secondary-500" />
            )}
            {isOwnProfile && (
              <Button
                onClick={() => setShowEditModal(true)}
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 backdrop-blur-sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {/* Profile Info */}
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Profile Picture */}
              <div className="relative -mt-16 sm:-mt-20">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white dark:border-slate-800">
                  <AvatarImage src={stats?.profilePictureUrl} />
                  <AvatarFallback className="text-2xl">
                    <User className="w-8 h-8 sm:w-12 sm:h-12" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">u/{username}</h1>
                    {stats?.bio && (
                      <p className="text-slate-600 dark:text-slate-400 mt-2">{stats.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3">
                      {stats?.location && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{stats.location}</span>
                        </div>
                      )}
                      {stats?.website && (
                        <a 
                          href={stats.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="text-sm">Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {!isOwnProfile && user && stats?._id && (
                      <Button
                        onClick={handleFollowToggle}
                        variant={isFollowing ? "outline" : "default"}
                        disabled={!stats._id}
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
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">{stats?.posts || 0}</span>
                    <span>posts</span>
                  </div>
                  {(followerCount && followerCount > 0) && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">{followerCount}</span>
                      <span>followers</span>
                    </div>
                  )}
                  {(followingCount && followingCount > 0) && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">{followingCount}</span>
                      <span>following</span>
                    </div>
                  )}
                  {(memberships?.length && memberships.length > 0) && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">{memberships.length}</span>
                      <span>communities</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Followers/Following Section */}
        {((followerCount && followerCount > 0) || (followingCount && followingCount > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Followers */}
            {(followerCount && followerCount > 0) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary-600" />
                      Followers ({followerCount})
                    </CardTitle>
                    <Button
                      onClick={() => setShowFollowers(!showFollowers)}
                      variant="ghost"
                      size="sm"
                    >
                      {showFollowers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showFollowers ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {followers && followers.length > 0 ? (
                        followers.map((follower) => (
                          <div key={follower._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-6 h-6 lg:w-8 lg:h-8">
                                <AvatarFallback className="text-xs lg:text-sm">
                                  {follower.user?.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm lg:text-base">
                                  u/{follower.user?.username}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Followed {formatTimeAgo(follower.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No followers to display</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Click the eye icon to view followers
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Following */}
            {(followingCount && followingCount > 0) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-primary-600" />
                      Following ({followingCount})
                    </CardTitle>
                    <Button
                      onClick={() => setShowFollowing(!showFollowing)}
                      variant="ghost"
                      size="sm"
                    >
                      {showFollowing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showFollowing ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {following && following.length > 0 ? (
                        following.map((follow) => (
                          <div key={follow._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-6 h-6 lg:w-8 lg:h-8">
                                <AvatarFallback className="text-xs lg:text-sm">
                                  {follow.user?.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm lg:text-base">
                                  u/{follow.user?.username}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Following since {formatTimeAgo(follow.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No following to display</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Click the eye icon to view following
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Gaming Profiles Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary-600" />
                Gaming Profiles
              </CardTitle>
              {isOwnProfile && (
                <Button
                  onClick={() => setShowGamingModal(true)}
                  variant="outline"
                  size="sm"
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
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FaSteam className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{stats.steamProfile.username}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Steam</p>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button
                        onClick={() => handleDisconnectGamingProfile('steam')}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
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
                      className="text-xs text-blue-600 hover:underline mt-2 block"
                    >
                      View Steam Profile
                    </a>
                  )}
                </div>
              )}

              {/* Riot Profile */}
              {stats?.riotProfile && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <SiRiotgames className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{stats.riotProfile.gameName}#{stats.riotProfile.tagLine}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Riot Games</p>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button
                        onClick={() => handleDisconnectGamingProfile('riot')}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Epic Profile */}
              {stats?.epicProfile && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        <SiEpicgames className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{stats.epicProfile.displayName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Epic Games</p>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button
                        onClick={() => handleDisconnectGamingProfile('epic')}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Ubisoft Profile */}
              {stats?.ubisoftProfile && (
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <SiUbisoft className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{stats.ubisoftProfile.username}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Ubisoft</p>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button
                        onClick={() => handleDisconnectGamingProfile('ubisoft')}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* No gaming profiles */}
              {!stats?.steamProfile && !stats?.riotProfile && !stats?.epicProfile && !stats?.ubisoftProfile && (
                <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No gaming profiles connected</p>
                  {isOwnProfile && (
                    <p className="text-sm mt-1">Connect your gaming accounts to show your gaming identity</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Communities */}
        {isOwnProfile && memberships && memberships.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Your Communities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberships.map((membership) => (
                  <div key={membership._id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">r/{membership.name}</h3>
                        {membership.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {membership.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                          <CalendarDays className="w-3 h-3" />
                          <span>Joined {new Date(membership.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleLeaveSubreddit(membership._id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Posts by u/{username}
          </h2>
          
          {posts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No posts yet</h3>
              <p className="text-slate-600 dark:text-slate-400">
                {isOwnProfile 
                  ? "You haven't created any posts yet. Join a community and start sharing!"
                  : `${username} hasn't posted anything yet.`
                }
              </p>
            </Card>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} showSubreddit={true} />
              ))}
              {status === "CanLoadMore" && (
                <div className="text-center">
                  <Button 
                    onClick={() => loadMore(20)}
                    variant="outline"
                  >
                    Load More Posts
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
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
  );
};

export default ProfilePage;