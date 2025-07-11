import { mutation, query, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import { Doc, Id } from "./_generated/dataModel";
import { counts, postCountKey } from "./counter";
import { paginationOptsValidator, PaginationResult } from "convex/server";

type EnrichedPost = Omit<Doc<"post">, "subreddit"> & {
  author: { username: string } | undefined;
  subreddit:
    | {
        _id: Id<"subreddit">;
        name: string;
      }
    | undefined;
  imageUrl?: string;
};

const ERROR_MESSAGES = {
  POST_NOT_FOUND: "Post not found",
  SUBREDDIT_NOT_FOUND: "Subreddit not found",
  UNAUTHORIZED_DELETE: "You can't delete this post",
  USER_NOT_FOUND: "User not found",
  NOT_MEMBER: "You must join this subreddit before posting",
} as const;

export const create = mutation({
  args: {
    subject: v.string(),
    body: v.string(),
    subreddit: v.id("subreddit"),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Check if user is a member of the subreddit
    const membership = await ctx.db
      .query("subredditMembership")
      .withIndex("byUserAndSubreddit", (q) => 
        q.eq("userId", user._id).eq("subredditId", args.subreddit)
      )
      .unique();

    if (!membership) {
      throw new ConvexError({ message: ERROR_MESSAGES.NOT_MEMBER });
    }

    const postId = await ctx.db.insert("post", {
      subject: args.subject,
      body: args.body,
      subreddit: args.subreddit,
      authorId: user._id,
      image: args.storageId || undefined,
    });
    
    await counts.inc(ctx, postCountKey(user._id));

    // Get subreddit info
    const subreddit = await ctx.db.get(args.subreddit);
    
    // Create notifications for all members of the subreddit (except the author)
    const subredditMembers = await ctx.db
      .query("subredditMembership")
      .withIndex("bySubreddit", (q) => q.eq("subredditId", args.subreddit))
      .collect();

    // Send notifications to all members except the post author
    const memberNotificationPromises = subredditMembers
      .filter(member => member.userId !== user._id)
      .map(member => 
        ctx.db.insert("notifications", {
          userId: member.userId,
          type: "new_post",
          title: "New post in community",
          message: `${user.username} posted "${args.subject}" in r/${subreddit?.name}`,
          postId: postId,
          subredditId: args.subreddit,
          fromUserId: user._id,
          read: false,
          createdAt: Date.now(),
        })
      );

    // Get all followers of the post author
    const followers = await ctx.db
      .query("follows")
      .withIndex("byFollowing", (q) => q.eq("followingId", user._id))
      .collect();

    // Send notifications to all followers
    const followerNotificationPromises = followers.map(follow => 
      ctx.db.insert("notifications", {
        userId: follow.followerId,
        type: "follower_post",
        title: "New post from someone you follow",
        message: `${user.username} posted "${args.subject}" in r/${subreddit?.name}`,
        postId: postId,
        subredditId: args.subreddit,
        fromUserId: user._id,
        read: false,
        createdAt: Date.now(),
      })
    );

    await Promise.all([...memberNotificationPromises, ...followerNotificationPromises]);
    
    return postId;
  },
});

async function getEnrichedPost(
  ctx: QueryCtx,
  post: Doc<"post">
): Promise<EnrichedPost> {
  const [author, subreddit] = await Promise.all([
    ctx.db.get(post.authorId),
    ctx.db.get(post.subreddit),
  ]);
  const image = post.image && (await ctx.storage.getUrl(post.image));

  return {
    ...post,
    author: author ? { username: author.username } : undefined,
    subreddit: {
      _id: subreddit!._id,
      name: subreddit!.name,
    },
    imageUrl: image ?? undefined,
  };
}

export async function getEnrichedPosts(
  ctx: QueryCtx,
  posts: Doc<"post">[]
): Promise<EnrichedPost[]> {
  return Promise.all(posts.map((post) => getEnrichedPost(ctx, post)));
}

export const getPost = query({
  args: { id: v.id("post") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;

    return getEnrichedPost(ctx, post);
  },
});

export const getSubredditPosts = query({
  args: { subredditName: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args): Promise<PaginationResult<EnrichedPost>> => {
    const subreddit = await ctx.db
      .query("subreddit")
      .withIndex("byName", (q) => q.eq("name", args.subredditName))
      .unique();

    if (!subreddit) throw new ConvexError({message: ERROR_MESSAGES.SUBREDDIT_NOT_FOUND})

    const posts = await ctx.db
      .query("post")
      .withIndex("bySubreddit", (q) => q.eq("subreddit", subreddit._id))
      .paginate(args.paginationOpts);

    return {
      ...posts,
      page: await getEnrichedPosts(ctx, posts.page)
    }
  },
});

export const userPosts = query({
  args: { authorUsername: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args): Promise<PaginationResult<EnrichedPost>> => {
    const user = await ctx.db
      .query("users")
      .withIndex("byUsername", (q) => q.eq("username", args.authorUsername))
      .unique();

    if (!user) throw new ConvexError({message: ERROR_MESSAGES.USER_NOT_FOUND})

    const posts = await ctx.db
      .query("post")
      .withIndex("byAuthor", (q) => q.eq("authorId", user._id))
      .paginate(args.paginationOpts);

    return {
      ...posts,
      page: await getEnrichedPosts(ctx, posts.page)
    }
  },
});

export const deletePost = mutation({
  args: { id: v.id("post") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post)
      throw new ConvexError({ message: ERROR_MESSAGES.POST_NOT_FOUND });

    const user = await getCurrentUserOrThrow(ctx);
    
    // Only allow the author to delete their own posts
    if (post.authorId !== user._id) {
      throw new ConvexError({ message: ERROR_MESSAGES.UNAUTHORIZED_DELETE });
    }
    
    await counts.dec(ctx, postCountKey(user._id));
    await ctx.db.delete(args.id);
  },
});

export const search = query({
  args: { queryStr: v.string(), subreddit: v.string() },
  handler: async (ctx, args) => {
    if (!args.queryStr) return [];

    const subredditObj = await ctx.db
      .query("subreddit")
      .withIndex("byName", (q) => q.eq("name", args.subreddit))
      .unique();

    if (!subredditObj) return [];

    const posts = await ctx.db
      .query("post")
      .withSearchIndex("search_body", (q) =>
        q.search("subject", args.queryStr).eq("subreddit", subredditObj._id)
      )
      .take(10);

    return posts.map((post) => ({
      _id: post._id,
      title: post.subject,
      type: "post",
      name: subredditObj.name,
    }));
  },
});