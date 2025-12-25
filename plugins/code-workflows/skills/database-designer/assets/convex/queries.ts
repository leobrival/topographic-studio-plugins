/**
 * Convex Query Templates
 * Common query patterns for the schema
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

// ============================================
// Users Queries
// ============================================

export const getUserById = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	},
});

export const getUserByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.unique();
	},
});

export const getUserByClerkId = query({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.unique();
	},
});

export const searchUsers = query({
	args: {
		query: v.string(),
		role: v.optional(
			v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
		),
	},
	handler: async (ctx, args) => {
		let searchQuery = ctx.db
			.query("users")
			.withSearchIndex("search_name", (q) => {
				let search = q.search("name", args.query);
				if (args.role) {
					search = search.eq("role", args.role);
				}
				return search;
			});

		return await searchQuery.take(20);
	},
});

// ============================================
// Posts Queries
// ============================================

export const getPublishedPosts = query({
	args: {
		limit: v.optional(v.number()),
		cursor: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;

		const posts = await ctx.db
			.query("posts")
			.withIndex("by_status_published", (q) => q.eq("status", "published"))
			.order("desc")
			.take(limit + 1);

		// Check if there are more results
		const hasMore = posts.length > limit;
		const items = hasMore ? posts.slice(0, -1) : posts;

		return {
			items,
			hasMore,
			nextCursor: hasMore ? items[items.length - 1]._id : null,
		};
	},
});

export const getPostBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		const post = await ctx.db
			.query("posts")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();

		if (!post) return null;

		// Fetch author
		const author = post.authorId ? await ctx.db.get(post.authorId) : null;

		// Fetch tags
		const postTags = await ctx.db
			.query("postTags")
			.withIndex("by_post", (q) => q.eq("postId", post._id))
			.collect();

		const tags = await Promise.all(
			postTags.map((pt) => ctx.db.get(pt.tagId)),
		);

		return {
			...post,
			author,
			tags: tags.filter(Boolean),
		};
	},
});

export const getPostsByAuthor = query({
	args: {
		authorId: v.id("users"),
		status: v.optional(
			v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
		),
	},
	handler: async (ctx, args) => {
		let posts = ctx.db
			.query("posts")
			.withIndex("by_author", (q) => q.eq("authorId", args.authorId));

		if (args.status) {
			posts = posts.filter((q) => q.eq(q.field("status"), args.status));
		}

		return await posts.order("desc").collect();
	},
});

export const searchPosts = query({
	args: {
		query: v.string(),
		status: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("posts")
			.withSearchIndex("search_content", (q) => {
				let search = q.search("content", args.query);
				if (args.status) {
					search = search.eq("status", args.status as "draft" | "published" | "archived");
				}
				return search;
			})
			.take(20);
	},
});

// ============================================
// Comments Queries
// ============================================

export const getCommentsByPost = query({
	args: {
		postId: v.id("posts"),
		includeReplies: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		let comments = await ctx.db
			.query("comments")
			.withIndex("by_post_created", (q) => q.eq("postId", args.postId))
			.order("asc")
			.collect();

		// Filter out deleted comments
		comments = comments.filter((c) => !c.deletedAt);

		// Optionally filter to only top-level comments
		if (!args.includeReplies) {
			comments = comments.filter((c) => !c.parentId);
		}

		// Fetch authors
		const commentsWithAuthors = await Promise.all(
			comments.map(async (comment) => {
				const author = comment.authorId
					? await ctx.db.get(comment.authorId)
					: null;
				return { ...comment, author };
			}),
		);

		return commentsWithAuthors;
	},
});

export const getCommentReplies = query({
	args: { commentId: v.id("comments") },
	handler: async (ctx, args) => {
		const replies = await ctx.db
			.query("comments")
			.withIndex("by_parent", (q) => q.eq("parentId", args.commentId))
			.collect();

		return replies.filter((r) => !r.deletedAt);
	},
});

// ============================================
// Organizations Queries
// ============================================

export const getOrganizationBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("organizations")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();
	},
});

export const getUserOrganizations = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		const memberships = await ctx.db
			.query("organizationMembers")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();

		const organizations = await Promise.all(
			memberships.map(async (m) => {
				const org = await ctx.db.get(m.organizationId);
				return org ? { ...org, role: m.role, joinedAt: m.joinedAt } : null;
			}),
		);

		return organizations.filter(Boolean);
	},
});

export const getOrganizationMembers = query({
	args: {
		organizationId: v.id("organizations"),
		role: v.optional(
			v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
		),
	},
	handler: async (ctx, args) => {
		let memberships = ctx.db
			.query("organizationMembers")
			.withIndex("by_organization", (q) =>
				q.eq("organizationId", args.organizationId),
			);

		if (args.role) {
			memberships = memberships.filter((q) =>
				q.eq(q.field("role"), args.role),
			);
		}

		const results = await memberships.collect();

		return await Promise.all(
			results.map(async (m) => {
				const user = await ctx.db.get(m.userId);
				return { ...m, user };
			}),
		);
	},
});

// ============================================
// Notifications Queries
// ============================================

export const getUserNotifications = query({
	args: {
		userId: v.id("users"),
		unreadOnly: v.optional(v.boolean()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 50;

		let notifications = ctx.db
			.query("notifications")
			.withIndex("by_user_created", (q) => q.eq("userId", args.userId))
			.order("desc");

		if (args.unreadOnly) {
			notifications = notifications.filter((q) => q.eq(q.field("read"), false));
		}

		return await notifications.take(limit);
	},
});

export const getUnreadNotificationCount = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		const notifications = await ctx.db
			.query("notifications")
			.withIndex("by_user_read", (q) =>
				q.eq("userId", args.userId).eq("read", false),
			)
			.collect();

		return notifications.length;
	},
});

// ============================================
// Tags Queries
// ============================================

export const getAllTags = query({
	handler: async (ctx) => {
		return await ctx.db.query("tags").order("asc").collect();
	},
});

export const getPostTags = query({
	args: { postId: v.id("posts") },
	handler: async (ctx, args) => {
		const postTags = await ctx.db
			.query("postTags")
			.withIndex("by_post", (q) => q.eq("postId", args.postId))
			.collect();

		const tags = await Promise.all(postTags.map((pt) => ctx.db.get(pt.tagId)));

		return tags.filter(Boolean);
	},
});

export const getPostsByTag = query({
	args: { tagId: v.id("tags") },
	handler: async (ctx, args) => {
		const postTags = await ctx.db
			.query("postTags")
			.withIndex("by_tag", (q) => q.eq("tagId", args.tagId))
			.collect();

		const posts = await Promise.all(
			postTags.map((pt) => ctx.db.get(pt.postId)),
		);

		return posts
			.filter(Boolean)
			.filter((p) => p.status === "published" && !p.deletedAt);
	},
});

// ============================================
// Likes Queries
// ============================================

export const hasUserLiked = query({
	args: {
		userId: v.id("users"),
		targetType: v.union(v.literal("post"), v.literal("comment")),
		targetId: v.string(),
	},
	handler: async (ctx, args) => {
		const like = await ctx.db
			.query("likes")
			.withIndex("by_user_target", (q) =>
				q
					.eq("userId", args.userId)
					.eq("targetType", args.targetType)
					.eq("targetId", args.targetId),
			)
			.unique();

		return !!like;
	},
});

export const getLikeCount = query({
	args: {
		targetType: v.union(v.literal("post"), v.literal("comment")),
		targetId: v.string(),
	},
	handler: async (ctx, args) => {
		const likes = await ctx.db
			.query("likes")
			.withIndex("by_target", (q) =>
				q.eq("targetType", args.targetType).eq("targetId", args.targetId),
			)
			.collect();

		return likes.length;
	},
});
