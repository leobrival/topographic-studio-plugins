/**
 * JSDoc Function Documentation Templates
 *
 * @fileoverview Templates for documenting functions with JSDoc/TSDoc.
 * Copy and adapt these templates for your project.
 *
 * @module templates/jsdoc/function
 */

// ============================================================
// Basic Function Template
// ============================================================

/**
 * Brief description of what the function does.
 *
 * @param paramName - Description of the parameter
 * @returns Description of the return value
 *
 * @example
 * ```typescript
 * const result = functionName(value);
 * ```
 */
function basicTemplate(paramName: string): string {
	return paramName;
}

// ============================================================
// Comprehensive Function Template
// ============================================================

/**
 * Brief one-line description of the function.
 *
 * @description
 * Detailed description that explains:
 * - What the function does
 * - When to use it
 * - Important behavior details
 *
 * @param param1 - Description of first parameter
 * @param param2 - Description of second parameter (optional)
 * @param options - Configuration options
 * @param options.timeout - Request timeout in milliseconds
 * @param options.retries - Number of retry attempts
 *
 * @returns Description of return value and its structure
 *
 * @throws {ValidationError} When param1 is empty or invalid
 * @throws {NetworkError} When the request fails after all retries
 *
 * @example Basic usage
 * ```typescript
 * const result = comprehensiveFunction("value", 42);
 * console.log(result); // Expected output
 * ```
 *
 * @example With options
 * ```typescript
 * const result = comprehensiveFunction("value", 42, {
 *   timeout: 5000,
 *   retries: 3,
 * });
 * ```
 *
 * @example Error handling
 * ```typescript
 * try {
 *   const result = comprehensiveFunction("value", 42);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error("Invalid input:", error.message);
 *   }
 * }
 * ```
 *
 * @see {@link relatedFunction} for related functionality
 * @see {@link https://docs.example.com/api} External documentation
 *
 * @since 1.0.0
 * @category CategoryName
 */
function comprehensiveFunction(
	param1: string,
	param2?: number,
	options?: { timeout?: number; retries?: number },
): Result {
	// Implementation
	return {} as Result;
}

// ============================================================
// Async Function Template
// ============================================================

/**
 * Brief description of the async operation.
 *
 * @description
 * Performs an asynchronous operation with the following steps:
 * 1. Validates input parameters
 * 2. Makes the API request
 * 3. Processes and returns the response
 *
 * @param id - Unique identifier for the resource
 * @param signal - Optional AbortSignal for cancellation
 *
 * @returns Promise resolving to the fetched data
 *
 * @throws {NotFoundError} When resource with given ID doesn't exist
 * @throws {AbortError} When the request is cancelled via signal
 * @throws {NetworkError} When the network request fails
 *
 * @example
 * ```typescript
 * // Basic usage
 * const data = await fetchResource("res_123");
 *
 * // With cancellation
 * const controller = new AbortController();
 * const data = await fetchResource("res_123", controller.signal);
 *
 * // Cancel if needed
 * controller.abort();
 * ```
 *
 * @remarks
 * This function automatically retries failed requests up to 3 times
 * with exponential backoff. The retry behavior can be configured
 * globally via the `setRetryPolicy` function.
 *
 * @since 1.2.0
 */
async function asyncFunctionTemplate(
	id: string,
	signal?: AbortSignal,
): Promise<ResourceData> {
	// Implementation
	return {} as ResourceData;
}

// ============================================================
// Generic Function Template
// ============================================================

/**
 * Brief description of the generic function.
 *
 * @typeParam T - The type of items in the array
 * @typeParam K - The key to extract from each item
 *
 * @param items - Array of items to process
 * @param key - Property key to extract
 *
 * @returns Array of extracted values
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 * }
 *
 * const users: User[] = [
 *   { id: "1", name: "Alice" },
 *   { id: "2", name: "Bob" },
 * ];
 *
 * const names = pluck(users, "name");
 * // Result: ["Alice", "Bob"]
 * ```
 */
function genericFunctionTemplate<T, K extends keyof T>(
	items: T[],
	key: K,
): T[K][] {
	return items.map((item) => item[key]);
}

// ============================================================
// Callback Function Template
// ============================================================

/**
 * Brief description of what the callback-based function does.
 *
 * @param data - Input data to process
 * @param callback - Function called with the result
 * @param callback.error - Error if operation failed, null otherwise
 * @param callback.result - Result data if successful, undefined on error
 *
 * @example
 * ```typescript
 * processWithCallback(inputData, (error, result) => {
 *   if (error) {
 *     console.error("Processing failed:", error);
 *     return;
 *   }
 *   console.log("Result:", result);
 * });
 * ```
 *
 * @deprecated Use `processAsync` instead for Promise-based API
 * @see {@link processAsync} for the modern async/await version
 */
function callbackFunctionTemplate(
	data: InputData,
	callback: (error: Error | null, result?: OutputData) => void,
): void {
	// Implementation
}

// ============================================================
// Factory Function Template
// ============================================================

/**
 * Creates a configured instance of ServiceClient.
 *
 * @description
 * Factory function that creates and configures a ServiceClient
 * with the provided options. Use this instead of direct instantiation
 * to ensure proper initialization.
 *
 * @param config - Configuration options for the client
 * @param config.apiKey - API key for authentication
 * @param config.baseUrl - Base URL for API requests
 * @param config.timeout - Request timeout in milliseconds (default: 30000)
 *
 * @returns Configured ServiceClient instance
 *
 * @example
 * ```typescript
 * const client = createServiceClient({
 *   apiKey: process.env.API_KEY,
 *   baseUrl: "https://api.example.com",
 *   timeout: 5000,
 * });
 *
 * const result = await client.request("/endpoint");
 * ```
 *
 * @since 2.0.0
 */
function createServiceClient(config: ServiceConfig): ServiceClient {
	// Implementation
	return {} as ServiceClient;
}

// ============================================================
// Overloaded Function Template
// ============================================================

/**
 * Formats a value as a string.
 *
 * @param value - Number to format
 * @returns Formatted number string
 */
function format(value: number): string;

/**
 * Formats a date as a string.
 *
 * @param value - Date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
function format(value: Date, options?: FormatOptions): string;

/**
 * Formats a value as a string.
 *
 * @description
 * Overloaded function that formats different types of values.
 * The output format depends on the input type:
 * - Numbers: Formatted with locale-specific separators
 * - Dates: Formatted according to options or default locale
 *
 * @param value - Value to format (number or Date)
 * @param options - Optional formatting options (for Date only)
 *
 * @returns Formatted string representation
 *
 * @example
 * ```typescript
 * format(1234567);        // "1,234,567"
 * format(new Date());     // "January 1, 2024"
 * format(new Date(), { style: "short" }); // "1/1/24"
 * ```
 */
function format(
	value: number | Date,
	options?: FormatOptions,
): string {
	// Implementation
	return "";
}

// ============================================================
// Pure Function Template (Functional Programming)
// ============================================================

/**
 * Composes multiple functions into a single function.
 *
 * @description
 * Creates a new function that applies the given functions from right to left.
 * This is a pure function with no side effects.
 *
 * @typeParam T - The input and output type (must be the same)
 *
 * @param fns - Functions to compose (applied right to left)
 *
 * @returns A new function that is the composition of all input functions
 *
 * @example
 * ```typescript
 * const addOne = (x: number) => x + 1;
 * const double = (x: number) => x * 2;
 * const square = (x: number) => x * x;
 *
 * const composed = compose(addOne, double, square);
 * composed(3); // addOne(double(square(3))) = addOne(double(9)) = addOne(18) = 19
 * ```
 *
 * @remarks
 * This is a pure function - it has no side effects and always returns
 * the same output for the same input.
 *
 * @see {@link pipe} for left-to-right composition
 */
function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
	return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

// ============================================================
// Type Definitions for Examples
// ============================================================

interface Result {
	success: boolean;
	data?: unknown;
}

interface ResourceData {
	id: string;
	name: string;
}

interface InputData {
	value: string;
}

interface OutputData {
	processed: string;
}

interface ServiceConfig {
	apiKey: string;
	baseUrl: string;
	timeout?: number;
}

interface ServiceClient {
	request(endpoint: string): Promise<unknown>;
}

interface FormatOptions {
	style?: "short" | "medium" | "long";
	locale?: string;
}

export {
	basicTemplate,
	comprehensiveFunction,
	asyncFunctionTemplate,
	genericFunctionTemplate,
	callbackFunctionTemplate,
	createServiceClient,
	format,
	compose,
};
