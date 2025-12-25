---
name: code-documentation
description: Generate comprehensive JSDoc documentation and inline comments for TypeScript/JavaScript code. Use when users need API documentation, function documentation, module headers, type definitions, or internal developer documentation. Covers TSDoc, JSDoc, and best practices for maintainable code comments.
---

# Code Documentation

Complete documentation toolkit for TypeScript/JavaScript projects: JSDoc, TSDoc, inline comments, and documentation generation.

## Decision Tree

```
User request → What type of documentation?
    │
    ├─ Function/Method Documentation
    │   ├─ JSDoc → Standard JavaScript documentation
    │   ├─ TSDoc → TypeScript-enhanced documentation
    │   └─ Inline comments → Logic explanation
    │
    ├─ Module/File Documentation
    │   ├─ File header → Purpose, author, license
    │   ├─ Module overview → Architecture, exports
    │   └─ Dependency notes → Why each import
    │
    ├─ Type Documentation
    │   ├─ Interface docs → Property descriptions
    │   ├─ Type alias docs → Purpose and usage
    │   └─ Enum docs → Value explanations
    │
    ├─ Class Documentation
    │   ├─ Class overview → Purpose, responsibilities
    │   ├─ Constructor docs → Parameters, initialization
    │   └─ Method docs → Behavior, side effects
    │
    └─ Code Comments
        ├─ TODO/FIXME → Task tracking
        ├─ HACK/WARNING → Technical debt
        └─ Logic comments → Why, not what
```

## Documentation Standards

- **JSDoc**: Standard for JavaScript projects
- **TSDoc**: Microsoft standard for TypeScript
- **Inline Comments**: Explain "why", not "what"
- **File Headers**: Module purpose and metadata

## Quick Start

### Function Documentation (JSDoc/TSDoc)

```typescript
/**
 * Calculates the total price including tax and discounts.
 *
 * @description Applies discount first, then calculates tax on the discounted amount.
 * Tax is calculated based on the user's billing address country.
 *
 * @param items - Array of cart items with quantity and unit price
 * @param discount - Discount percentage (0-100)
 * @param taxRate - Tax rate as decimal (e.g., 0.20 for 20%)
 * @returns The final price rounded to 2 decimal places
 *
 * @throws {ValidationError} If discount is negative or greater than 100
 * @throws {EmptyCartError} If items array is empty
 *
 * @example
 * ```typescript
 * const total = calculateTotal(
 *   [{ quantity: 2, unitPrice: 50 }],
 *   10, // 10% discount
 *   0.20 // 20% tax
 * );
 * // Returns: 108.00 (100 - 10% = 90, + 20% tax = 108)
 * ```
 *
 * @see {@link applyDiscount} for discount logic
 * @see {@link calculateTax} for tax calculation
 *
 * @since 1.2.0
 * @category Pricing
 */
function calculateTotal(
  items: CartItem[],
  discount: number,
  taxRate: number
): number {
  // Implementation
}
```

### Interface Documentation

```typescript
/**
 * Represents a user in the system.
 *
 * @description Contains all user profile information and authentication status.
 * Used throughout the application for user-related operations.
 *
 * @example
 * ```typescript
 * const user: User = {
 *   id: "usr_123",
 *   email: "user@example.com",
 *   profile: { firstName: "John", lastName: "Doe" },
 *   createdAt: new Date(),
 * };
 * ```
 */
interface User {
  /** Unique identifier (format: usr_xxxxx) */
  id: string;

  /** User's email address (validated, unique) */
  email: string;

  /** User profile information */
  profile: {
    /** User's first name */
    firstName: string;
    /** User's last name */
    lastName: string;
    /** Optional avatar URL */
    avatarUrl?: string;
  };

  /** Account creation timestamp */
  createdAt: Date;

  /** Last login timestamp (null if never logged in) */
  lastLoginAt?: Date | null;
}
```

### File Header

```typescript
/**
 * @fileoverview User authentication service
 *
 * Handles all authentication flows including:
 * - Email/password login
 * - OAuth providers (Google, GitHub)
 * - Session management
 * - Token refresh
 *
 * @module services/auth
 * @requires @/lib/prisma - Database client
 * @requires @/lib/jwt - JWT utilities
 *
 * @example
 * ```typescript
 * import { AuthService } from "@/services/auth";
 *
 * const auth = new AuthService();
 * const session = await auth.login(email, password);
 * ```
 *
 * @author Development Team
 * @since 1.0.0
 * @license MIT
 */
```

### Inline Comments Best Practices

```typescript
// BAD: Describes what the code does (obvious)
// Loop through users and filter active ones
const activeUsers = users.filter((u) => u.isActive);

// GOOD: Explains why this approach was chosen
// Filter in memory instead of DB query because the user count
// is always < 100 and this avoids an additional round trip
const activeUsers = users.filter((u) => u.isActive);

// GOOD: Documents business logic
// Users inactive for 90+ days are considered churned per
// the retention policy defined in RETENTION.md
const churnedUsers = users.filter(
  (u) => daysSinceLastLogin(u) > 90
);

// GOOD: Warns about non-obvious behavior
// WARNING: This mutates the original array for performance.
// Clone the array first if you need to preserve it.
sortInPlace(items);

// GOOD: Explains workaround
// HACK: Safari doesn't support requestIdleCallback, so we
// polyfill with setTimeout. Remove when Safari adds support.
// Tracking: https://bugs.webkit.org/show_bug.cgi?id=164193
const scheduleIdle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1));
```

## Asset Structure

```
assets/
├─ jsdoc/
│   ├─ function-template.ts    # Function documentation template
│   ├─ class-template.ts       # Class documentation template
│   ├─ interface-template.ts   # Interface/type documentation
│   └─ file-header.ts          # File header template
├─ comments/
│   ├─ comment-patterns.ts     # Standard comment patterns
│   ├─ todo-format.ts          # TODO/FIXME conventions
│   └─ section-markers.ts      # Code section markers
└─ config/
    ├─ jsdoc.json              # JSDoc configuration
    └─ typedoc.json            # TypeDoc configuration
```

## JSDoc Tags Reference

| Tag | Purpose | Example |
|-----|---------|---------|
| `@param` | Parameter description | `@param name - User's name` |
| `@returns` | Return value description | `@returns The calculated total` |
| `@throws` | Exception documentation | `@throws {Error} If invalid` |
| `@example` | Usage example | `@example \`\`\`ts code \`\`\`` |
| `@see` | Cross-reference | `@see {@link otherFunc}` |
| `@since` | Version introduced | `@since 1.2.0` |
| `@deprecated` | Deprecation notice | `@deprecated Use newFunc instead` |
| `@category` | Group in docs | `@category Utilities` |
| `@internal` | Internal API marker | `@internal` |
| `@alpha`/`@beta` | Stability marker | `@beta` |
| `@readonly` | Immutable property | `@readonly` |
| `@override` | Method override | `@override` |
| `@virtual` | Can be overridden | `@virtual` |
| `@sealed` | Cannot be overridden | `@sealed` |
| `@typeParam` | Generic parameter | `@typeParam T - Item type` |
| `@defaultValue` | Default value | `@defaultValue 100` |
| `@remarks` | Additional notes | `@remarks Thread-safe` |
| `@privateRemarks` | Internal notes | `@privateRemarks TODO: optimize` |

## Comment Conventions

### Standard Comment Tags

```typescript
// TODO: Task to be completed
// TODO(username): Assigned task
// TODO(#123): Linked to issue

// FIXME: Known bug that needs fixing
// FIXME(urgent): High priority fix

// HACK: Temporary workaround
// HACK(browser): Browser-specific hack

// WARNING: Important caveat
// NOTE: Important information
// REVIEW: Needs code review

// OPTIMIZE: Performance improvement needed
// REFACTOR: Code quality improvement needed

// DEPRECATED: Will be removed
// @deprecated Use newFunction() instead
```

### Section Markers

```typescript
// ============================================================
// Public API
// ============================================================

// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

// #region Authentication
// ... code ...
// #endregion

/* ************************************************************
 * SECTION: Database Operations
 * Description: All database-related functions
 ************************************************************ */
```

## Reference Files

- **JSDoc Guide**: See [references/jsdoc-guide.md](references/jsdoc-guide.md)
- **TSDoc Standard**: See [references/tsdoc-standard.md](references/tsdoc-standard.md)
- **Comment Best Practices**: See [references/comment-practices.md](references/comment-practices.md)
- **Documentation Generation**: See [references/doc-generation.md](references/doc-generation.md)

## Core Principles

1. **Document "why", not "what"**: Code shows what, comments explain why
2. **Keep docs close to code**: JSDoc above functions, inline where relevant
3. **Use examples liberally**: Real usage examples are invaluable
4. **Document edge cases**: What happens with null, empty, or invalid input?
5. **Mark stability**: Use @alpha, @beta, @deprecated appropriately
6. **Cross-reference**: Link related functions with @see
7. **Version tracking**: Use @since for API changes
8. **Consistent formatting**: Follow project conventions

## Best Practices

1. **Every public API should have JSDoc**: Functions, classes, interfaces exported from modules
2. **Document parameters and returns**: What they represent, not just their type
3. **Include at least one @example**: Show common usage patterns
4. **Document thrown exceptions**: What conditions cause errors
5. **Explain complex algorithms**: Step-by-step in comments or @remarks
6. **Keep comments up-to-date**: Outdated comments are worse than none
7. **Use TODO with context**: Include issue numbers or deadlines
8. **Prefer self-documenting code**: Clear names reduce comment needs
