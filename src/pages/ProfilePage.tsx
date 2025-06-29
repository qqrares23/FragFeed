import { useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import { FaUser, FaUsers, FaMinus, FaCalendarAlt } from "react-icons/fa";

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useUser();
  const isOwnProfile = user?.username === username;
  
  const {results: posts, loadMore, status} = usePaginatedQuery(api.post.userPosts, {
    authorUsername: username || "",
  }, {initialNumItems: 20});
  
  const stats = useQuery(api.users.getPublicUser, {username: username || ""});
  const memberships = useQuery(api.subreddit.getUserMemberships, {username: username || ""});
  
  const leaveSubreddit = useMutation(api.subreddit.leave);

  const handleLeaveSubreddit = async (subredditId: string) => {
    if (!isOwnProfile) return;
    
    try {
      await leaveSubreddit({ subredditId: subredditId as any });
    } catch (error) {
      console.error("Error leaving subreddit:", error);
    }
  };

  if (posts === undefined) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="card p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <FaUser className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">u/{username}</h1>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-semibold">{stats?.posts ?? 0}</span>
                  <span>posts</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-semibold">{memberships?.length ?? 0}</span>
                  <span>communities</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Communities */}
        {isOwnProfile && memberships && memberships.length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaUsers className="w-5 h-5 text-primary-600" />
              Your Communities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memberships.map((membership) => (
                <div key={membership._id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">r/{membership.name}</h3>
                      {membership.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {membership.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                        <FaCalendarAlt className="w-3 h-3" />
                        <span>Joined {new Date(membership.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleLeaveSubreddit(membership._id)}
                      className="btn btn-secondary text-xs p-2"
                      title="Leave community"
                    >
                      <FaMinus />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Posts by u/{username}
          </h2>
          
          {posts.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No posts yet</h3>
              <p className="text-slate-600">
                {isOwnProfile 
                  ? "You haven't created any posts yet. Join a community and start sharing!"
                  : `${username} hasn't posted anything yet.`
                }
              </p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} showSubreddit={true} />
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
    </div>
  );
};

export default ProfilePage;