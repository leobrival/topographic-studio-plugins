# TSDoc Standard Reference

TSDoc is Microsoft's standardized documentation format for TypeScript, designed to be parsed by tools.

## Overview

TSDoc builds on JSDoc but with stricter parsing rules and TypeScript-specific features. It's the standard used by:

- TypeDoc
- API Extractor
- VS Code IntelliSense
- TypeScript compiler

## Core Differences from JSDoc

| Feature | JSDoc | TSDoc |
|---------|-------|-------|
| Type annotations | `@param {string} name` | `@param name - description` |
| Optional params | `@param {string} [name]` | Inferred from TypeScript |
| Return type | `@returns {string}` | `@returns description` |
| Parser strictness | Lenient | Strict |
| Tool support | Documentation only | Code analysis tools |

## Standard Tags

### Block Tags (Start a block of content)

```typescript
/**
 * Brief summary line.
 *
 * @remarks
 * Additional detailed information that supplements the summary.
 * This can span multiple paragraphs.
 *
 * @param name - The user's display name
 *
 * @returns The formatted greeting string
 *
 * @throws {@link ValidationError}
 * Thrown if name is empty or contains invalid characters
 *
 * @example
 * Here's a simple example:
 * ```typescript
 * const greeting = greet("World");
 * console.log(greeting); // "Hello, World!"
 * ```
 *
 * @see {@link formatName} for name formatting
 *
 * @beta
 */
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

### Inline Tags (Used within text)

```typescript
/**
 * Similar to {@link Array.prototype.map | Array.map} but async.
 *
 * For implementation details, see {@link https://example.com | docs}.
 *
 * {@inheritDoc BaseClass.method}
 */
```

### Modifier Tags (Boolean flags)

```typescript
/**
 * @public - Part of public API
 * @internal - Internal implementation
 * @virtual - Can be overridden
 * @sealed - Cannot be overridden
 * @override - Overrides parent
 * @readonly - Cannot be modified
 * @alpha - Early development
 * @beta - Feature complete, may change
 * @experimental - Unstable API
 * @deprecated - Will be removed
 * @packageDocumentation - File-level doc
 * @eventProperty - Event declaration
 */
```

## Tag Reference

### @param

Documents parameters without type annotations (TypeScript provides types):

```typescript
/**
 * @param firstName - The user's first name
 * @param lastName - The user's last name (optional)
 * @param options - Configuration options
 */
function createUser(
  firstName: string,
  lastName?: string,
  options?: CreateOptions
): User {}
```

### @typeParam

Documents generic type parameters:

```typescript
/**
 * @typeParam T - The type of elements in the array
 * @typeParam U - The type of the mapped result
 */
function mapArray<T, U>(
  items: T[],
  mapper: (item: T) => U
): U[] {}
```

### @returns

Documents return value:

```typescript
/**
 * @returns The user object, or undefined if not found
 */
function findUser(id: string): User | undefined {}
```

### @throws

Documents exceptions with optional type:

```typescript
/**
 * @throws {@link ValidationError}
 * Thrown when input fails validation
 *
 * @throws {@link NetworkError}
 * Thrown when the API request fails
 */
async function submitForm(data: FormData): Promise<void> {}
```

### @example

Provides code examples:

```typescript
/**
 * @example
 * Basic usage:
 * ```typescript
 * const result = calculate(10, 20);
 * ```
 *
 * @example
 * With options:
 * ```typescript
 * const result = calculate(10, 20, { precision: 2 });
 * ```
 */
function calculate(a: number, b: number, options?: Options): number {}
```

### @remarks

Extended discussion:

```typescript
/**
 * Processes data asynchronously.
 *
 * @remarks
 * This method uses a worker pool for parallel processing.
 * The pool size is determined by the `WORKER_COUNT` environment
 * variable, defaulting to the number of CPU cores.
 *
 * Performance characteristics:
 * - Small datasets (< 1000 items): ~10ms
 * - Medium datasets (1000-10000): ~100ms
 * - Large datasets (> 10000): scales linearly
 */
async function processData(data: Data[]): Promise<Result[]> {}
```

### @see

Cross-references:

```typescript
/**
 * @see {@link RelatedClass} for similar functionality
 * @see {@link https://docs.example.com/api | API Documentation}
 * @see The user guide at `/docs/guide.md`
 */
```

### @defaultValue

Documents default values:

```typescript
interface Options {
  /**
   * Maximum retry attempts
   * @defaultValue 3
   */
  maxRetries?: number;

  /**
   * Request timeout in milliseconds
   * @defaultValue `30000`
   */
  timeout?: number;
}
```

### @deprecated

Marks deprecated APIs:

```typescript
/**
 * @deprecated Use {@link newMethod} instead.
 *
 * This method will be removed in version 3.0.
 *
 * @example Migration guide:
 * ```typescript
 * // Before
 * oldMethod(data);
 *
 * // After
 * newMethod(transformData(data));
 * ```
 */
function oldMethod(data: OldFormat): void {}
```

### @privateRemarks

Internal notes (stripped from output):

```typescript
/**
 * Validates user input.
 *
 * @privateRemarks
 * TODO: Add support for international phone numbers
 * See issue #123 for requirements
 *
 * Performance note: Current regex is O(n), consider
 * optimizing for very long strings.
 */
function validate(input: string): boolean {}
```

## Release Tags

TSDoc defines standard release tags for API stability:

### @alpha

```typescript
/**
 * @alpha
 *
 * This API is in early development.
 * Breaking changes are expected in every release.
 */
function experimentalFeature(): void {}
```

### @beta

```typescript
/**
 * @beta
 *
 * This API is feature-complete but may have bugs.
 * Breaking changes may occur before stable release.
 */
function newFeature(): void {}
```

### @public

```typescript
/**
 * @public
 *
 * This is part of the stable public API.
 * Breaking changes follow semantic versioning.
 */
function stableFeature(): void {}
```

### @internal

```typescript
/**
 * @internal
 *
 * This is an internal implementation detail.
 * Do not use directly - may change without notice.
 */
function internalHelper(): void {}
```

## Module Documentation

### @packageDocumentation

Must be first in file:

```typescript
/**
 * @packageDocumentation
 *
 * This module provides authentication utilities.
 *
 * @remarks
 * The main entry points are:
 * - {@link AuthService} - Main authentication service
 * - {@link useAuth} - React hook for auth state
 *
 * @example
 * ```typescript
 * import { AuthService } from '@myapp/auth';
 *
 * const auth = new AuthService(config);
 * await auth.login(credentials);
 * ```
 */

export * from './auth-service';
export * from './hooks';
```

## Inheritance Documentation

### @inheritDoc

Copies documentation from parent:

```typescript
interface IProcessor {
  /**
   * Processes the input data and returns results.
   *
   * @param data - Input data to process
   * @returns Processed results
   * @throws {@link ProcessingError} on invalid input
   */
  process(data: Input): Output;
}

class ConcreteProcessor implements IProcessor {
  /** {@inheritDoc IProcessor.process} */
  process(data: Input): Output {
    // Implementation
  }
}
```

### @override

Marks method overrides:

```typescript
class ChildClass extends ParentClass {
  /**
   * @override
   */
  public process(): void {
    super.process();
    // Additional logic
  }
}
```

## Declaration References

TSDoc uses a specific syntax for referencing declarations:

```typescript
/**
 * {@link ClassName} - Link to class
 * {@link ClassName.methodName} - Link to method
 * {@link ClassName.propertyName} - Link to property
 * {@link ClassName.(methodName:1)} - Link to overload
 * {@link module!exportName} - Link to export
 * {@link module#localName} - Link to local declaration
 */
```

### Examples

```typescript
/**
 * @see {@link Array.prototype.map} - Standard array method
 * @see {@link User.create} - Factory method
 * @see {@link @myorg/utils#formatDate} - External package
 */
```

## TSDoc Configuration

### tsdoc.json

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json",
  "extends": ["@microsoft/api-extractor/extends/tsdoc-base.json"],
  "noStandardTags": false,
  "tagDefinitions": [
    {
      "tagName": "@category",
      "syntaxKind": "block"
    },
    {
      "tagName": "@since",
      "syntaxKind": "block"
    }
  ],
  "supportForTags": {
    "@alpha": true,
    "@beta": true,
    "@defaultValue": true,
    "@deprecated": true,
    "@eventProperty": true,
    "@example": true,
    "@experimental": true,
    "@inheritDoc": true,
    "@internal": true,
    "@link": true,
    "@override": true,
    "@packageDocumentation": true,
    "@param": true,
    "@privateRemarks": true,
    "@public": true,
    "@readonly": true,
    "@remarks": true,
    "@returns": true,
    "@sealed": true,
    "@see": true,
    "@throws": true,
    "@typeParam": true,
    "@virtual": true
  }
}
```

## Best Practices

### 1. Use TypeScript for Types

```typescript
// BAD: Redundant type annotation
/**
 * @param {string} name - The name
 * @returns {number} The length
 */
function getLength(name: string): number {}

// GOOD: Let TypeScript handle types
/**
 * @param name - The name to measure
 * @returns The character count
 */
function getLength(name: string): number {}
```

### 2. Write for Humans and Tools

```typescript
/**
 * Fetches user data from the API.
 *
 * @param userId - The unique user identifier
 * @returns Promise resolving to the user data
 *
 * @throws {@link NotFoundError}
 * Thrown when no user exists with the given ID
 *
 * @example
 * ```typescript
 * const user = await fetchUser("user_123");
 * console.log(user.name);
 * ```
 */
async function fetchUser(userId: string): Promise<User> {}
```

### 3. Keep Summary Line Concise

```typescript
// BAD: Too verbose
/**
 * This function is responsible for calculating the total price of items
 * in the shopping cart by summing up individual item prices.
 */

// GOOD: Concise summary with details in @remarks
/**
 * Calculates shopping cart total.
 *
 * @remarks
 * Sums individual item prices and applies applicable discounts.
 */
```

### 4. Document the "Why"

```typescript
/**
 * Delays execution by the specified duration.
 *
 * @remarks
 * Uses `setTimeout` internally but returns a Promise for
 * cleaner async/await syntax. The delay is intentionally
 * imprecise - use `requestAnimationFrame` for frame-accurate timing.
 */
function delay(ms: number): Promise<void> {}
```
