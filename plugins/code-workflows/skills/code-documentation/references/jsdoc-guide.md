# JSDoc Complete Guide

Comprehensive guide to JSDoc documentation for JavaScript and TypeScript projects.

## Overview

JSDoc is a documentation standard that uses special comments to describe code. These comments can be:

- Extracted to generate documentation websites
- Used by IDEs for intellisense and type checking
- Read by developers for understanding code

## Basic Syntax

JSDoc comments start with `/**` and end with `*/`:

```javascript
/**
 * This is a JSDoc comment.
 * It can span multiple lines.
 */
```

## Essential Tags

### @param

Documents function parameters:

```typescript
/**
 * @param name - The user's name
 * @param age - The user's age in years
 * @param options - Configuration options
 * @param options.notify - Whether to send notification
 */
function createUser(
  name: string,
  age: number,
  options?: { notify?: boolean }
) {}
```

### @returns / @return

Documents return values:

```typescript
/**
 * @returns The user's full name
 */
function getFullName(): string {}

/**
 * @returns Object containing user data
 * @returns.id - Unique identifier
 * @returns.name - Display name
 */
function getUser(): { id: string; name: string } {}
```

### @throws / @exception

Documents exceptions:

```typescript
/**
 * @throws {ValidationError} When email format is invalid
 * @throws {DuplicateError} When email already exists
 */
function registerUser(email: string) {}
```

### @example

Provides usage examples:

```typescript
/**
 * @example Basic usage
 * ```typescript
 * const sum = add(2, 3);
 * console.log(sum); // 5
 * ```
 *
 * @example With negative numbers
 * ```typescript
 * const result = add(-1, 5);
 * console.log(result); // 4
 * ```
 */
function add(a: number, b: number): number {}
```

### @see

Cross-references related code:

```typescript
/**
 * @see {@link subtract} for subtraction
 * @see {@link https://example.com/docs} External documentation
 * @see OtherClass for related functionality
 */
function add(a: number, b: number): number {}
```

### @since

Documents version introduced:

```typescript
/**
 * @since 1.0.0
 */
function legacyMethod() {}

/**
 * @since 2.0.0 Added support for async operations
 */
async function modernMethod() {}
```

### @deprecated

Marks deprecated code:

```typescript
/**
 * @deprecated Use {@link newMethod} instead. Will be removed in v3.0.
 */
function oldMethod() {}
```

## Type Tags

### @type

Specifies variable types:

```typescript
/**
 * @type {string}
 */
let name;

/**
 * @type {Array<User>}
 */
let users;

/**
 * @type {(a: number, b: number) => number}
 */
let calculator;
```

### @typedef

Creates custom types:

```typescript
/**
 * @typedef {Object} User
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} [email] - Optional email address
 */

/**
 * @param {User} user
 */
function processUser(user) {}
```

### @callback

Documents callback types:

```typescript
/**
 * @callback ErrorHandler
 * @param {Error} error - The error that occurred
 * @param {string} context - Where the error occurred
 * @returns {void}
 */

/**
 * @param {ErrorHandler} handler
 */
function setErrorHandler(handler) {}
```

### @template / @typeParam

Documents generic type parameters:

```typescript
/**
 * @template T - The type of items in the array
 * @param {T[]} items - Array of items
 * @returns {T | undefined} First item or undefined
 */
function first(items) {}

/**
 * @typeParam K - Key type
 * @typeParam V - Value type
 */
class Map<K, V> {}
```

## Organization Tags

### @category

Groups items in documentation:

```typescript
/**
 * @category Authentication
 */
function login() {}

/**
 * @category Authentication
 */
function logout() {}

/**
 * @category User Management
 */
function createUser() {}
```

### @module / @fileoverview

Documents modules/files:

```typescript
/**
 * @fileoverview User authentication utilities
 * @module auth
 */

/**
 * @packageDocumentation
 * @module @myorg/auth
 */
```

### @namespace

Groups related items:

```typescript
/**
 * @namespace Utils
 */

/**
 * @memberof Utils
 */
function formatDate() {}
```

## Access Modifiers

### @public, @private, @protected

```typescript
class Service {
  /**
   * @public
   */
  getData() {}

  /**
   * @private
   */
  internalMethod() {}

  /**
   * @protected
   */
  helperMethod() {}
}
```

### @internal

Marks internal APIs not for public use:

```typescript
/**
 * @internal
 * This is for internal use only and may change without notice.
 */
function internalHelper() {}
```

### @readonly

Marks immutable properties:

```typescript
class Config {
  /**
   * @readonly
   */
  version = "1.0.0";
}
```

## Class Documentation

### @class / @constructor

```typescript
/**
 * Represents a user in the system.
 *
 * @class
 * @example
 * ```typescript
 * const user = new User("John", "john@example.com");
 * ```
 */
class User {
  /**
   * Creates a new User instance.
   *
   * @constructor
   * @param {string} name - The user's name
   * @param {string} email - The user's email
   */
  constructor(name, email) {}
}
```

### @extends / @augments

Documents inheritance:

```typescript
/**
 * @extends {BaseService}
 */
class UserService extends BaseService {}

/**
 * @augments EventEmitter
 */
class NotificationService extends EventEmitter {}
```

### @implements

Documents interface implementation:

```typescript
/**
 * @implements {Serializable}
 * @implements {Comparable}
 */
class User implements Serializable, Comparable {}
```

### @override

Documents method overrides:

```typescript
class Child extends Parent {
  /**
   * @override
   */
  process() {}
}
```

### @abstract

Marks abstract members:

```typescript
/**
 * @abstract
 */
class BaseHandler {
  /**
   * @abstract
   */
  handle() {}
}
```

## Advanced Tags

### @description

Provides detailed description:

```typescript
/**
 * @description
 * This function performs a complex calculation
 * that takes into account multiple factors:
 *
 * 1. Base value from input
 * 2. Modifier from configuration
 * 3. Adjustment based on user preferences
 */
function calculate() {}
```

### @remarks

Additional notes:

```typescript
/**
 * Processes the data.
 *
 * @remarks
 * This function is thread-safe and can be called
 * from multiple concurrent operations.
 */
function process() {}
```

### @privateRemarks

Internal notes (not published):

```typescript
/**
 * @privateRemarks
 * TODO: Optimize this for large datasets
 * Consider using streaming approach
 */
function processLargeData() {}
```

### @defaultValue

Documents default values:

```typescript
/**
 * @param timeout - Request timeout
 * @defaultValue 5000
 */
function fetch(url: string, timeout = 5000) {}

interface Options {
  /**
   * Enable debug mode
   * @defaultValue false
   */
  debug?: boolean;
}
```

### @alpha / @beta

Marks API stability:

```typescript
/**
 * @alpha
 * This API is in early development and will change.
 */
function experimentalFeature() {}

/**
 * @beta
 * This API is feature-complete but may have bugs.
 */
function newFeature() {}
```

### @virtual / @sealed

Inheritance hints:

```typescript
class Base {
  /**
   * @virtual
   * Can be overridden by subclasses.
   */
  process() {}

  /**
   * @sealed
   * Should not be overridden.
   */
  validate() {}
}
```

## Linking

### @link

Creates hyperlinks:

```typescript
/**
 * Similar to {@link Array.map} but with async support.
 *
 * See {@link https://example.com/docs | the documentation}
 * for more information.
 *
 * Works with {@link User} objects.
 */
function asyncMap() {}
```

### @linkcode

Links with code formatting:

```typescript
/**
 * Uses the same algorithm as {@linkcode sortItems}.
 */
function sortUsers() {}
```

### @inheritDoc

Inherits documentation:

```typescript
interface Base {
  /**
   * Processes the input data.
   * @param data - Data to process
   * @returns Processed result
   */
  process(data: unknown): unknown;
}

class Implementation implements Base {
  /** @inheritDoc */
  process(data: unknown): unknown {}
}
```

## Best Practices

### Do

1. **Document public APIs**: Every exported function, class, and type
2. **Include examples**: Show common usage patterns
3. **Document exceptions**: What can go wrong
4. **Use consistent style**: Same format throughout project
5. **Keep docs near code**: JSDoc directly above declarations
6. **Update with code**: Documentation becomes stale quickly

### Don't

1. **State the obvious**: Don't document what's clear from types
2. **Duplicate type info**: TypeScript already provides types
3. **Write novels**: Keep it concise and useful
4. **Forget to update**: Outdated docs are worse than none
5. **Over-document internals**: Focus on public APIs

### Example: Over-documented (Bad)

```typescript
/**
 * The name variable stores the user's name as a string.
 * @type {string}
 */
const name: string = "John";

/**
 * Add function adds two numbers together.
 * @param a - The first number to add
 * @param b - The second number to add
 * @returns The sum of a and b
 */
function add(a: number, b: number): number {
  return a + b;
}
```

### Example: Well-documented (Good)

```typescript
const name = "John";

/**
 * Adds two numbers with overflow protection.
 *
 * @throws {RangeError} If result exceeds MAX_SAFE_INTEGER
 *
 * @example
 * ```typescript
 * add(Number.MAX_SAFE_INTEGER, 1); // throws RangeError
 * ```
 */
function add(a: number, b: number): number {
  const result = a + b;
  if (!Number.isSafeInteger(result)) {
    throw new RangeError("Result exceeds safe integer range");
  }
  return result;
}
```

## Tool Configuration

### JSDoc with TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "stripInternal": true
  }
}
```

### ESLint JSDoc Plugin

```json
// .eslintrc.json
{
  "plugins": ["jsdoc"],
  "rules": {
    "jsdoc/require-description": "warn",
    "jsdoc/require-param-description": "warn",
    "jsdoc/require-returns-description": "warn",
    "jsdoc/check-alignment": "error",
    "jsdoc/check-param-names": "error"
  }
}
```
