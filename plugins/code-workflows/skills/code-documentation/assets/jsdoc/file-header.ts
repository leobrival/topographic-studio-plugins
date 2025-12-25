/**
 * File Header Templates
 *
 * @fileoverview Templates for file-level documentation headers.
 * Copy and adapt these templates for your project.
 *
 * @module templates/jsdoc/file-header
 */

// ============================================================
// Standard File Header Template
// ============================================================

/**
 * @fileoverview Brief description of what this file contains.
 *
 * Longer description that explains:
 * - The purpose of this module
 * - Main exports and their usage
 * - Any important notes for developers
 *
 * @module path/to/module
 *
 * @example
 * ```typescript
 * import { mainExport } from "@/path/to/module";
 *
 * const result = mainExport();
 * ```
 *
 * @author Author Name
 * @since 1.0.0
 */

// ============================================================
// Service File Header
// ============================================================

/**
 * @fileoverview User Authentication Service
 *
 * Handles all authentication-related operations:
 * - User login/logout
 * - Session management
 * - Token refresh
 * - OAuth provider integration
 *
 * @module services/auth
 *
 * @requires @/lib/prisma - Database client for user storage
 * @requires @/lib/jwt - JWT utilities for token management
 * @requires @/config/auth - Authentication configuration
 *
 * @example Basic usage
 * ```typescript
 * import { AuthService } from "@/services/auth";
 *
 * const auth = new AuthService();
 *
 * // Login
 * const session = await auth.login(email, password);
 *
 * // Verify token
 * const user = await auth.verifyToken(token);
 *
 * // Logout
 * await auth.logout(sessionId);
 * ```
 *
 * @see {@link https://docs.example.com/auth} API Documentation
 * @see {@link @/services/user} User service for profile operations
 *
 * @author Development Team
 * @since 1.0.0
 * @license MIT
 */

// ============================================================
// API Route File Header
// ============================================================

/**
 * @fileoverview Users API Routes
 *
 * REST API endpoints for user management:
 *
 * | Method | Path | Description |
 * |--------|------|-------------|
 * | GET | /api/users | List all users |
 * | GET | /api/users/:id | Get user by ID |
 * | POST | /api/users | Create new user |
 * | PATCH | /api/users/:id | Update user |
 * | DELETE | /api/users/:id | Delete user |
 *
 * @module api/users
 *
 * @requires @/services/user - User service layer
 * @requires @/lib/auth - Authentication middleware
 * @requires @/lib/validation - Request validation
 *
 * @example Fetching users
 * ```typescript
 * // GET /api/users?page=1&limit=20
 * const response = await fetch("/api/users?page=1&limit=20");
 * const { data, pagination } = await response.json();
 * ```
 *
 * @example Creating a user
 * ```typescript
 * const response = await fetch("/api/users", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ email: "user@example.com", name: "John" }),
 * });
 * ```
 *
 * @since 1.0.0
 * @category API
 */

// ============================================================
// React Component File Header
// ============================================================

/**
 * @fileoverview UserProfile Component
 *
 * Displays user profile information with edit capabilities.
 *
 * Features:
 * - Avatar display and upload
 * - Profile information editing
 * - Password change form
 * - Account deletion
 *
 * @module components/UserProfile
 *
 * @requires react
 * @requires @/hooks/useUser - User data hook
 * @requires @/components/ui - UI components
 *
 * @example Basic usage
 * ```tsx
 * import { UserProfile } from "@/components/UserProfile";
 *
 * function ProfilePage() {
 *   return <UserProfile userId="user_123" />;
 * }
 * ```
 *
 * @example With callbacks
 * ```tsx
 * <UserProfile
 *   userId="user_123"
 *   onSave={(user) => console.log("Saved:", user)}
 *   onDelete={() => router.push("/goodbye")}
 * />
 * ```
 *
 * @since 1.0.0
 * @category Components
 */

// ============================================================
// Utility Library File Header
// ============================================================

/**
 * @fileoverview String Utilities
 *
 * Collection of string manipulation functions:
 * - Case conversion (camelCase, snake_case, kebab-case)
 * - Truncation with ellipsis
 * - Slug generation
 * - Template string helpers
 *
 * All functions are pure (no side effects) and null-safe.
 *
 * @module lib/string-utils
 *
 * @example
 * ```typescript
 * import { toKebabCase, truncate, slugify } from "@/lib/string-utils";
 *
 * toKebabCase("helloWorld");     // "hello-world"
 * truncate("Long text...", 10); // "Long te..."
 * slugify("Hello World!");      // "hello-world"
 * ```
 *
 * @since 1.0.0
 * @category Utilities
 */

// ============================================================
// Configuration File Header
// ============================================================

/**
 * @fileoverview Application Configuration
 *
 * Centralized configuration management with:
 * - Environment variable validation
 * - Type-safe config access
 * - Default values
 * - Runtime config overrides
 *
 * @module config/app
 *
 * @requires zod - Schema validation
 *
 * @example Accessing config
 * ```typescript
 * import { config } from "@/config/app";
 *
 * console.log(config.database.url);
 * console.log(config.api.baseUrl);
 * ```
 *
 * @example Environment variables required
 * ```bash
 * DATABASE_URL=postgresql://...
 * API_BASE_URL=https://api.example.com
 * JWT_SECRET=your-secret-key
 * ```
 *
 * @throws {ConfigurationError} If required environment variables are missing
 *
 * @since 1.0.0
 * @category Configuration
 */

// ============================================================
// Test File Header
// ============================================================

/**
 * @fileoverview UserService Unit Tests
 *
 * Test suite for the UserService class.
 *
 * Test categories:
 * - User creation
 * - User retrieval
 * - User updates
 * - User deletion
 * - Edge cases and error handling
 *
 * @module tests/services/user.test
 *
 * @requires vitest - Test framework
 * @requires @/services/user - Service under test
 * @requires @/tests/fixtures - Test fixtures
 *
 * @example Running tests
 * ```bash
 * # Run all user service tests
 * pnpm test services/user.test.ts
 *
 * # Run with coverage
 * pnpm test:coverage services/user.test.ts
 *
 * # Run specific test
 * pnpm test -t "should create a user"
 * ```
 *
 * @since 1.0.0
 * @category Tests
 */

// ============================================================
// Database Migration File Header
// ============================================================

/**
 * @fileoverview Add user preferences table
 *
 * Migration: 20240115_add_user_preferences
 *
 * Changes:
 * - Creates `user_preferences` table
 * - Adds foreign key to `users` table
 * - Creates index on `user_id` column
 *
 * @module migrations/20240115_add_user_preferences
 *
 * @example Running migration
 * ```bash
 * # Apply migration
 * pnpm db:migrate
 *
 * # Rollback migration
 * pnpm db:rollback
 * ```
 *
 * @remarks
 * This migration is reversible. The down() function drops all
 * created tables and indexes.
 *
 * @since 1.2.0
 * @category Database
 */

// ============================================================
// Hook File Header
// ============================================================

/**
 * @fileoverview useUser Hook
 *
 * React hook for managing user data with:
 * - Automatic data fetching
 * - Caching and revalidation
 * - Optimistic updates
 * - Error handling
 *
 * @module hooks/useUser
 *
 * @requires react
 * @requires swr - Data fetching library
 * @requires @/lib/api - API client
 *
 * @example Basic usage
 * ```tsx
 * function UserProfile() {
 *   const { user, isLoading, error } = useUser("user_123");
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return <div>{user.name}</div>;
 * }
 * ```
 *
 * @example With mutation
 * ```tsx
 * function UserSettings() {
 *   const { user, updateUser } = useUser("user_123");
 *
 *   const handleSave = async () => {
 *     await updateUser({ name: "New Name" });
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 *
 * @since 1.0.0
 * @category Hooks
 */

// ============================================================
// Type Definition File Header
// ============================================================

/**
 * @fileoverview API Type Definitions
 *
 * TypeScript types for API requests and responses.
 *
 * Includes:
 * - Request body types
 * - Response types
 * - Error types
 * - Pagination types
 *
 * @module types/api
 *
 * @example Importing types
 * ```typescript
 * import type {
 *   ApiResponse,
 *   PaginatedResponse,
 *   ApiError,
 * } from "@/types/api";
 *
 * const response: ApiResponse<User> = await fetchUser();
 * ```
 *
 * @since 1.0.0
 * @category Types
 */

// ============================================================
// Constants File Header
// ============================================================

/**
 * @fileoverview Application Constants
 *
 * Centralized constants for:
 * - API endpoints
 * - Cache keys
 * - Validation limits
 * - Feature flags
 *
 * @module constants/app
 *
 * @example
 * ```typescript
 * import { API_ENDPOINTS, CACHE_KEYS, LIMITS } from "@/constants/app";
 *
 * fetch(API_ENDPOINTS.USERS);
 * cache.get(CACHE_KEYS.USER_SESSION);
 * if (text.length > LIMITS.MAX_BIO_LENGTH) { ... }
 * ```
 *
 * @readonly
 * @since 1.0.0
 * @category Constants
 */

export {};
