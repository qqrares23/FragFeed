import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    externalId: v.string(),
  })
    .index("byExternalId", ["externalId"])
    .index("byUsername", ["username"]),
  subreddit: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    authorId: v.id("users"),
  })
    .index("byName", ["name"])
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