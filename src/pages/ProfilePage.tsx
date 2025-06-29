import { useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import { FaUser, FaUsers, FaMinus, FaCalendarAlt } from "react-icons/fa";
import "../styles/ProfilePage.css";

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
      <div className="content-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1>
            <FaUser className="profile-icon" />
            u/{username}
          </h1>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{stats?.posts ?? 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{memberships?.length ?? 0}</span>
              <span className="stat-label">Communities</span>
            </div>
          </div>
        </div>
      </div>

      {isOwnProfile && memberships && memberships.length > 0 && (
        <div className="memberships-section">
          <div className="section-header">
            <h2>
              <FaUsers className="section-icon" />
              Your Communities
            </h2>
          </div>
          <div className="memberships-grid">
            {memberships.map((membership) => (
              <div key={membership._id} className="membership-card">
                <div className="membership-info">
                  <h3>r/{membership.name}</h3>
                  {membership.description && (
                    <p className="membership-description">{membership.description}</p>
                  )}
                  <div className="membership-meta">
                    <FaCalendarAlt className="meta-icon" />
                    <span>Joined {new Date(membership.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  className="leave-button"
                  onClick={() => handleLeaveSubreddit(membership._id)}
                  title="Leave community"
                >
                  <FaMinus />
                  Leave
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="posts-container">
        <div className="posts-section-header">
          <h2>Posts by u/{username}</h2>
        </div>
        
        {posts.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon">📝</div>
            <div className="no-posts-title">No posts yet</div>
            <div className="no-posts-description">
              {isOwnProfile 
                ? "You haven't created any posts yet. Join a community and start sharing!"
                : `${username} hasn't posted anything yet.`
              }
            </div>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} showSubreddit={true} />
            ))}
            {status === "CanLoadMore" && (
              <button className="load-more" onClick={() => loadMore(20)}>
                Load More Posts
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;