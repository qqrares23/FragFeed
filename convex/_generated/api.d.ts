/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as comments from "../comments.js";
import type * as counter from "../counter.js";
import type * as http from "../http.js";
import type * as image from "../image.js";
import type * as leaderboard from "../leaderboard.js";
import type * as notifications from "../notifications.js";
import type * as post from "../post.js";
import type * as subreddit from "../subreddit.js";
import type * as users from "../users.js";
import type * as vote from "../vote.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  comments: typeof comments;
  counter: typeof counter;
  http: typeof http;
  image: typeof image;
  leaderboard: typeof leaderboard;
  notifications: typeof notifications;
  post: typeof post;
  subreddit: typeof subreddit;
  users: typeof users;
  vote: typeof vote;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
