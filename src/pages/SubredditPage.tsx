import { useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import GuidelinesEditModal from "../components/GuidelinesEditModal";
import { Users, Plus, Minus, CalendarDays, Eye, EyeOff, Edit } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SubredditPage = () => {
  const { subredditName } = useParams();
  const { user } = useUser();
  const [showMembers, setShowMembers] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  
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
            <Card>
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                      r/{subreddit.name}
                    </h1>
                    {subreddit.description && (
                      <p className="text-slate-600 text-base lg:text-lg">{subreddit.description}</p>
                    )}
                  </div>
                  
                  {user && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={handleJoinLeave}
                        variant={isMember ? "outline" : "default"}
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
                        <Button asChild>
                          <a href={`/r/${subredditName}/submit`}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Post
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 lg:gap-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="font-semibold">{memberCount || 0}</span>
                    <span className="hidden sm:inline">members</span>
                    <span className="sm:hidden">👥</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDays className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="font-semibold">{posts?.length || 0}</span>
                    <span className="hidden sm:inline">posts</span>
                    <span className="sm:hidden">📝</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-4 lg:space-y-6">
              {posts && posts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 lg:p-12 text-center">
                    <div className="text-4xl lg:text-6xl mb-4">📝</div>
                    <h3 className="text-lg lg:text-xl font-semibold text-slate-900 mb-2">No posts yet</h3>
                    <p className="text-slate-600 mb-6">
                      Be the first to post in r/{subredditName}
                    </p>
                    {user && isMember && (
                      <Button asChild>
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
                  {posts?.map((post) => (
                    <PostCard key={post._id} post={post} />
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Info */}
            <Card>
              <CardHeader>
                <CardTitle>About Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Members</span>
                  <span className="font-semibold">{memberCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Posts</span>
                  <span className="font-semibold">{posts?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Created</span>
                  <span className="font-semibold text-sm">
                    {new Date(subreddit._creationTime).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Members Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Members</CardTitle>
                  <Button
                    onClick={() => setShowMembers(!showMembers)}
                    variant="ghost"
                    size="sm"
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
                        <div key={member._id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-6 h-6 lg:w-8 lg:h-8">
                              <AvatarFallback className="text-xs lg:text-sm">
                                {member.user?.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900 text-sm lg:text-base">
                                u/{member.user?.username}
                              </p>
                              <p className="text-xs text-slate-500">
                                Joined {formatTimeAgo(member.joinedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No members to display</p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">
                    Click the eye icon to view community members
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Community Guidelines</CardTitle>
                  {isOwner && (
                    <Button
                      onClick={() => setShowGuidelinesModal(true)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600">
                  {subreddit.guidelines && subreddit.guidelines.length > 0 ? (
                    subreddit.guidelines.map((guideline, index) => (
                      <p key={index}>• {guideline}</p>
                    ))
                  ) : (
                    <>
                      <p>• Be respectful to other members</p>
                      <p>• Stay on topic</p>
                      <p>• No spam or self-promotion</p>
                      <p>• Follow FragFeed's content policy</p>
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