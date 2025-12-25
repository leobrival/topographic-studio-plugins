/**
 * Comment Patterns and Best Practices
 *
 * @fileoverview Standard comment patterns for inline documentation.
 * These patterns explain the "why" behind code decisions.
 *
 * @module templates/comments/patterns
 */

// ============================================================
// PRINCIPLE: Comment the "WHY", not the "WHAT"
// ============================================================

// BAD: Describes what the code does (redundant)
// Increment counter by 1
// counter++;

// GOOD: Explains why this is necessary
// Counter must be incremented before the API call because
// the server uses it to detect duplicate requests
// counter++;

// ============================================================
// Business Logic Comments
// ============================================================

/**
 * Business Rule Documentation Pattern
 *
 * Use when implementing business rules that aren't obvious
 * from the code alone.
 */

// Per the SLA agreement (DOC-2024-001), premium users must
// receive response within 100ms. We use a dedicated fast path
// for users with subscription.tier === "premium"
function processRequest(user: User, request: Request) {
	if (user.subscription.tier === "premium") {
		// Fast path: skip validation queue, direct processing
		return processPremium(request);
	}
	return processStandard(request);
}

// Discount calculation follows the "best price guarantee" policy:
// 1. Apply promotional discount first
// 2. Then apply loyalty discount
// 3. Take the maximum discount (not cumulative)
// This ensures customers always get the best available price
function calculateDiscount(price: number, promoDiscount: number, loyaltyDiscount: number): number {
	const promoPrice = price * (1 - promoDiscount);
	const loyaltyPrice = price * (1 - loyaltyDiscount);
	return Math.min(promoPrice, loyaltyPrice);
}

// ============================================================
// Performance Comments
// ============================================================

/**
 * Performance Optimization Documentation Pattern
 *
 * Use when the code is optimized in non-obvious ways.
 */

// Using Map instead of Object for user lookup because:
// 1. O(1) lookup vs O(n) for large datasets
// 2. Preserves insertion order for consistent iteration
// 3. Better memory usage for 10k+ entries
// Benchmark: 50ms → 2ms for 50k users (see PERF-2024-03)
const userCache = new Map<string, User>();

// Pre-allocating array size to avoid resize operations.
// For 10k items, this reduces allocation time by ~40%
// Benchmark data: benchmarks/array-prealloc.ts
const results = new Array(items.length);

// Using bitwise OR for floor operation - 3x faster than Math.floor
// Only safe for positive numbers < 2^31
// Source: https://jsperf.com/bitwise-floor
const index = (value / step) | 0;

// ============================================================
// Workaround Comments
// ============================================================

/**
 * Workaround/Hack Documentation Pattern
 *
 * Use when implementing workarounds for bugs or limitations.
 */

// HACK: Safari doesn't fire 'change' event on date inputs when
// selecting via the native picker. Using 'input' event instead.
// Bug: https://bugs.webkit.org/show_bug.cgi?id=198856
// TODO: Remove when Safari fixes this (check quarterly)
dateInput.addEventListener("input", handleDateChange);

// WORKAROUND: React 18 StrictMode causes double-mount in development.
// Using ref to track if effect has already run.
// This is expected behavior, not a bug.
// See: https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development
const hasRun = useRef(false);
useEffect(() => {
	if (hasRun.current) return;
	hasRun.current = true;
	// ... actual effect code
}, []);

// HACK: Prisma doesn't support partial unique indexes.
// Using raw SQL in migration instead.
// Issue: https://github.com/prisma/prisma/issues/6974
// await prisma.$executeRaw`CREATE UNIQUE INDEX ...`

// ============================================================
// Warning Comments
// ============================================================

/**
 * Warning Documentation Pattern
 *
 * Use when code has non-obvious side effects or requirements.
 */

// WARNING: This function mutates the input array for performance.
// Clone the array first if you need to preserve the original:
// sortItems([...items]) instead of sortItems(items)
function sortItems(items: Item[]): Item[] {
	return items.sort((a, b) => a.priority - b.priority);
}

// WARNING: This method is not thread-safe. In concurrent environments,
// use the synchronized version: lockAndUpdate()
function updateSharedState(newValue: State): void {
	sharedState = newValue;
}

// WARNING: Rate limited to 100 requests/minute by the external API.
// Exceeding this will result in 429 errors and temporary ban.
// Use the queue system for bulk operations: queueApiCall()
async function callExternalApi(data: ApiPayload): Promise<ApiResponse> {
	return fetch(API_URL, { method: "POST", body: JSON.stringify(data) });
}

// ============================================================
// Algorithm Comments
// ============================================================

/**
 * Algorithm Documentation Pattern
 *
 * Use when implementing non-trivial algorithms.
 */

/**
 * Binary search implementation
 *
 * Algorithm:
 * 1. Start with the full array range [0, length-1]
 * 2. Calculate midpoint: mid = (low + high) / 2
 * 3. If arr[mid] === target, return mid
 * 4. If arr[mid] < target, search right half [mid+1, high]
 * 5. If arr[mid] > target, search left half [low, mid-1]
 * 6. Repeat until found or low > high (not found)
 *
 * Time: O(log n), Space: O(1)
 *
 * @param arr - Sorted array to search
 * @param target - Value to find
 * @returns Index of target, or -1 if not found
 */
function binarySearch(arr: number[], target: number): number {
	let low = 0;
	let high = arr.length - 1;

	while (low <= high) {
		// Using unsigned right shift to avoid integer overflow
		// when low + high exceeds MAX_SAFE_INTEGER
		const mid = (low + high) >>> 1;
		const midVal = arr[mid];

		if (midVal < target) {
			low = mid + 1;
		} else if (midVal > target) {
			high = mid - 1;
		} else {
			return mid; // Found
		}
	}

	return -1; // Not found
}

// ============================================================
// Security Comments
// ============================================================

/**
 * Security Documentation Pattern
 *
 * Use when code handles security-sensitive operations.
 */

// SECURITY: Using constant-time comparison to prevent timing attacks.
// Regular string comparison (===) is vulnerable because it returns
// early on first mismatch, leaking information about the secret.
function secureCompare(a: string, b: string): boolean {
	if (a.length !== b.length) return false;

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		// XOR accumulates differences without early return
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

// SECURITY: Sanitizing user input to prevent XSS attacks.
// This runs on all user-generated content before rendering.
// Using DOMPurify library which is OWASP-recommended.
function sanitizeHtml(dirty: string): string {
	return DOMPurify.sanitize(dirty, {
		// Allow only safe tags
		ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
		// Allow only href on links, with URL validation
		ALLOWED_ATTR: ["href"],
	});
}

// SECURITY: Rate limiting login attempts to prevent brute force.
// After 5 failed attempts, account is locked for 15 minutes.
// Implements exponential backoff: 1min, 2min, 4min, 8min, 15min
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// ============================================================
// Dependency Comments
// ============================================================

/**
 * Dependency Documentation Pattern
 *
 * Use when code depends on specific external behavior.
 */

// This relies on Prisma's automatic JSON serialization for the
// `metadata` field. If switching ORMs, need to manually serialize.
// Prisma docs: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields
const user = await prisma.user.create({
	data: {
		email,
		metadata: { preferences: defaultPrefs }, // Auto-serialized
	},
});

// Depends on Next.js App Router's automatic request deduplication.
// Multiple calls to this function in the same request are cached.
// If migrating to a different framework, add manual caching.
// Docs: https://nextjs.org/docs/app/building-your-application/caching
async function getCurrentUser(): Promise<User> {
	return getSession().then((s) => s.user);
}

// ============================================================
// Temporal Comments (Why Now)
// ============================================================

/**
 * Temporal Context Documentation Pattern
 *
 * Use when timing or ordering is important.
 */

// Must initialize analytics before rendering because:
// 1. Page view events need to capture initial load
// 2. User identification must happen before any events
// 3. Feature flags are loaded synchronously on init
await initAnalytics();
await identifyUser(userId);
renderApp();

// Delay is necessary to allow DOM to fully paint before measuring.
// requestAnimationFrame guarantees we're in the next paint cycle.
// Without this, measurements can be off by up to 16ms worth of layout.
requestAnimationFrame(() => {
	requestAnimationFrame(() => {
		measureLayout();
	});
});

// ============================================================
// Type Definitions for Examples
// ============================================================

interface User {
	id: string;
	subscription: { tier: "free" | "premium" };
}

interface Request {
	data: unknown;
}

interface Item {
	id: string;
	priority: number;
}

interface State {
	value: unknown;
}

interface ApiPayload {
	action: string;
}

interface ApiResponse {
	success: boolean;
}

declare function processPremium(req: Request): unknown;
declare function processStandard(req: Request): unknown;
declare function handleDateChange(e: Event): void;
declare const dateInput: HTMLInputElement;
declare const DOMPurify: { sanitize: (html: string, options: unknown) => string };
declare const prisma: { user: { create: (data: unknown) => Promise<unknown> } };
declare function getSession(): Promise<{ user: User }>;
declare function initAnalytics(): Promise<void>;
declare function identifyUser(id: string): Promise<void>;
declare function renderApp(): void;
declare function measureLayout(): void;
declare let sharedState: State;
declare const API_URL: string;
declare const defaultPrefs: unknown;
declare const email: string;
declare const userId: string;

export {
	calculateDiscount,
	binarySearch,
	secureCompare,
	sanitizeHtml,
	processRequest,
	sortItems,
	updateSharedState,
	callExternalApi,
	getCurrentUser,
	userCache,
};
