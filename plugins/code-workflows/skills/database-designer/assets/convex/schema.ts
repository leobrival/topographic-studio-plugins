/**
 * Convex Schema Template
 * Complete example with common patterns
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// ============================================
	// Users & Authentication
	// ============================================

	users: defineTable({
		// Identity (from Clerk, Auth0, etc.)
		clerkId: v.optional(v.string()),
		email: v.string(),
		name: v.string(),
		imageUrl: v.optional(v.string()),

		// Profile
		role: v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
		emailVerified: v.boolean(),

		// Metadata
		metadata: v.optional(
			v.object({
				timezone: v.optional(v.string()),
				locale: v.optional(v.string()),
				preferences: v.optional(v.any()),
			}),
		),

		// Timestamps (stored as Unix milliseconds)
		createdAt: v.number(),
		updatedAt: v.number(),
		deletedAt: v.optional(v.number()),
	})
		.index("by_clerk_id", ["clerkId"])
		.index("by_email", ["email"])
		.index("by_role", ["role"])
		.searchIndex("search_name", {
			searchField: "name",
			filterFields: ["role"],
		}),

	profiles: defineTable({
		userId: v.id("users"),
		bio: v.optional(v.string()),
		website: v.optional(v.string()),
		location: v.optional(v.string()),
		socialLinks: v.optional(
			v.object({
				twitter: v.optional(v.string()),
				github: v.optional(v.string()),
				linkedin: v.optional(v.string()),
			}),
		),
		updatedAt: v.number(),
	}).index("by_user", ["userId"]),

	sessions: defineTable({
		userId: v.id("users"),
		token: v.string(),
		userAgent: v.optional(v.string()),
		ipAddress: v.optional(v.string()),
		expiresAt: v.number(),
		createdAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_token", ["token"])
		.index("by_expires", ["expiresAt"]),

	// ============================================
	// Content (Posts, Comments, Tags)
	// ============================================

	posts: defineTable({
		slug: v.string(),
		title: v.string(),
		content: v.optional(v.string()),
		excerpt: v.optional(v.string()),
		status: v.union(
			v.literal("draft"),
			v.literal("published"),
			v.literal("archived"),
		),
		authorId: v.optional(v.id("users")),

		// Media
		featuredImageId: v.optional(v.id("_storage")),
		featuredImageUrl: v.optional(v.string()),

		// Metrics
		viewCount: v.number(),
		likeCount: v.number(),

		// Timestamps
		publishedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
		deletedAt: v.optional(v.number()),
	})
		.index("by_slug", ["slug"])
		.index("by_author", ["authorId"])
		.index("by_status", ["status"])
		.index("by_published", ["publishedAt"])
		.index("by_status_published", ["status", "publishedAt"])
		.searchIndex("search_content", {
			searchField: "content",
			filterFields: ["status", "authorId"],
		}),

	comments: defineTable({
		content: v.string(),
		postId: v.id("posts"),
		authorId: v.optional(v.id("users")),
		parentId: v.optional(v.id("comments")), // For replies

		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
		deletedAt: v.optional(v.number()),
	})
		.index("by_post", ["postId"])
		.index("by_author", ["authorId"])
		.index("by_parent", ["parentId"])
		.index("by_post_created", ["postId", "createdAt"]),

	tags: defineTable({
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		color: v.optional(v.string()),
		postCount: v.number(), // Denormalized count
		createdAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_name", ["name"]),

	// Junction table: Posts <-> Tags (M:N)
	postTags: defineTable({
		postId: v.id("posts"),
		tagId: v.id("tags"),
		createdAt: v.number(),
	})
		.index("by_post", ["postId"])
		.index("by_tag", ["tagId"])
		.index("by_post_tag", ["postId", "tagId"]),

	// ============================================
	// Likes (Polymorphic)
	// ============================================

	likes: defineTable({
		userId: v.id("users"),
		targetType: v.union(v.literal("post"), v.literal("comment")),
		targetId: v.string(), // Store ID as string for flexibility
		createdAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_target", ["targetType", "targetId"])
		.index("by_user_target", ["userId", "targetType", "targetId"]),

	// ============================================
	// Organizations & Teams
	// ============================================

	organizations: defineTable({
		name: v.string(),
		slug: v.string(),
		logoId: v.optional(v.id("_storage")),
		logoUrl: v.optional(v.string()),

		// Settings
		settings: v.optional(
			v.object({
				allowPublicProjects: v.optional(v.boolean()),
				defaultRole: v.optional(v.string()),
				features: v.optional(v.array(v.string())),
			}),
		),

		// Billing
		plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
		stripeCustomerId: v.optional(v.string()),

		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_plan", ["plan"]),

	organizationMembers: defineTable({
		organizationId: v.id("organizations"),
		userId: v.id("users"),
		role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
		joinedAt: v.number(),
	})
		.index("by_organization", ["organizationId"])
		.index("by_user", ["userId"])
		.index("by_org_user", ["organizationId", "userId"])
		.index("by_org_role", ["organizationId", "role"]),

	// ============================================
	// Invitations
	// ============================================

	invitations: defineTable({
		organizationId: v.id("organizations"),
		email: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
		token: v.string(),
		invitedBy: v.id("users"),
		status: v.union(
			v.literal("pending"),
			v.literal("accepted"),
			v.literal("expired"),
		),
		expiresAt: v.number(),
		createdAt: v.number(),
	})
		.index("by_organization", ["organizationId"])
		.index("by_email", ["email"])
		.index("by_token", ["token"])
		.index("by_status", ["status"]),

	// ============================================
	// Notifications
	// ============================================

	notifications: defineTable({
		userId: v.id("users"),
		type: v.string(), // "comment", "like", "mention", "system"
		title: v.string(),
		body: v.optional(v.string()),
		data: v.optional(v.any()), // Additional context
		read: v.boolean(),
		readAt: v.optional(v.number()),
		createdAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_user_read", ["userId", "read"])
		.index("by_user_created", ["userId", "createdAt"]),

	// ============================================
	// Audit Logs
	// ============================================

	auditLogs: defineTable({
		tableName: v.string(),
		recordId: v.string(),
		action: v.union(
			v.literal("create"),
			v.literal("update"),
			v.literal("delete"),
		),
		changes: v.optional(
			v.object({
				before: v.optional(v.any()),
				after: v.optional(v.any()),
			}),
		),
		userId: v.optional(v.id("users")),
		metadata: v.optional(
			v.object({
				ipAddress: v.optional(v.string()),
				userAgent: v.optional(v.string()),
			}),
		),
		createdAt: v.number(),
	})
		.index("by_table_record", ["tableName", "recordId"])
		.index("by_user", ["userId"])
		.index("by_action", ["action"])
		.index("by_created", ["createdAt"]),

	// ============================================
	// Feature Flags
	// ============================================

	featureFlags: defineTable({
		key: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
		enabled: v.boolean(),
		percentage: v.optional(v.number()), // For gradual rollout
		allowedUsers: v.optional(v.array(v.id("users"))),
		allowedOrgs: v.optional(v.array(v.id("organizations"))),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_key", ["key"]),

	// ============================================
	// Rate Limiting
	// ============================================

	rateLimits: defineTable({
		key: v.string(), // e.g., "api:user_123" or "ip:192.168.1.1"
		count: v.number(),
		windowStart: v.number(),
		expiresAt: v.number(),
	})
		.index("by_key", ["key"])
		.index("by_expires", ["expiresAt"]),
});
