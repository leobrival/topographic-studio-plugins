/**
 * API Types Template
 * Copy and customize for your API
 */

import { z } from "zod";

// ============================================================================
// Common Schemas
// ============================================================================

// Pagination
export const PaginationSchema = z.object({
	page: z.number().int().positive(),
	limit: z.number().int().positive().max(100),
	total: z.number().int().nonnegative(),
	totalPages: z.number().int().nonnegative(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Timestamps
export const TimestampsSchema = z.object({
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

// ID types
export const UUIDSchema = z.string().uuid();
export const CUIDSchema = z.string().cuid();
export const NanoIDSchema = z.string().length(21);

// ============================================================================
// Resource Schemas (Example: Users)
// ============================================================================

// Base user schema (shared fields)
const UserBaseSchema = z.object({
	name: z.string().min(1).max(100),
	email: z.string().email(),
	role: z.enum(["admin", "user", "guest"]).default("user"),
	avatar: z.string().url().optional(),
	metadata: z.record(z.unknown()).optional(),
});

// Create user (input)
export const CreateUserSchema = UserBaseSchema.pick({
	name: true,
	email: true,
	role: true,
});

// Update user (input, all optional)
export const UpdateUserSchema = UserBaseSchema.partial();

// User (output)
export const UserSchema = UserBaseSchema.extend({
	id: UUIDSchema,
}).merge(TimestampsSchema);

// User list response
export const UsersListSchema = z.object({
	data: z.array(UserSchema),
	pagination: PaginationSchema,
});

// Export types
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type User = z.infer<typeof UserSchema>;
export type UsersList = z.infer<typeof UsersListSchema>;

// ============================================================================
// Resource Schemas (Example: Posts)
// ============================================================================

const PostBaseSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.string(),
	status: z.enum(["draft", "published", "archived"]),
	tags: z.array(z.string()).default([]),
	authorId: UUIDSchema,
});

export const CreatePostSchema = PostBaseSchema.omit({ authorId: true });
export const UpdatePostSchema = PostBaseSchema.partial();

export const PostSchema = PostBaseSchema.extend({
	id: UUIDSchema,
	slug: z.string(),
	author: UserSchema.pick({ id: true, name: true, avatar: true }).optional(),
}).merge(TimestampsSchema);

export const PostsListSchema = z.object({
	data: z.array(PostSchema),
	pagination: PaginationSchema,
});

export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
export type Post = z.infer<typeof PostSchema>;
export type PostsList = z.infer<typeof PostsListSchema>;

// ============================================================================
// API Error Schema
// ============================================================================

export const ApiErrorResponseSchema = z.object({
	error: z.object({
		code: z.string(),
		message: z.string(),
		details: z
			.array(
				z.object({
					field: z.string().optional(),
					message: z.string(),
				}),
			)
			.optional(),
	}),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// ============================================================================
// Query Parameters
// ============================================================================

export const ListQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	sort: z.string().optional(),
	order: z.enum(["asc", "desc"]).default("desc"),
	search: z.string().optional(),
});

export type ListQuery = z.infer<typeof ListQuerySchema>;

// ============================================================================
// Utility Types
// ============================================================================

// Make all properties optional except specified keys
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

// Make specified properties required
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Extract ID type from schema
export type IdOf<T extends { id: unknown }> = T["id"];

// Response wrapper
export type ApiResponse<T> = {
	data: T;
	meta?: {
		requestId: string;
		timestamp: string;
	};
};

// List response wrapper
export type ListResponse<T> = {
	data: T[];
	pagination: Pagination;
};
