import { useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import { FaUsers, FaPlus, FaMinus, FaCalendarAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

const SubredditPage = () => {
  const { subredditName } = useParams();
  const { user } = useUser();
  const [showMembers, setShowMembers] = useState(false);
  
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Community Header */}
            <div className="card p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    r/{subreddit.name}
                  </h1>
                  {subreddit.description && (
                    <p className="text-slate-600 text-lg">{subreddit.description}</p>
                  )}
                </div>
                
                {user && (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleJoinLeave}
                      className={`btn ${isMember ? 'btn-secondary' : 'btn-primary'}`}
                    >
                      {isMember ? (
                        <>
                          <FaMinus />
                          Leave
                        </>
                      ) : (
                        <>
                          <FaPlus />
                          Join
                        </>
                      )}
                    </button>
                    {isMember && (
                      <a 
                        href={`/r/${subredditName}/submit`}
                        className="btn btn-primary"
                      >
                        <FaPlus />
                        Create Post
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <FaUsers className="w-5 h-5" />
                  <span className="font-semibold">{memberCount || 0}</span>
                  <span>members</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FaCalendarAlt className="w-5 h-5" />
                  <span className="font-semibold">{posts?.length || 0}</span>
                  <span>posts</span>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {posts && posts.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No posts yet</h3>
                  <p className="text-slate-600 mb-6">
                    Be the first to post in r/{subredditName}
                  </p>
                  {user && isMember && (
                    <a href={`/r/${subredditName}/submit`} className="btn btn-primary">
                      <FaPlus />
                      Create First Post
                    </a>
                  )}
                </div>
              ) : (
                <>
                  {posts?.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                  {status === "CanLoadMore" && (
                    <div className="text-center">
                      <button 
                        onClick={() => loadMore(20)}
                        className="btn btn-secondary"
                      >
                        Load More Posts
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Info */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">About Community</h3>
              <div className="space-y-3">
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
                  <span className="font-semibold">
                    {new Date(subreddit._creationTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Members</h3>
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="btn btn-ghost p-2"
                  title={showMembers ? "Hide members" : "Show members"}
                >
                  {showMembers ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              {showMembers ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {members && members.length > 0 ? (
                    members.map((member) => (
                      <div key={member._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {member.user?.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
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
            </div>

            {/* Rules or Guidelines */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Community Guidelines</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>• Be respectful to other members</p>
                <p>• Stay on topic</p>
                <p>• No spam or self-promotion</p>
                <p>• Follow FragFeed's content policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubredditPage;