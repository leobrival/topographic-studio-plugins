/**
 * TODO/FIXME Comment Conventions
 *
 * @fileoverview Standard formats for task-tracking comments.
 * Consistent formatting enables automated tooling and searchability.
 *
 * @module templates/comments/todo-format
 */

// ============================================================
// TODO Format Standards
// ============================================================

/**
 * Basic TODO Format
 *
 * Pattern: TODO: <description>
 *
 * Use for general tasks that need to be done.
 */

// TODO: Add input validation for email field
// TODO: Implement retry logic for failed API calls
// TODO: Add unit tests for edge cases

/**
 * TODO with Assignee
 *
 * Pattern: TODO(<username>): <description>
 *
 * Use when a specific person should handle the task.
 */

// TODO(john): Review this algorithm for performance
// TODO(sarah): Add documentation for this module
// TODO(@frontend-team): Migrate to new design system

/**
 * TODO with Issue Reference
 *
 * Pattern: TODO(#<issue>): <description>
 *
 * Use to link to an issue tracker (GitHub, Jira, Linear, etc.)
 */

// TODO(#123): Fix race condition in user loading
// TODO(JIRA-456): Implement caching layer
// TODO(LIN-789): Add accessibility attributes

/**
 * TODO with Deadline
 *
 * Pattern: TODO(<date>): <description>
 *
 * Use when task has a specific deadline.
 */

// TODO(2024-Q1): Deprecate this API version
// TODO(before-v2.0): Remove backwards compatibility shim
// TODO(2024-03-15): Update to new payment provider

/**
 * TODO with Context
 *
 * Pattern: TODO: <description> - <context/reason>
 *
 * Use to explain why the task exists.
 */

// TODO: Add pagination - current query times out with >1000 items
// TODO: Cache this result - called 50+ times per request
// TODO: Refactor to use new auth system - legacy code

// ============================================================
// FIXME Format Standards
// ============================================================

/**
 * Basic FIXME Format
 *
 * Pattern: FIXME: <description>
 *
 * Use for known bugs that need fixing.
 */

// FIXME: Memory leak when component unmounts rapidly
// FIXME: Race condition between state updates
// FIXME: Incorrect timezone conversion for UTC+12

/**
 * FIXME with Severity
 *
 * Pattern: FIXME(<severity>): <description>
 *
 * Severity levels: critical, high, medium, low
 */

// FIXME(critical): Data loss when concurrent writes occur
// FIXME(high): Users see stale data after profile update
// FIXME(medium): Sort order incorrect for special characters
// FIXME(low): Minor UI glitch on window resize

/**
 * FIXME with Issue Reference
 *
 * Pattern: FIXME(#<issue>): <description>
 */

// FIXME(#234): Null pointer exception on empty input
// FIXME(BUG-567): Infinite loop in retry logic

// ============================================================
// HACK Format Standards
// ============================================================

/**
 * HACK Comment Format
 *
 * Pattern: HACK: <description>
 *
 * Use for temporary workarounds or non-ideal solutions.
 * Always include context for why it's needed.
 */

// HACK: Force re-render by changing key - React doesn't detect deep changes
// HACK: Using setTimeout(0) to defer execution after current event loop
// HACK: Duplicating data structure to work around library limitation

/**
 * HACK with Removal Condition
 *
 * Pattern: HACK: <description> - Remove when <condition>
 *
 * Always specify when the hack can be removed.
 */

// HACK: Polyfill for Array.at() - Remove when Node 16 support dropped
// HACK: Manual prefixing - Remove when autoprefixer updated
// HACK: Using any type - Remove when library adds TypeScript types

/**
 * HACK with Bug Reference
 *
 * Pattern: HACK: <description> - <bug_link>
 *
 * Link to external bug report when working around third-party issues.
 */

// HACK: Add empty div wrapper - https://github.com/lib/issues/123
// HACK: Delay state update - React 18 batching bug: facebook/react#12345

// ============================================================
// WARNING Format Standards
// ============================================================

/**
 * WARNING Comment Format
 *
 * Pattern: WARNING: <description>
 *
 * Use to alert developers about non-obvious behavior or risks.
 */

// WARNING: This function is not idempotent - calling twice has side effects
// WARNING: Order of operations matters here - don't reorder
// WARNING: This class is not thread-safe

/**
 * WARNING with Consequence
 *
 * Pattern: WARNING: <description> - <consequence>
 *
 * Explain what happens if the warning is ignored.
 */

// WARNING: Do not remove await - will cause data corruption
// WARNING: Array must be sorted - binary search will return wrong results
// WARNING: Keep under 100 items - performance degrades exponentially

// ============================================================
// NOTE Format Standards
// ============================================================

/**
 * NOTE Comment Format
 *
 * Pattern: NOTE: <description>
 *
 * Use for important information that's not a bug or task.
 */

// NOTE: This intentionally shadows the parent scope variable
// NOTE: Empty catch block is intentional - errors are expected
// NOTE: Using == instead of === for type coercion

/**
 * NOTE with Reference
 *
 * Pattern: NOTE: <description> - See <reference>
 *
 * Link to documentation or discussion.
 */

// NOTE: Implementation follows RFC 7231 - See section 6.5.1
// NOTE: Business logic from PRD - See docs/requirements.md
// NOTE: Algorithm from research paper - DOI:10.1000/xyz123

// ============================================================
// Other Standard Tags
// ============================================================

/**
 * OPTIMIZE
 *
 * Use for code that works but could be more efficient.
 */

// OPTIMIZE: N+1 query issue - consider eager loading
// OPTIMIZE: This regex could be pre-compiled
// OPTIMIZE: Consider memoizing this expensive calculation

/**
 * REVIEW
 *
 * Use for code that needs peer review or discussion.
 */

// REVIEW: Is this the right abstraction level?
// REVIEW: Should we extract this to a utility function?
// REVIEW: Security implications of this approach?

/**
 * REFACTOR
 *
 * Use for code that works but needs structural improvement.
 */

// REFACTOR: Extract common logic into shared utility
// REFACTOR: Too many responsibilities - split into smaller functions
// REFACTOR: Circular dependency - need to restructure modules

/**
 * DEPRECATED
 *
 * Use to mark code that should no longer be used.
 */

// DEPRECATED: Use newFunction() instead - will be removed in v3.0
// DEPRECATED: This endpoint is replaced by /api/v2/users
// DEPRECATED(2024-06-01): Migration deadline for new API

/**
 * TEMP / TEMPORARY
 *
 * Use for code that should definitely be removed.
 */

// TEMP: Logging for debugging issue #456
// TEMPORARY: Skip validation during migration
// TEMP: Hardcoded value until config service is ready

// ============================================================
// Combined Format Examples
// ============================================================

/**
 * Multi-line TODO with full context
 */

// TODO(#123): Implement rate limiting for this endpoint
// Context: Currently no protection against abuse
// Acceptance: Max 100 requests/minute per user
// Priority: High (security vulnerability)
// Assignee: @backend-team

/**
 * Multi-line HACK with complete documentation
 */

// HACK: Working around Chrome bug in IndexedDB transactions
// Issue: https://bugs.chromium.org/p/chromium/issues/detail?id=123456
// Workaround: Delay transaction commit by 1 tick
// Impact: ~5ms additional latency on writes
// Remove when: Chrome 120+ has 95% adoption
// Added: 2024-01-15 by @developer

/**
 * Deprecation notice with migration path
 */

// @deprecated since v2.0.0 - Use newMethod() instead
// Migration guide: https://docs.example.com/v2-migration
// Removal scheduled: v3.0.0 (Q2 2024)
//
// Before:
//   const result = oldMethod(data);
//
// After:
//   const result = newMethod(transformData(data));

// ============================================================
// IDE/Tool Integration Notes
// ============================================================

/**
 * These comment formats are recognized by:
 *
 * - VS Code: Highlights TODO/FIXME with Todo Tree extension
 * - ESLint: no-warning-comments rule can flag these
 * - GitHub: Some tools can create issues from TODOs
 * - JetBrains IDEs: Built-in TODO tool window
 *
 * Consistent formatting enables:
 * - Automated issue creation
 * - Code review checklists
 * - Technical debt tracking
 * - Documentation generation
 */

export {};
