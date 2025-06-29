import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";
import { v, ConvexError } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const subreddit = await ctx.db
      .query("subreddit")
      .withIndex("byName", (q) => q.eq("name", args.name))
      .unique();
    if (subreddit) {
      throw new ConvexError({ message: "Subreddit already exists" });
    }
    
    const subredditId = await ctx.db.insert("subreddit", {
      name: args.name,
      description: args.description,
      authorId: user._id,
      guidelines: [
        "Be respectful to other members",
        "Stay on topic",
        "No spam or self-promotion",
        "Follow FragFeed's content policy"
      ],
    });

    // Automatically join the creator to the subreddit
    await ctx.db.insert("subredditMembership", {
      userId: user._id,
      subredditId: subredditId,
      joinedAt: Date.now(),
    });

    return subredditId;
  },
});

export const get = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const subreddit = await ctx.db
      .query("subreddit")
      .withIndex("byName", (q) => q.eq("name", args.name))
      .unique();
    if (!subreddit) return null;

    // Get banner and logo image URLs if they exist
    const bannerImageUrl = subreddit.bannerImage ? await ctx.storage.getUrl(subreddit.bannerImage) : null;
    const logoImageUrl = subreddit.logoImage ? await ctx.storage.getUrl(subreddit.logoImage) : null;

    return {
      ...subreddit,
      bannerImageUrl,
      logoImageUrl,
    };
  },
});

export const updateBanner = mutation({
  args: {
    subredditId: v.id("subreddit"),
    bannerImage: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const subreddit = await ctx.db.get(args.subredditId);
    
    if (!subreddit) {
      throw new ConvexError({ message: "Subreddit not found" });
    }
    
    // Only the owner can update the banner
    if (subreddit.authorId !== user._id) {
      throw new ConvexError({ message: "Only the community owner can update the banner" });
    }
    
    await ctx.db.patch(args.subredditId, {
      bannerImage: args.bannerImage,
    });
  },
});

export const updateLogo = mutation({
  args: {
    subredditId: v.id("subreddit"),
    logoImage: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const subreddit = await ctx.db.get(args.subredditId);
    
    if (!subreddit) {
      throw new ConvexError({ message: "Subreddit not found" });
    }
    
    // Only the owner can update the logo
    if (subreddit.authorId !== user._id) {
      throw new ConvexError({ message: "Only the community owner can update the logo" });
    }
    
    await ctx.db.patch(args.subredditId, {
      logoImage: args.logoImage,
    });
  },
});

export const updateGuidelines = mutation({
  args: {
    subredditId: v.id("subreddit"),
    guidelines: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const subreddit = await ctx.db.get(args.subredditId);
    
    if (!subreddit) {
      throw new ConvexError({ message: "Subreddit not found" });
    }
    
    // Only the owner can update guidelines
    if (subreddit.authorId !== user._id) {
      throw new ConvexError({ message: "Only the community owner can update guidelines" });
    }
    
    // Filter out empty guidelines and limit to 10
    const filteredGuidelines = args.guidelines
      .filter(guideline => guideline.trim().length > 0)
      .slice(0, 10);
    
    await ctx.db.patch(args.subredditId, {
      guidelines: filteredGuidelines,
    });
  },
});

export const isOwner = query({
  args: { subredditId: v.id("subreddit") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) return false;

    const subreddit = await ctx.db.get(args.subredditId);
    return subreddit?.authorId === user._id;
  },
});

export const search = query({
  args: { queryStr: v.string() },
  handler: async (ctx, args) => {
    if (!args.queryStr) return [];

    const subreddits = await ctx.db
      .query("subreddit")
      .withSearchIndex("search_body", (q) => q.search("name", args.queryStr))
      .take(10);

    const enrichedSubreddits = await Promise.all(
      subreddits.map(async (sub) => {
        const logoImageUrl = sub.logoImage ? await ctx.storage.getUrl(sub.logoImage) : null;
        return {
          ...sub, 
          type: "community", 
          title: sub.name,
          logoImageUrl
        };
      })
    );

    return enrichedSubreddits;
  },
});

export const join = mutation({
  args: { subredditId: v.id("subreddit") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Check if already a member
    const existingMembership = await ctx.db
      .query("subredditMembership")
      .withIndex("byUserAndSubreddit", (q) => 
        q.eq("userId", user._id).eq("subredditId", args.subredditId)
      )
      .unique();

    if (existingMembership) {
      throw new ConvexError({ message: "Already a member of this subreddit" });
    }

    await ctx.db.insert("subredditMembership", {
      userId: user._id,
      subredditId: args.subredditId,
      joinedAt: Date.now(),
    });
  },
});

export const leave = mutation({
  args: { subredditId: v.id("subreddit") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    const membership = await ctx.db
      .query("subredditMembership")
      .withIndex("byUserAndSubreddit", (q) => 
        q.eq("userId", user._id).eq("subredditId", args.subredditId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError({ message: "Not a member of this subreddit" });
    }

    await ctx.db.delete(membership._id);
  },
});

export const isMember = query({
  args: { subredditId: v.id("subreddit") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) return false;

    const membership = await ctx.db
      .query("subredditMembership")
      .withIndex("byUserAndSubreddit", (q) => 
        q.eq("userId", user._id).eq("subredditId", args.subredditId)
      )
      .unique();

    return !!membership;
  },
});

export const getUserMemberships = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byUsername", (q) => q.eq("username", args.username))
      .unique();

    if (!user) return [];

    const memberships = await ctx.db
      .query("subredditMembership")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .collect();

    const subreddits = await Promise.all(
      memberships.map(async (membership) => {
        const subreddit = await ctx.db.get(membership.subredditId);
        const logoImageUrl = subreddit?.logoImage ? await ctx.storage.getUrl(subreddit.logoImage) : null;
        return {
          ...subreddit,
          joinedAt: membership.joinedAt,
          membershipId: membership._id,
          logoImageUrl,
        };
      })
    );

    return subreddits.filter(Boolean);
  },
});

export const getMemberCount = query({
  args: { subredditId: v.id("subreddit") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("subredditMembership")
      .withIndex("bySubreddit", (q) => q.eq("subredditId", args.subredditId))
      .collect();

    return memberships.length;
  },
});

export const getMembers = query({
  args: { subredditId: v.id("subreddit"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("subredditMembership")
      .withIndex("bySubreddit", (q) => q.eq("subredditId", args.subredditId))
      .order("desc")
      .take(args.limit || 50);

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        const profilePictureUrl = user?.profilePicture ? await ctx.storage.getUrl(user.profilePicture) : null;
        return {
          _id: membership._id,
          user: user ? {
            _id: user._id,
            username: user.username,
            profilePictureUrl,
          } : null,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return members.filter(member => member.user !== null);
  },
});