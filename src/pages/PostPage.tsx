import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";
import { FaArrowLeft } from "react-icons/fa";
import { Id } from "../../convex/_generated/dataModel";

const PostPage = () => {
  const { postId } = useParams<{ postId: Id<"post"> }>();
  const navigate = useNavigate();
  const post = useQuery(api.post.getPost, { id: postId! });

  if (!post) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost mb-6 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        
        <PostCard post={post} showSubreddit={true} expandedView={true} />
      </div>
    </div>
  );
};

export default PostPage;