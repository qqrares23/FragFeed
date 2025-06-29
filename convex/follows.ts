import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserOrThrow, getCurrentUser } from "./users";

export const followUser = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    
    // Can't follow yourself
    if (currentUser._id === args.targetUserId) {
      throw new ConvexError({ message: "You cannot follow yourself" });
    }
    
    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("byFollowerAndFollowing", (q) => 
        q.eq("followerId", currentUser._id).eq("followingId", args.targetUserId)
      )
      .unique();
    
    if (existingFollow) {
      throw new ConvexError({ message: "You are already following this user" });
    }
    
    // Create follow relationship
    await ctx.db.insert("follows", {
      followerId: currentUser._id,
      followingId: args.targetUserId,
      createdAt: Date.now(),
    });
    
    // Create notification for the followed user
    const targetUser = await ctx.db.get(args.targetUserId);
    if (targetUser) {
      await ctx.db.insert("notifications", {
        userId: args.targetUserId,
        type: "new_follower",
        title: "New Follower",
        message: `${currentUser.username} started following you`,
        fromUserId: currentUser._id,
        read: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const unfollowUser = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("byFollowerAndFollowing", (q) => 
        q.eq("followerId", currentUser._id).eq("followingId", args.targetUserId)
      )
      .unique();
    
    if (!existingFollow) {
      throw new ConvexError({ message: "You are not following this user" });
    }
    
    await ctx.db.delete(existingFollow._id);
  },
});

export const isFollowing = query({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return false;
    
    const follow = await ctx.db
      .query("follows")
      .withIndex("byFollowerAndFollowing", (q) => 
        q.eq("followerId", currentUser._id).eq("followingId", args.targetUserId)
      )
      .unique();
    
    return !!follow;
  },
});

export const getFollowerCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("byFollowing", (q) => q.eq("followingId", args.userId))
      .collect();
    
    return followers.length;
  },
});

export const getFollowingCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const following = await ctx.db
      .query("follows")
      .withIndex("byFollower", (q) => q.eq("followerId", args.userId))
      .collect();
    
    return following.length;
  },
});

export const getFollowers = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("byFollowing", (q) => q.eq("followingId", args.userId))
      .order("desc")
      .take(args.limit || 50);
    
    const followers = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        return {
          _id: follow._id,
          user: user ? {
            _id: user._id,
            username: user.username,
          } : null,
          createdAt: follow.createdAt,
        };
      })
    );
    
    return followers.filter(follower => follower.user !== null);
  },
});

export const getFollowing = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("byFollower", (q) => q.eq("followerId", args.userId))
      .order("desc")
      .take(args.limit || 50);
    
    const following = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        return {
          _id: follow._id,
          user: user ? {
            _id: user._id,
            username: user.username,
          } : null,
          createdAt: follow.createdAt,
        };
      })
    );
    
    return following.filter(follow => follow.user !== null);
  },
});