import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostCard from "./PostCard";
import { Card, CardContent } from "@/components/ui/card";

export function Feed() {
  const topPosts = useQuery(api.leaderboard.getTopPosts, { limit: 10 });

  if (!topPosts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <span className="text-3xl animate-bounce-gentle">🔥</span>
          Trending Today
        </h2>
        <p className="text-slate-600">Discover the hottest posts from your communities</p>
      </div>
      
      <div className="space-y-6">
        {topPosts.map((post) => (
          <PostCard key={post._id} post={post} showSubreddit={true} />
        ))}
      </div>
    </div>
  );
}