/**
 * Convex Mutation Templates
 * Common mutation patterns for the schema
 */

import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ============================================
// Users Mutations
// ============================================

export const createUser = mutation({
	args: {
		email: v.string(),
		name: v.string(),
		clerkId: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		role: v.optional(
			v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
		),
	},
	handler: async (ctx, args) => {
		// Check if user already exists
		const existing = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.unique();

		if (existing) {
			throw new Error("User with this email already exists");
		}

		const now = Date.now();

		const userId = await ctx.db.insert("users", {
			email: args.email,
			name: args.name,
			clerkId: args.clerkId,
			imageUrl: args.imageUrl,
			role: args.role ?? "member",
			emailVerified: false,
			createdAt: now,
			updatedAt: now,
		});

		// Create empty profile
		await ctx.db.insert("profiles", {
			userId,
			updatedAt: now,
		});

		return userId;
	},
});

export const updateUser = mutation({
	args: {
		userId: v.id("users"),
		name: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		role: v.optional(
			v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
		),
		metadata: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		const { userId, ...updates } = args;

		const user = await ctx.db.get(userId);
		if (!user) {
			throw new Error("User not found");
		}

		await ctx.db.patch(userId, {
			...updates,
			updatedAt: Date.now(),
		});

		return userId;
	},
});

export const softDeleteUser = mutation({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error("User not found");
		}

		await ctx.db.patch(args.userId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});

// ============================================
// Posts Mutations
// ============================================

export const createPost = mutation({
	args: {
		title: v.string(),
		slug: v.string(),
		content: v.optional(v.string()),
		excerpt: v.optional(v.string()),
		authorId: v.id("users"),
		status: v.optional(
			v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
		),
	},
	handler: async (ctx, args) => {
		// Check slug uniqueness
		const existing = await ctx.db
			.query("posts")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();

		if (existing) {
			throw new Error("Post with this slug already exists");
		}

		const now = Date.now();
		const status = args.status ?? "draft";

		return await ctx.db.insert("posts", {
			title: args.title,
			slug: args.slug,
			content: args.content,
			excerpt: args.excerpt,
			authorId: args.authorId,
			status,
			viewCount: 0,
			likeCount: 0,
			publishedAt: status === "published" ? now : undefined,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updatePost = mutation({
	args: {
		postId: v.id("posts"),
		title: v.optional(v.string()),
		content: v.optional(v.string()),
		excerpt: v.optional(v.string()),
		status: v.optional(
			v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
		),
	},
	handler: async (ctx, args) => {
		const { postId, ...updates } = args;

		const post = await ctx.db.get(postId);
		if (!post) {
			throw new Error("Post not found");
		}

		const now = Date.now();
		const patchData: Record<string, unknown> = {
			...updates,
			updatedAt: now,
		};

		// Set publishedAt when publishing for the first time
		if (
			updates.status === "published" &&
			post.status !== "published" &&
			!post.publishedAt
		) {
			patchData.publishedAt = now;
		}

		await ctx.db.patch(postId, patchData);

		return postId;
	},
});

export const incrementViewCount = mutation({
	args: { postId: v.id("posts") },
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.postId);
		if (!post) {
			throw new Error("Post not found");
		}

		await ctx.db.patch(args.postId, {
			viewCount: post.viewCount + 1,
		});
	},
});

export const softDeletePost = mutation({
	args: { postId: v.id("posts") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.postId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});

// ============================================
// Comments Mutations
// ============================================

export const createComment = mutation({
	args: {
		postId: v.id("posts"),
		authorId: v.id("users"),
		content: v.string(),
		parentId: v.optional(v.id("comments")),
	},
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.postId);
		if (!post || post.deletedAt) {
			throw new Error("Post not found");
		}

		if (args.parentId) {
			const parent = await ctx.db.get(args.parentId);
			if (!parent || parent.deletedAt) {
				throw new Error("Parent comment not found");
			}
		}

		const now = Date.now();

		return await ctx.db.insert("comments", {
			postId: args.postId,
			authorId: args.authorId,
			content: args.content,
			parentId: args.parentId,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateComment = mutation({
	args: {
		commentId: v.id("comments"),
		content: v.string(),
	},
	handler: async (ctx, args) => {
		const comment = await ctx.db.get(args.commentId);
		if (!comment || comment.deletedAt) {
			throw new Error("Comment not found");
		}

		await ctx.db.patch(args.commentId, {
			content: args.content,
			updatedAt: Date.now(),
		});
	},
});

export const softDeleteComment = mutation({
	args: { commentId: v.id("comments") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.commentId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});

// ============================================
// Tags Mutations
// ============================================

export const createTag = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		color: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("tags")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();

		if (existing) {
			throw new Error("Tag with this slug already exists");
		}

		return await ctx.db.insert("tags", {
			name: args.name,
			slug: args.slug,
			description: args.description,
			color: args.color,
			postCount: 0,
			createdAt: Date.now(),
		});
	},
});

export const addTagToPost = mutation({
	args: {
		postId: v.id("posts"),
		tagId: v.id("tags"),
	},
	handler: async (ctx, args) => {
		// Check if already exists
		const existing = await ctx.db
			.query("postTags")
			.withIndex("by_post_tag", (q) =>
				q.eq("postId", args.postId).eq("tagId", args.tagId),
			)
			.unique();

		if (existing) {
			return existing._id;
		}

		// Create junction record
		const id = await ctx.db.insert("postTags", {
			postId: args.postId,
			tagId: args.tagId,
			createdAt: Date.now(),
		});

		// Increment tag count
		const tag = await ctx.db.get(args.tagId);
		if (tag) {
			await ctx.db.patch(args.tagId, {
				postCount: tag.postCount + 1,
			});
		}

		return id;
	},
});

export const removeTagFromPost = mutation({
	args: {
		postId: v.id("posts"),
		tagId: v.id("tags"),
	},
	handler: async (ctx, args) => {
		const postTag = await ctx.db
			.query("postTags")
			.withIndex("by_post_tag", (q) =>
				q.eq("postId", args.postId).eq("tagId", args.tagId),
			)
			.unique();

		if (postTag) {
			await ctx.db.delete(postTag._id);

			// Decrement tag count
			const tag = await ctx.db.get(args.tagId);
			if (tag && tag.postCount > 0) {
				await ctx.db.patch(args.tagId, {
					postCount: tag.postCount - 1,
				});
			}
		}
	},
});

// ============================================
// Likes Mutations
// ============================================

export const toggleLike = mutation({
	args: {
		userId: v.id("users"),
		targetType: v.union(v.literal("post"), v.literal("comment")),
		targetId: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("likes")
			.withIndex("by_user_target", (q) =>
				q
					.eq("userId", args.userId)
					.eq("targetType", args.targetType)
					.eq("targetId", args.targetId),
			)
			.unique();

		if (existing) {
			// Unlike
			await ctx.db.delete(existing._id);

			// Update like count on target
			if (args.targetType === "post") {
				const post = await ctx.db.get(args.targetId as any);
				if (post) {
					await ctx.db.patch(args.targetId as any, {
						likeCount: Math.max(0, post.likeCount - 1),
					});
				}
			}

			return { liked: false };
		} else {
			// Like
			await ctx.db.insert("likes", {
				userId: args.userId,
				targetType: args.targetType,
				targetId: args.targetId,
				createdAt: Date.now(),
			});

			// Update like count on target
			if (args.targetType === "post") {
				const post = await ctx.db.get(args.targetId as any);
				if (post) {
					await ctx.db.patch(args.targetId as any, {
						likeCount: post.likeCount + 1,
					});
				}
			}

			return { liked: true };
		}
	},
});

// ============================================
// Organizations Mutations
// ============================================

export const createOrganization = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
		creatorId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("organizations")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();

		if (existing) {
			throw new Error("Organization with this slug already exists");
		}

		const now = Date.now();

		const orgId = await ctx.db.insert("organizations", {
			name: args.name,
			slug: args.slug,
			plan: "free",
			createdAt: now,
			updatedAt: now,
		});

		// Add creator as owner
		await ctx.db.insert("organizationMembers", {
			organizationId: orgId,
			userId: args.creatorId,
			role: "owner",
			joinedAt: now,
		});

		return orgId;
	},
});

export const addOrganizationMember = mutation({
	args: {
		organizationId: v.id("organizations"),
		userId: v.id("users"),
		role: v.optional(
			v.union(v.literal("admin"), v.literal("member")),
		),
	},
	handler: async (ctx, args) => {
		// Check if already member
		const existing = await ctx.db
			.query("organizationMembers")
			.withIndex("by_org_user", (q) =>
				q.eq("organizationId", args.organizationId).eq("userId", args.userId),
			)
			.unique();

		if (existing) {
			throw new Error("User is already a member");
		}

		return await ctx.db.insert("organizationMembers", {
			organizationId: args.organizationId,
			userId: args.userId,
			role: args.role ?? "member",
			joinedAt: Date.now(),
		});
	},
});

// ============================================
// Notifications Mutations
// ============================================

export const createNotification = mutation({
	args: {
		userId: v.id("users"),
		type: v.string(),
		title: v.string(),
		body: v.optional(v.string()),
		data: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("notifications", {
			userId: args.userId,
			type: args.type,
			title: args.title,
			body: args.body,
			data: args.data,
			read: false,
			createdAt: Date.now(),
		});
	},
});

export const markNotificationRead = mutation({
	args: { notificationId: v.id("notifications") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.notificationId, {
			read: true,
			readAt: Date.now(),
		});
	},
});

export const markAllNotificationsRead = mutation({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		const unread = await ctx.db
			.query("notifications")
			.withIndex("by_user_read", (q) =>
				q.eq("userId", args.userId).eq("read", false),
			)
			.collect();

		const now = Date.now();

		await Promise.all(
			unread.map((n) =>
				ctx.db.patch(n._id, {
					read: true,
					readAt: now,
				}),
			),
		);

		return unread.length;
	},
});
