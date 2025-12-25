/**
 * JSDoc Interface & Type Documentation Templates
 *
 * @fileoverview Templates for documenting interfaces, types, and enums.
 * Copy and adapt these templates for your project.
 *
 * @module templates/jsdoc/interface
 */

// ============================================================
// Basic Interface Template
// ============================================================

/**
 * Represents a user in the system.
 */
interface BasicUser {
	/** Unique identifier */
	id: string;
	/** User's email address */
	email: string;
	/** User's display name */
	name: string;
}

// ============================================================
// Comprehensive Interface Template
// ============================================================

/**
 * Represents a product in the e-commerce catalog.
 *
 * @description
 * Contains all information about a product including pricing,
 * inventory, and display details. Products can be physical items
 * or digital goods.
 *
 * @example Creating a product object
 * ```typescript
 * const product: Product = {
 *   id: "prod_123",
 *   sku: "WIDGET-001",
 *   name: "Premium Widget",
 *   description: "A high-quality widget for all your needs",
 *   price: {
 *     amount: 2999,
 *     currency: "USD",
 *   },
 *   inventory: {
 *     quantity: 100,
 *     warehouse: "US-WEST",
 *   },
 *   status: "active",
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * };
 * ```
 *
 * @example Type guard usage
 * ```typescript
 * function isDigitalProduct(product: Product): boolean {
 *   return product.type === "digital";
 * }
 * ```
 *
 * @see {@link ProductVariant} for product variations
 * @see {@link ProductCategory} for categorization
 *
 * @since 1.0.0
 * @category Commerce
 */
interface Product {
	// ============================================================
	// Identification
	// ============================================================

	/**
	 * Unique identifier for the product.
	 *
	 * @remarks
	 * Format: `prod_` followed by 24 alphanumeric characters.
	 * Generated automatically on creation.
	 *
	 * @example "prod_abc123def456ghi789jkl012"
	 */
	readonly id: string;

	/**
	 * Stock Keeping Unit - unique product code.
	 *
	 * @remarks
	 * Used for inventory management and external system integration.
	 * Must be unique across all products.
	 *
	 * @example "WIDGET-001-BLU-LG"
	 */
	sku: string;

	// ============================================================
	// Display Information
	// ============================================================

	/**
	 * Product display name.
	 *
	 * @remarks
	 * Shown to customers on product pages and in search results.
	 * Maximum 200 characters.
	 */
	name: string;

	/**
	 * Detailed product description.
	 *
	 * @remarks
	 * Supports Markdown formatting. Maximum 5000 characters.
	 * Displayed on the product detail page.
	 */
	description: string;

	/**
	 * Short product summary.
	 *
	 * @remarks
	 * Used in product cards and search results.
	 * Maximum 160 characters for SEO optimization.
	 */
	shortDescription?: string;

	/**
	 * Product images.
	 *
	 * @remarks
	 * First image is used as the primary/thumbnail image.
	 * Recommended dimensions: 1200x1200px minimum.
	 */
	images?: ProductImage[];

	// ============================================================
	// Pricing
	// ============================================================

	/**
	 * Product pricing information.
	 *
	 * @remarks
	 * Amount is in the smallest currency unit (e.g., cents for USD).
	 */
	price: {
		/**
		 * Price amount in smallest currency unit.
		 *
		 * @example 2999 (represents $29.99 USD)
		 */
		amount: number;

		/**
		 * ISO 4217 currency code.
		 *
		 * @example "USD", "EUR", "GBP"
		 */
		currency: CurrencyCode;

		/**
		 * Original price before discount.
		 *
		 * @remarks
		 * Only set if product is currently on sale.
		 */
		compareAtAmount?: number;
	};

	// ============================================================
	// Inventory
	// ============================================================

	/**
	 * Inventory information.
	 *
	 * @remarks
	 * Omit for digital products or products without inventory tracking.
	 */
	inventory?: {
		/** Available quantity */
		quantity: number;

		/** Warehouse location code */
		warehouse?: string;

		/**
		 * Whether to allow orders when out of stock.
		 *
		 * @defaultValue false
		 */
		allowBackorder?: boolean;

		/**
		 * Low stock threshold for alerts.
		 *
		 * @defaultValue 10
		 */
		lowStockThreshold?: number;
	};

	// ============================================================
	// Classification
	// ============================================================

	/**
	 * Product type.
	 *
	 * @defaultValue "physical"
	 */
	type?: "physical" | "digital" | "service";

	/**
	 * Product status.
	 *
	 * @remarks
	 * - `draft`: Not visible to customers
	 * - `active`: Published and available
	 * - `archived`: Hidden but data preserved
	 */
	status: ProductStatus;

	/**
	 * Category IDs for this product.
	 *
	 * @remarks
	 * A product can belong to multiple categories.
	 */
	categoryIds?: string[];

	/**
	 * Searchable tags.
	 *
	 * @example ["widget", "premium", "bestseller"]
	 */
	tags?: string[];

	// ============================================================
	// Metadata
	// ============================================================

	/**
	 * Custom metadata for integrations.
	 *
	 * @remarks
	 * Key-value pairs for storing additional data.
	 * Keys must be strings, values can be any JSON-serializable type.
	 *
	 * @example
	 * ```typescript
	 * metadata: {
	 *   externalId: "EXT-123",
	 *   supplier: "ACME Corp",
	 * }
	 * ```
	 */
	metadata?: Record<string, unknown>;

	// ============================================================
	// Timestamps
	// ============================================================

	/**
	 * When the product was created.
	 *
	 * @readonly
	 */
	readonly createdAt: Date;

	/**
	 * When the product was last updated.
	 *
	 * @readonly
	 */
	readonly updatedAt: Date;

	/**
	 * When the product was published (status changed to active).
	 *
	 * @remarks
	 * Null if product has never been published.
	 */
	publishedAt?: Date | null;
}

// ============================================================
// Nested Interface Template
// ============================================================

/**
 * Product image with multiple sizes.
 */
interface ProductImage {
	/** Unique image identifier */
	id: string;

	/** Original image URL */
	url: string;

	/** Alt text for accessibility */
	alt: string;

	/**
	 * Available image sizes.
	 *
	 * @remarks
	 * Pre-generated sizes for responsive images.
	 */
	sizes: {
		/** Thumbnail (150x150) */
		thumbnail: string;
		/** Small (300x300) */
		small: string;
		/** Medium (600x600) */
		medium: string;
		/** Large (1200x1200) */
		large: string;
	};

	/** Display order (0-indexed) */
	position: number;
}

// ============================================================
// Type Alias Templates
// ============================================================

/**
 * ISO 4217 currency code.
 *
 * @example "USD", "EUR", "GBP", "JPY"
 */
type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD";

/**
 * Product visibility status.
 *
 * @description
 * Controls whether and how a product appears in the storefront:
 * - `draft`: Only visible in admin panel
 * - `active`: Published and visible to customers
 * - `archived`: Hidden but preserved for historical orders
 */
type ProductStatus = "draft" | "active" | "archived";

/**
 * Callback function for async operations.
 *
 * @typeParam T - Type of the result data
 * @typeParam E - Type of the error (default: Error)
 *
 * @param error - Error if operation failed, null otherwise
 * @param result - Result data if successful, undefined on error
 *
 * @example
 * ```typescript
 * const callback: AsyncCallback<User> = (error, user) => {
 *   if (error) {
 *     console.error("Failed:", error.message);
 *     return;
 *   }
 *   console.log("User:", user.name);
 * };
 * ```
 */
type AsyncCallback<T, E = Error> = (
	error: E | null,
	result?: T,
) => void;

/**
 * Makes all properties of T optional and nullable.
 *
 * @typeParam T - The type to transform
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 * }
 *
 * // Result: { id?: string | null; name?: string | null; }
 * type PartialUser = NullablePartial<User>;
 * ```
 */
type NullablePartial<T> = {
	[P in keyof T]?: T[P] | null;
};

/**
 * Extracts the resolved type from a Promise.
 *
 * @typeParam T - The Promise type
 *
 * @example
 * ```typescript
 * type UserPromise = Promise<User>;
 * type ResolvedUser = Awaited<UserPromise>; // User
 * ```
 */
type Awaited<T> = T extends Promise<infer U> ? U : T;

// ============================================================
// Enum Template
// ============================================================

/**
 * HTTP status codes used in API responses.
 *
 * @description
 * Standard HTTP status codes grouped by category:
 * - 2xx: Success
 * - 4xx: Client errors
 * - 5xx: Server errors
 *
 * @example
 * ```typescript
 * function handleResponse(status: HttpStatus) {
 *   if (status === HttpStatus.OK) {
 *     console.log("Success!");
 *   } else if (status >= 400) {
 *     console.error("Error:", status);
 *   }
 * }
 * ```
 */
enum HttpStatus {
	// Success
	/** Request succeeded */
	OK = 200,
	/** Resource created */
	Created = 201,
	/** Request accepted for processing */
	Accepted = 202,
	/** No content to return */
	NoContent = 204,

	// Client Errors
	/** Invalid request syntax */
	BadRequest = 400,
	/** Authentication required */
	Unauthorized = 401,
	/** Payment required */
	PaymentRequired = 402,
	/** Access denied */
	Forbidden = 403,
	/** Resource not found */
	NotFound = 404,
	/** HTTP method not allowed */
	MethodNotAllowed = 405,
	/** Resource conflict */
	Conflict = 409,
	/** Resource no longer available */
	Gone = 410,
	/** Validation failed */
	UnprocessableEntity = 422,
	/** Too many requests */
	TooManyRequests = 429,

	// Server Errors
	/** Internal server error */
	InternalServerError = 500,
	/** Feature not implemented */
	NotImplemented = 501,
	/** Bad gateway */
	BadGateway = 502,
	/** Service unavailable */
	ServiceUnavailable = 503,
	/** Gateway timeout */
	GatewayTimeout = 504,
}

/**
 * User role levels in the system.
 *
 * @description
 * Roles are hierarchical - higher roles include all permissions
 * of lower roles:
 * - Guest < User < Moderator < Admin < SuperAdmin
 *
 * @remarks
 * Use string values for serialization compatibility with JSON
 * and database storage.
 */
enum UserRole {
	/** Unauthenticated visitor */
	Guest = "guest",
	/** Registered user */
	User = "user",
	/** Content moderator */
	Moderator = "moderator",
	/** Administrator */
	Admin = "admin",
	/** Super administrator with full access */
	SuperAdmin = "super_admin",
}

// ============================================================
// Const Object as Enum (Alternative Pattern)
// ============================================================

/**
 * API error codes.
 *
 * @description
 * Using const object instead of enum for better tree-shaking
 * and more flexible typing.
 *
 * @example
 * ```typescript
 * throw new ApiError(ErrorCode.VALIDATION_FAILED, "Invalid email");
 * ```
 *
 * @readonly
 */
const ErrorCode = {
	/** Validation error */
	VALIDATION_FAILED: "E_VALIDATION_FAILED",
	/** Resource not found */
	NOT_FOUND: "E_NOT_FOUND",
	/** Authentication failed */
	UNAUTHORIZED: "E_UNAUTHORIZED",
	/** Permission denied */
	FORBIDDEN: "E_FORBIDDEN",
	/** Rate limit exceeded */
	RATE_LIMITED: "E_RATE_LIMITED",
	/** Internal error */
	INTERNAL_ERROR: "E_INTERNAL_ERROR",
} as const;

/**
 * Type for ErrorCode values.
 *
 * @example
 * ```typescript
 * function handleError(code: ErrorCodeType) {
 *   switch (code) {
 *     case ErrorCode.NOT_FOUND:
 *       return "Resource not found";
 *     // ...
 *   }
 * }
 * ```
 */
type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// ============================================================
// Generic Interface Template
// ============================================================

/**
 * Paginated API response wrapper.
 *
 * @typeParam T - Type of items in the data array
 *
 * @description
 * Standard wrapper for paginated list endpoints.
 * Includes both the data and pagination metadata.
 *
 * @example
 * ```typescript
 * const response: PaginatedResponse<User> = {
 *   data: [{ id: "1", name: "Alice" }],
 *   pagination: {
 *     page: 1,
 *     pageSize: 20,
 *     totalItems: 100,
 *     totalPages: 5,
 *   },
 * };
 *
 * // Access items
 * response.data.forEach(user => console.log(user.name));
 *
 * // Check if more pages
 * if (response.pagination.page < response.pagination.totalPages) {
 *   // Load next page
 * }
 * ```
 */
interface PaginatedResponse<T> {
	/** Array of items for the current page */
	data: T[];

	/** Pagination metadata */
	pagination: {
		/** Current page number (1-indexed) */
		page: number;
		/** Number of items per page */
		pageSize: number;
		/** Total number of items across all pages */
		totalItems: number;
		/** Total number of pages */
		totalPages: number;
	};
}

/**
 * API response wrapper for single items or mutations.
 *
 * @typeParam T - Type of the response data
 *
 * @description
 * Standard wrapper for non-paginated responses.
 * Includes success status, data, and optional message.
 *
 * @example Success response
 * ```typescript
 * const response: ApiResponse<User> = {
 *   success: true,
 *   data: { id: "1", name: "Alice" },
 * };
 * ```
 *
 * @example Error response
 * ```typescript
 * const response: ApiResponse<never> = {
 *   success: false,
 *   error: {
 *     code: "E_NOT_FOUND",
 *     message: "User not found",
 *   },
 * };
 * ```
 */
interface ApiResponse<T> {
	/** Whether the request was successful */
	success: boolean;

	/** Response data (only present on success) */
	data?: T;

	/** Error details (only present on failure) */
	error?: {
		/** Machine-readable error code */
		code: string;
		/** Human-readable error message */
		message: string;
		/** Additional error details */
		details?: Record<string, unknown>;
	};

	/** Optional message for the client */
	message?: string;
}

// ============================================================
// Discriminated Union Template
// ============================================================

/**
 * Base event interface.
 *
 * @internal
 */
interface BaseEvent {
	/** Event timestamp */
	timestamp: Date;
	/** User who triggered the event */
	userId?: string;
}

/**
 * User login event.
 */
interface UserLoginEvent extends BaseEvent {
	/** Discriminant property */
	type: "user.login";
	/** Login-specific data */
	data: {
		/** Login method used */
		method: "password" | "oauth" | "magic_link";
		/** IP address */
		ip: string;
	};
}

/**
 * User logout event.
 */
interface UserLogoutEvent extends BaseEvent {
	/** Discriminant property */
	type: "user.logout";
	/** Logout-specific data */
	data: {
		/** Reason for logout */
		reason: "manual" | "session_expired" | "forced";
	};
}

/**
 * Order placed event.
 */
interface OrderPlacedEvent extends BaseEvent {
	/** Discriminant property */
	type: "order.placed";
	/** Order-specific data */
	data: {
		/** Order identifier */
		orderId: string;
		/** Order total in cents */
		totalAmount: number;
		/** Number of items */
		itemCount: number;
	};
}

/**
 * Union of all application events.
 *
 * @description
 * Discriminated union using the `type` property.
 * Use type guards or switch statements to narrow the type.
 *
 * @example Type narrowing with switch
 * ```typescript
 * function handleEvent(event: AppEvent) {
 *   switch (event.type) {
 *     case "user.login":
 *       console.log("Login method:", event.data.method);
 *       break;
 *     case "user.logout":
 *       console.log("Logout reason:", event.data.reason);
 *       break;
 *     case "order.placed":
 *       console.log("Order total:", event.data.totalAmount);
 *       break;
 *   }
 * }
 * ```
 */
type AppEvent = UserLoginEvent | UserLogoutEvent | OrderPlacedEvent;

export type {
	BasicUser,
	Product,
	ProductImage,
	CurrencyCode,
	ProductStatus,
	AsyncCallback,
	NullablePartial,
	Awaited,
	PaginatedResponse,
	ApiResponse,
	AppEvent,
	ErrorCodeType,
};

export { HttpStatus, UserRole, ErrorCode };
