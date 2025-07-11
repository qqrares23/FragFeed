import { useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import GuidelinesEditModal from "../components/GuidelinesEditModal";
import { Users, Plus, Minus, CalendarDays, Eye, EyeOff, Edit, Image } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SubredditPage = () => {
  const { subredditName } = useParams();
  const { user } = useUser();
  const [showMembers, setShowMembers] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const subreddit = useQuery(api.subreddit.get, { name: subredditName || "" });
  const {results: posts, loadMore, status} = usePaginatedQuery(api.post.getSubredditPosts, {
    subredditName: subredditName || "",
  }, {initialNumItems: 20});
  
  const isMember = useQuery(api.subreddit.isMember, 
    subreddit ? { subredditId: subreddit._id } : "skip"
  );
  const memberCount = useQuery(api.subreddit.getMemberCount, 
    subreddit ? { subredditId: subreddit._id } : "skip"
  );
  const members = useQuery(api.subreddit.getMembers,
    subreddit && showMembers ? { subredditId: subreddit._id, limit: 20 } : "skip"
  );
  const isOwner = useQuery(api.subreddit.isOwner,
    subreddit ? { subredditId: subreddit._id } : "skip"
  );
  
  const joinSubreddit = useMutation(api.subreddit.join);
  const leaveSubreddit = useMutation(api.subreddit.leave);
  const updateLogo = useMutation(api.subreddit.updateLogo);
  const generateUploadUrl = useMutation(api.image.generateUploadUrl);

  if (subreddit === undefined) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!subreddit) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Community not found</h1>
          <p className="text-slate-600">The community r/{subredditName} does not exist.</p>
        </div>
      </div>
    );
  }

  const handleJoinLeave = async () => {
    if (!user || !subreddit) return;
    
    try {
      if (isMember) {
        await leaveSubreddit({ subredditId: subreddit._id });
      } else {
        await joinSubreddit({ subredditId: subreddit._id });
      }
    } catch (error) {
      console.error("Error joining/leaving subreddit:", error);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const { storageId } = await uploadResponse.json();
      return storageId;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  const handleLogoUpload = async () => {
    if (!subreddit) return;
    
    // Create and configure file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Logo image must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError("Please select a valid image file");
        return;
      }

      setIsUploadingLogo(true);
      setUploadError(null);

      try {
        // Upload file and get storage ID
        const storageId = await uploadFileToStorage(file);
        
        // Update subreddit with new logo
        await updateLogo({
          subredditId: subreddit._id,
          logoImage: storageId,
        });

        console.log("Logo uploaded successfully");
      } catch (error) {
        console.error("Logo upload error:", error);
        setUploadError(error instanceof Error ? error.message : "Failed to upload logo image. Please try again.");
      } finally {
        setIsUploadingLogo(false);
        // Clean up
        document.body.removeChild(input);
      }
    };

    // Add to DOM and trigger click
    document.body.appendChild(input);
    input.click();
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

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Community Header */}
            <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-primary-100 dark:border-primary-900 shadow-xl">
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    {/* Community Avatar and Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16 lg:w-20 lg:h-20 border-4 border-white dark:border-slate-800 shadow-xl">
                          <AvatarImage src={subreddit.logoImageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-2xl lg:text-3xl font-bold">
                            {subreddit.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Logo Upload Button for Owner */}
                        {isOwner && (
                          <Button
                            onClick={handleLogoUpload}
                            variant="secondary"
                            size="sm"
                            className="absolute -bottom-1 -right-1 w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-lg"
                            disabled={isUploadingLogo}
                          >
                            {isUploadingLogo ? (
                              <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
                            ) : (
                              <Image className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                          r/{subreddit.name}
                        </h1>
                        {subreddit.description && (
                          <p className="text-slate-600 dark:text-slate-400 text-base lg:text-lg">{subreddit.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {user && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={handleJoinLeave}
                        variant={isMember ? "outline" : "default"}
                        className="transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        {isMember ? (
                          <>
                            <Minus className="w-4 h-4 mr-2" />
                            Leave
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Join
                          </>
                        )}
                      </Button>
                      
                      {isMember && (
                        <Button 
                          asChild
                          className="transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                          <a href={`/r/${subredditName}/submit`}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Post
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">{uploadError}</p>
                    <Button
                      onClick={() => setUploadError(null)}
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}

                {/* Enhanced Stats */}
                <div className="flex flex-wrap gap-4 lg:gap-6">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                    <Users className="w-4 h-4 lg:w-5 lg:h-5 text-primary-500" />
                    <span className="font-semibold">{memberCount || 0}</span>
                    <span className="hidden sm:inline">members</span>
                    <span className="sm:hidden">👥</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                    <CalendarDays className="w-4 h-4 lg:w-5 lg:h-5 text-secondary-500" />
                    <span className="font-semibold">{posts?.length || 0}</span>
                    <span className="hidden sm:inline">posts</span>
                    <span className="sm:hidden">📝</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                    <CalendarDays className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                    <span className="font-semibold">Created</span>
                    <span className="text-sm">{new Date(subreddit._creationTime).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts with Glowing Effects */}
            <div className="space-y-4 lg:space-y-6">
              {posts && posts.length === 0 ? (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-8 lg:p-12 text-center">
                    <div className="text-4xl lg:text-6xl mb-4">📝</div>
                    <h3 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No posts yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Be the first to post in r/{subredditName}
                    </p>
                    {user && isMember && (
                      <Button asChild className="transform hover:scale-105 transition-all duration-200 shadow-lg">
                        <a href={`/r/${subredditName}/submit`}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Post
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {posts?.map((post, index) => (
                    <div 
                      key={post._id} 
                      className="transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl"
                      style={{
                        filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.1))',
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-white dark:bg-slate-800 rounded-2xl border-2 border-primary-100 dark:border-primary-900 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
                          <PostCard post={post} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {status === "CanLoadMore" && (
                    <div className="text-center">
                      <Button 
                        onClick={() => loadMore(20)}
                        variant="outline"
                        className="transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        Load More Posts
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Community Info */}
            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-primary-100 dark:border-primary-900 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  About Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Members</span>
                  <span className="font-bold text-primary-600">{memberCount || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Posts</span>
                  <span className="font-bold text-secondary-600">{posts?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Created</span>
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                    {new Date(subreddit._creationTime).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Members Section */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    Members
                  </CardTitle>
                  <Button
                    onClick={() => setShowMembers(!showMembers)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    {showMembers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showMembers ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {members && members.length > 0 ? (
                      members.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-6 h-6 lg:w-8 lg:h-8">
                              <AvatarImage src={member.user?.profilePictureUrl} />
                              <AvatarFallback className="text-xs lg:text-sm bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                                {member.user?.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100 text-sm lg:text-base">
                                u/{member.user?.username}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Joined {formatTimeAgo(member.joinedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-sm">No members to display</p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Click the eye icon to view community members
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Edit className="w-3 h-3 text-white" />
                    </div>
                    Community Guidelines
                  </CardTitle>
                  {isOwner && (
                    <Button
                      onClick={() => setShowGuidelinesModal(true)}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {subreddit.guidelines && subreddit.guidelines.length > 0 ? (
                    subreddit.guidelines.map((guideline, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                        <span className="text-purple-500 font-bold text-xs mt-0.5">{index + 1}.</span>
                        <span className="flex-1">{guideline}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                        <span className="text-purple-500 font-bold text-xs mt-0.5">1.</span>
                        <span className="flex-1">Be respectful to other members</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                        <span className="text-purple-500 font-bold text-xs mt-0.5">2.</span>
                        <span className="flex-1">Stay on topic</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                        <span className="text-purple-500 font-bold text-xs mt-0.5">3.</span>
                        <span className="flex-1">No spam or self-promotion</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                        <span className="text-purple-500 font-bold text-xs mt-0.5">4.</span>
                        <span className="flex-1">Follow FragFeed's content policy</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Guidelines Edit Modal */}
      {showGuidelinesModal && subreddit && (
        <GuidelinesEditModal
          isOpen={showGuidelinesModal}
          onClose={() => setShowGuidelinesModal(false)}
          subredditId={subreddit._id}
          subredditName={subreddit.name}
          currentGuidelines={subreddit.guidelines || []}
        />
      )}
    </div>
  );
};

export default SubredditPage;