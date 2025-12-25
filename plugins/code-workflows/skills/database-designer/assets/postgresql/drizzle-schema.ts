/**
 * Drizzle ORM Schema Template
 * Complete example with common patterns
 */

import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// ============================================
// Enums
// ============================================

export const userRoleEnum = pgEnum("user_role", ["admin", "member", "guest"]);
export const postStatusEnum = pgEnum("post_status", [
	"draft",
	"published",
	"archived",
]);

// ============================================
// Users & Authentication
// ============================================

export const users = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		email: varchar("email", { length: 255 }).notNull().unique(),
		name: varchar("name", { length: 255 }).notNull(),
		role: userRoleEnum("role").default("member").notNull(),
		emailVerified: boolean("email_verified").default(false).notNull(),
		avatarUrl: text("avatar_url"),
		metadata: jsonb("metadata").$type<Record<string, unknown>>(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
	},
	(table) => [
		index("users_email_idx").on(table.email),
		index("users_role_idx").on(table.role),
		index("users_created_at_idx").on(table.createdAt),
	],
);

export const profiles = pgTable("profiles", {
	userId: uuid("user_id")
		.primaryKey()
		.references(() => users.id, { onDelete: "cascade" }),
	bio: text("bio"),
	website: varchar("website", { length: 255 }),
	location: varchar("location", { length: 255 }),
	socialLinks: jsonb("social_links").$type<{
		twitter?: string;
		github?: string;
		linkedin?: string;
	}>(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const sessions = pgTable(
	"sessions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		token: varchar("token", { length: 255 }).notNull().unique(),
		userAgent: text("user_agent"),
		ipAddress: varchar("ip_address", { length: 45 }),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("sessions_user_id_idx").on(table.userId),
		index("sessions_token_idx").on(table.token),
		index("sessions_expires_at_idx").on(table.expiresAt),
	],
);

// ============================================
// Content (Posts, Comments, Tags)
// ============================================

export const posts = pgTable(
	"posts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		slug: varchar("slug", { length: 255 }).notNull().unique(),
		title: varchar("title", { length: 255 }).notNull(),
		content: text("content"),
		excerpt: text("excerpt"),
		status: postStatusEnum("status").default("draft").notNull(),
		authorId: uuid("author_id")
			.references(() => users.id, { onDelete: "set null" }),
		featuredImageUrl: text("featured_image_url"),
		viewCount: integer("view_count").default(0).notNull(),
		publishedAt: timestamp("published_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
	},
	(table) => [
		index("posts_author_id_idx").on(table.authorId),
		index("posts_status_idx").on(table.status),
		index("posts_published_at_idx").on(table.publishedAt),
		uniqueIndex("posts_slug_idx").on(table.slug),
	],
);

export const comments = pgTable(
	"comments",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		content: text("content").notNull(),
		postId: uuid("post_id")
			.references(() => posts.id, { onDelete: "cascade" })
			.notNull(),
		authorId: uuid("author_id")
			.references(() => users.id, { onDelete: "set null" }),
		parentId: uuid("parent_id"), // Self-reference for replies
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
	},
	(table) => [
		index("comments_post_id_idx").on(table.postId),
		index("comments_author_id_idx").on(table.authorId),
		index("comments_parent_id_idx").on(table.parentId),
	],
);

export const tags = pgTable(
	"tags",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: varchar("name", { length: 100 }).notNull().unique(),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		description: text("description"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [uniqueIndex("tags_slug_idx").on(table.slug)],
);

// Many-to-many: Posts <-> Tags
export const postTags = pgTable(
	"post_tags",
	{
		postId: uuid("post_id")
			.references(() => posts.id, { onDelete: "cascade" })
			.notNull(),
		tagId: uuid("tag_id")
			.references(() => tags.id, { onDelete: "cascade" })
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.postId, table.tagId] }),
		index("post_tags_post_id_idx").on(table.postId),
		index("post_tags_tag_id_idx").on(table.tagId),
	],
);

// ============================================
// Organizations & Teams
// ============================================

export const organizations = pgTable(
	"organizations",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: varchar("name", { length: 255 }).notNull(),
		slug: varchar("slug", { length: 255 }).notNull().unique(),
		logoUrl: text("logo_url"),
		settings: jsonb("settings").$type<{
			allowPublicProjects?: boolean;
			defaultRole?: string;
		}>(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [uniqueIndex("organizations_slug_idx").on(table.slug)],
);

export const organizationMemberRoleEnum = pgEnum("org_member_role", [
	"owner",
	"admin",
	"member",
]);

export const organizationMembers = pgTable(
	"organization_members",
	{
		organizationId: uuid("organization_id")
			.references(() => organizations.id, { onDelete: "cascade" })
			.notNull(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		role: organizationMemberRoleEnum("role").default("member").notNull(),
		joinedAt: timestamp("joined_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.organizationId, table.userId] }),
		index("org_members_org_id_idx").on(table.organizationId),
		index("org_members_user_id_idx").on(table.userId),
	],
);

// ============================================
// Audit Logs
// ============================================

export const auditLogs = pgTable(
	"audit_logs",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		tableName: varchar("table_name", { length: 100 }).notNull(),
		recordId: uuid("record_id").notNull(),
		action: varchar("action", { length: 20 }).notNull(), // INSERT, UPDATE, DELETE
		oldData: jsonb("old_data"),
		newData: jsonb("new_data"),
		userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
		ipAddress: varchar("ip_address", { length: 45 }),
		userAgent: text("user_agent"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("audit_logs_table_record_idx").on(table.tableName, table.recordId),
		index("audit_logs_user_id_idx").on(table.userId),
		index("audit_logs_created_at_idx").on(table.createdAt),
	],
);

// ============================================
// Relations (for Drizzle query builder)
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
	profile: one(profiles, {
		fields: [users.id],
		references: [profiles.userId],
	}),
	posts: many(posts),
	comments: many(comments),
	sessions: many(sessions),
	organizationMemberships: many(organizationMembers),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id],
	}),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(users, {
		fields: [posts.authorId],
		references: [users.id],
	}),
	comments: many(comments),
	postTags: many(postTags),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
	}),
	author: one(users, {
		fields: [comments.authorId],
		references: [users.id],
	}),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: "commentReplies",
	}),
	replies: many(comments, { relationName: "commentReplies" }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
	post: one(posts, {
		fields: [postTags.postId],
		references: [posts.id],
	}),
	tag: one(tags, {
		fields: [postTags.tagId],
		references: [tags.id],
	}),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
	members: many(organizationMembers),
}));

export const organizationMembersRelations = relations(
	organizationMembers,
	({ one }) => ({
		organization: one(organizations, {
			fields: [organizationMembers.organizationId],
			references: [organizations.id],
		}),
		user: one(users, {
			fields: [organizationMembers.userId],
			references: [users.id],
		}),
	}),
);

// ============================================
// Type Exports
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
