import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

// Check if user is owner or moderator of subreddit
export async function checkModerationPermission(
  ctx: any,
  subredditId: string,
  permission: string
) {
  const user = await getCurrentUserOrThrow(ctx);
  
  // Check if user is the subreddit owner
  const subreddit = await ctx.db.get(subredditId);
  if (!subreddit) {
    throw new ConvexError({ message: "Subreddit not found" });
  }
  
  if (subreddit.authorId === user._id) {
    return true; // Owner has all permissions
  }
  
  // Check if user is a moderator with the required permission
  const moderator = await ctx.db
    .query("subredditModerators")
    .withIndex("byUserAndSubreddit", (q) => 
      q.eq("userId", user._id).eq("subredditId", subredditId)
    )
    .unique();
    
  if (!moderator) {
    return false;
  }
  
  return moderator.permissions.includes(permission);
}

export const addModerator = mutation({
  args: {
    subredditId: v.id("subreddit"),
    userId: v.id("users"),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Check if current user is the subreddit owner
    const subreddit = await ctx.db.get(args.subredditId);
    if (!subreddit) {
      throw new ConvexError({ message: "Subreddit not found" });
    }
    
    if (subreddit.authorId !== user._id) {
      throw new ConvexError({ message: "Only the subreddit owner can add moderators" });
    }
    
    // Check if user is already a moderator
    const existingModerator = await ctx.db
      .query("subredditModerators")
      .withIndex("byUserAndSubreddit", (q) => 
        q.eq("userId", args.userId).eq("subredditId", args.subredditId)
      )
      .unique();
      
    if (existingModerator) {
      throw new ConvexError({ message: "User is already a moderator" });
    }
    
    // Add moderator
    await ctx.db.insert("subredditModerators", {
      userId: args.userId,
      subredditId: args.subredditId,
      addedBy: user._id,
      addedAt: Date.now(),
      permissions: args.permissions,
    });
  },
});

export const removeModerator = mutation({
  args: {
    subredditId: v.id("subreddit"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Check if current user is the subreddit owner
    const subreddit = await ctx.db.get(args.subredditId);
    if (!subreddit) {
      throw new ConvexError({ message: "Subreddit not found" });
    }
    
    if (subreddit.authorId !== user._id) {
      throw new ConvexError({ message: "Only the subreddit owner can remove moderators" });
    }
    
    // Find and remove moderator
    const moderator = await ctx.db
      .query("subredditModerators")
      .withIndex("byUserAndSubreddit", (q) => 
        q.eq("userId", args.userId).eq("subredditId", args.subredditId)
      )
      .unique();
      
    if (!moderator) {
      throw new ConvexError({ message: "User is not a moderator" });
    }
    
    await ctx.db.delete(moderator._id);
  },
});

export const updateModeratorPermissions = mutation({
  args: {
    subredditId: v.id("subreddit"),
    userId: v.id("users"),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Check if current user is the subreddit owner
    const subreddit = await ctx.db.get(args.subredditId);
    if (!subreddit) {
      throw new ConvexError({ message: "Subreddit not found" });
    }
    
    if (subreddit.authorId !== user._id) {
      throw new ConvexError({ message: "Only the subreddit owner can update moderator permissions" });
    }
    
    // Find and update moderator
    const moderator = await ctx.db
      .query("subredditModerators")
      .withIndex("byUserAndSubreddit", (q) => 
        q.eq("userId", args.userId).eq("subredditId", args.subredditId)
      )
      .unique();
      
    if (!moderator) {
      throw new ConvexError({ message: "User is not a moderator" });
    }
    
    await ctx.db.patch(moderator._id, {
      permissions: args.permissions,
    });
  },
});

export const getModerators = query({
  args: { subredditId: v.id("subreddit") },
  handler: async (ctx, args) => {
    const moderators = await ctx.db
      .query("subredditModerators")
      .withIndex("bySubreddit", (q) => q.eq("subredditId", args.subredditId))
      .collect();
      
    const enrichedModerators = await Promise.all(
      moderators.map(async (mod) => {
        const user = await ctx.db.get(mod.userId);
        const addedBy = await ctx.db.get(mod.addedBy);
        return {
          ...mod,
          user: user ? { _id: user._id, username: user.username } : null,
          addedBy: addedBy ? { _id: addedBy._id, username: addedBy.username } : null,
        };
      })
    );
    
    return enrichedModerators.filter(mod => mod.user !== null);
  },
});

export const isUserModerator = query({
  args: { subredditId: v.id("subreddit") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { isModerator: false, isOwner: false, permissions: [] };

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) return { isModerator: false, isOwner: false, permissions: [] };

    // Check if user is owner
    const subreddit = await ctx.db.get(args.subredditId);
    if (subreddit?.authorId === user._id) {
      return { 
        isModerator: true, 
        isOwner: true, 
        permissions: ["delete_posts", "delete_comments", "manage_users"] 
      };
    }

    // Check if user is moderator
    const moderator = await ctx.db
      .query("subredditModerators")
      .withIndex("byUserAndSubreddit", (q) => 
        q.eq("userId", user._id).eq("subredditId", args.subredditId)
      )
      .unique();

    if (moderator) {
      return { 
        isModerator: true, 
        isOwner: false, 
        permissions: moderator.permissions 
      };
    }

    return { isModerator: false, isOwner: false, permissions: [] };
  },
});

export const searchSubredditMembers = query({
  args: { 
    subredditId: v.id("subreddit"),
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("subredditMembership")
      .withIndex("bySubreddit", (q) => q.eq("subredditId", args.subredditId))
      .take(args.limit || 50);

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          _id: membership._id,
          user: user ? {
            _id: user._id,
            username: user.username,
          } : null,
          joinedAt: membership.joinedAt,
        };
      })
    );

    const validMembers = members.filter(member => member.user !== null);

    // Filter by search query if provided
    if (args.searchQuery && args.searchQuery.trim()) {
      const query = args.searchQuery.toLowerCase();
      return validMembers.filter(member => 
        member.user!.username.toLowerCase().includes(query)
      );
    }

    return validMembers;
  },
});