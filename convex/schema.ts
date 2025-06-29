import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    externalId: v.string(),
    profilePicture: v.optional(v.id("_storage")),
    bannerImage: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    isOnline: v.optional(v.boolean()),
    lastSeen: v.optional(v.number()),
    showOnlineStatus: v.optional(v.boolean()),
    profileVisibility: v.optional(v.string()), // "public" | "private"
    notificationSettings: v.optional(v.object({
      newPosts: v.boolean(),
      comments: v.boolean(),
      mentions: v.boolean(),
      communityUpdates: v.boolean(),
    })),
    steamProfile: v.optional(v.object({
      steamId: v.string(),
      username: v.string(),
      profileUrl: v.string(),
      avatarUrl: v.optional(v.string()),
      connectedAt: v.number(),
    })),
    riotProfile: v.optional(v.object({
      riotId: v.string(),
      gameName: v.string(),
      tagLine: v.string(),
      connectedAt: v.number(),
    })),
    epicProfile: v.optional(v.object({
      epicId: v.string(),
      displayName: v.string(),
      connectedAt: v.number(),
    })),
    ubisoftProfile: v.optional(v.object({
      ubisoftId: v.string(),
      username: v.string(),
      connectedAt: v.number(),
    })),
  })
    .index("byExternalId", ["externalId"])
    .index("byUsername", ["username"]),
  subreddit: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    authorId: v.id("users"),
    guidelines: v.optional(v.array(v.string())),
  })
    .index("byName", ["name"])
    .index("byAuthor", ["authorId"])
    .searchIndex("search_body", { searchField: "name" }),
  subredditMembership: defineTable({
    userId: v.id("users"),
    subredditId: v.id("subreddit"),
    joinedAt: v.number(),
  })
    .index("byUser", ["userId"])
    .index("bySubreddit", ["subredditId"])
    .index("byUserAndSubreddit", ["userId", "subredditId"]),
  post: defineTable({
    subject: v.string(),
    body: v.string(),
    subreddit: v.id("subreddit"),
    authorId: v.id("users"),
    image: v.optional(v.id("_storage")),
  })
    .searchIndex("search_body", {
      searchField: "subject",
      filterFields: ["subreddit"],
    })
    .index("bySubreddit", ["subreddit"])
    .index("byAuthor", ["authorId"]),
  comments: defineTable({
    content: v.string(),
    postId: v.id("post"),
    authorId: v.id("users"),
  }).index("byPost", ["postId"]),
  downvote: defineTable({
    postId: v.id("post"),
    userId: v.id("users"),
  })
    .index("byPost", ["postId", "userId"]),
  upvote: defineTable({
    postId: v.id("post"),
    userId: v.id("users"),
  })
    .index("byPost", ["postId", "userId"]),
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    postId: v.optional(v.id("post")),
    subredditId: v.optional(v.id("subreddit")),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("byUser", ["userId"])
    .index("byUserAndRead", ["userId", "read"]),
});