import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";
import { Bookmark, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SavedPostsPage = () => {
  const savedPosts = useQuery(api.savedPosts.getUserSavedPosts, { limit: 50 });

  if (savedPosts === undefined) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading saved posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-yellow-600" />
            Saved Posts
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Posts you've bookmarked for later reading
          </p>
        </div>

        {savedPosts.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No saved posts yet</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Start bookmarking posts you want to read later by clicking the bookmark icon
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {savedPosts.map((post) => (
              <div key={post._id} className="relative">
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Saved {new Date(post.savedAt).toLocaleDateString()}
                  </div>
                </div>
                <PostCard post={post} showSubreddit={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPostsPage;