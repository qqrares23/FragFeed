import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserOrThrow, getCurrentUser } from "./users";

export const savePost = mutation({
  args: { postId: v.id("post") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Check if already saved
    const existingSave = await ctx.db
      .query("savedPosts")
      .withIndex("byUserAndPost", (q) => 
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();
    
    if (existingSave) {
      throw new ConvexError({ message: "Post already saved" });
    }
    
    await ctx.db.insert("savedPosts", {
      userId: user._id,
      postId: args.postId,
      savedAt: Date.now(),
    });
  },
});

export const unsavePost = mutation({
  args: { postId: v.id("post") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    const savedPost = await ctx.db
      .query("savedPosts")
      .withIndex("byUserAndPost", (q) => 
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();
    
    if (!savedPost) {
      throw new ConvexError({ message: "Post not saved" });
    }
    
    await ctx.db.delete(savedPost._id);
  },
});

export const isPostSaved = query({
  args: { postId: v.id("post") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;
    
    const savedPost = await ctx.db
      .query("savedPosts")
      .withIndex("byUserAndPost", (q) => 
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();
    
    return !!savedPost;
  },
});

export const getUserSavedPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const savedPosts = await ctx.db
      .query("savedPosts")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 50);

    const posts = await Promise.all(
      savedPosts.map(async (saved) => {
        const post = await ctx.db.get(saved.postId);
        if (!post) return null;

        const [author, subreddit] = await Promise.all([
          ctx.db.get(post.authorId),
          ctx.db.get(post.subreddit),
        ]);
        
        const imageUrl = post.image ? await ctx.storage.getUrl(post.image) : undefined;

        return {
          ...post,
          author: author ? { username: author.username } : undefined,
          subreddit: subreddit ? {
            _id: subreddit._id,
            name: subreddit.name,
          } : undefined,
          imageUrl,
          savedAt: saved.savedAt,
        };
      })
    );

    return posts.filter(Boolean);
  },
});