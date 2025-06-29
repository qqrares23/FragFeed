import { useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import { FaUsers, FaPlus, FaMinus, FaCalendarAlt } from "react-icons/fa";
import "../styles/SubredditPage.css";

const SubredditPage = () => {
  const { subredditName } = useParams();
  const { user } = useUser();
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
  
  const joinSubreddit = useMutation(api.subreddit.join);
  const leaveSubreddit = useMutation(api.subreddit.leave);

  if (subreddit === undefined) return <div className="loading">Loading...</div>;

  if (!subreddit) {
    return (
      <div className="content-container">
        <div className="not-found">
          <div className="not-found-icon">🔍</div>
          <h1>Subreddit not found</h1>
          <p>The subreddit r/{subredditName} does not exist.</p>
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

  return (
    <div className="content-container">
      <div className="subreddit-banner">
        <div className="banner-content">
          <h1>r/{subreddit.name}</h1>
          {subreddit.description && (
            <p className="subreddit-description">{subreddit.description}</p>
          )}
          
          <div className="subreddit-meta">
            <div className="meta-item">
              <FaUsers className="meta-icon" />
              <div className="meta-content">
                <span className="meta-number">{memberCount || 0}</span>
                <span className="meta-label">Members</span>
              </div>
            </div>
            <div className="meta-item">
              <FaCalendarAlt className="meta-icon" />
              <div className="meta-content">
                <span className="meta-number">{posts?.length || 0}</span>
                <span className="meta-label">Posts</span>
              </div>
            </div>
          </div>

          {user && (
            <div className="action-buttons">
              <button 
                className={`action-btn ${isMember ? 'secondary' : 'primary'}`}
                onClick={handleJoinLeave}
              >
                {isMember ? (
                  <>
                    <FaMinus />
                    Leave Community
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Join Community
                  </>
                )}
              </button>
              {isMember && (
                <a 
                  href={`/r/${subredditName}/submit`}
                  className="action-btn primary"
                >
                  <FaPlus />
                  Create Post
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="posts-container">
        <div className="posts-section-header">
          <h2>Posts</h2>
        </div>
        
        {posts && posts.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon">📝</div>
            <div className="no-posts-title">No posts yet</div>
            <div className="no-posts-description">
              Be the first to post in r/{subredditName}
            </div>
            {user && isMember && (
              <a href={`/r/${subredditName}/submit`} className="action-btn primary">
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

export default SubredditPage;