import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";
import { ArrowLeft } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

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
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 group hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        
        <PostCard post={post} showSubreddit={true} expandedView={true} />
      </div>
    </div>
  );
};

export default PostPage;