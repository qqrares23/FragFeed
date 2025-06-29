import { internalMutation, query, QueryCtx, mutation } from "./_generated/server";
import { v, Validator } from "convex/values";
import { counts, postCountKey } from "./counter";
// Import follows module to ensure it's included in the generated API
import "./follows";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      username: data.username || "",
      externalId: data.id,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}

export const getPublicUser = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byUsername", (q) => q.eq("username", args.username)).unique();

    if (!user) return {posts: 0}

    const postCount = await counts.count(ctx, postCountKey(user._id))
    
    // Get profile picture and banner URLs
    const profilePictureUrl = user.profilePicture ? await ctx.storage.getUrl(user.profilePicture) : null;
    const bannerImageUrl = user.bannerImage ? await ctx.storage.getUrl(user.bannerImage) : null;
    
    return {
      _id: user._id,
      posts: postCount,
      bio: user.bio,
      location: user.location,
      website: user.website,
      profilePictureUrl,
      bannerImageUrl,
      steamProfile: user.steamProfile,
      riotProfile: user.riotProfile,
      epicProfile: user.epicProfile,
      ubisoftProfile: user.ubisoftProfile,
    }
  },
});

export const searchUsers = query({
  args: { queryStr: v.string() },
  handler: async (ctx, args) => {
    if (!args.queryStr) return [];

    const users = await ctx.db
      .query("users")
      .withSearchIndex("search_users", (q) => q.search("username", args.queryStr))
      .take(10);

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const profilePictureUrl = user.profilePicture ? await ctx.storage.getUrl(user.profilePicture) : null;
        return {
          _id: user._id,
          username: user.username,
          type: "user",
          title: user.username,
          profilePictureUrl,
          bio: user.bio,
        };
      })
    );

    return enrichedUsers;
  },
});

export const updateProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    profilePicture: v.optional(v.id("_storage")),
    bannerImage: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    const updateData: any = {};
    if (args.bio !== undefined) updateData.bio = args.bio;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.website !== undefined) updateData.website = args.website;
    if (args.profilePicture !== undefined) updateData.profilePicture = args.profilePicture;
    if (args.bannerImage !== undefined) updateData.bannerImage = args.bannerImage;
    
    await ctx.db.patch(user._id, updateData);
  },
});

export const connectSteamProfile = mutation({
  args: {
    steamId: v.string(),
    username: v.string(),
    profileUrl: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    await ctx.db.patch(user._id, {
      steamProfile: {
        steamId: args.steamId,
        username: args.username,
        profileUrl: args.profileUrl,
        avatarUrl: args.avatarUrl,
        connectedAt: Date.now(),
      },
    });
  },
});

export const connectRiotProfile = mutation({
  args: {
    riotId: v.string(),
    gameName: v.string(),
    tagLine: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    await ctx.db.patch(user._id, {
      riotProfile: {
        riotId: args.riotId,
        gameName: args.gameName,
        tagLine: args.tagLine,
        connectedAt: Date.now(),
      },
    });
  },
});

export const connectEpicProfile = mutation({
  args: {
    epicId: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    await ctx.db.patch(user._id, {
      epicProfile: {
        epicId: args.epicId,
        displayName: args.displayName,
        connectedAt: Date.now(),
      },
    });
  },
});

export const connectUbisoftProfile = mutation({
  args: {
    ubisoftId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    await ctx.db.patch(user._id, {
      ubisoftProfile: {
        ubisoftId: args.ubisoftId,
        username: args.username,
        connectedAt: Date.now(),
      },
    });
  },
});

export const disconnectGamingProfile = mutation({
  args: { platform: v.union(v.literal("steam"), v.literal("riot"), v.literal("epic"), v.literal("ubisoft")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    const updateData: any = {};
    updateData[`${args.platform}Profile`] = undefined;
    
    await ctx.db.patch(user._id, updateData);
  },
});