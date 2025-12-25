# Comment Best Practices

Guidelines for writing effective inline comments that improve code maintainability.

## The Golden Rule

**Document the "WHY", not the "WHAT".**

Code shows what happens. Comments explain why it happens that way.

## When to Comment

### DO Comment

1. **Business logic** that isn't obvious from code
2. **Workarounds** for bugs or limitations
3. **Performance optimizations** that make code less readable
4. **Security considerations** and their rationale
5. **Complex algorithms** with non-obvious steps
6. **API contracts** and assumptions
7. **TODOs** with context and issue references

### DON'T Comment

1. **What code does** (obvious from reading it)
2. **How to use language features** (assumed knowledge)
3. **Outdated information** (worse than no comment)
4. **Redundant type information** (TypeScript handles this)
5. **Every line of code** (over-commenting reduces signal)

## Comment Quality Examples

### Business Logic

```typescript
// BAD: Describes what code does
// Check if user is premium
if (user.tier === "premium") {}

// GOOD: Explains business rule
// Premium users bypass queue per SLA agreement DOC-2024-001
// This ensures <100ms response time guarantee
if (user.tier === "premium") {}
```

### Workarounds

```typescript
// BAD: No context
// Use setTimeout
setTimeout(callback, 0);

// GOOD: Explains why needed
// HACK: Force execution in next event loop tick.
// Workaround for React 18 batching issue where state
// updates aren't reflected immediately.
// Issue: facebook/react#12345
// Remove when: React 19 stable release
setTimeout(callback, 0);
```

### Performance

```typescript
// BAD: States the obvious
// Use Map for lookup
const cache = new Map();

// GOOD: Justifies the choice
// Using Map instead of Object for O(1) lookup with large datasets.
// Benchmark showed 50ms → 2ms for 10k entries (see PERF-2024-03)
const cache = new Map();
```

### Security

```typescript
// BAD: No explanation
const result = constantTimeCompare(a, b);

// GOOD: Explains security implication
// SECURITY: Constant-time comparison prevents timing attacks.
// Regular === comparison returns early on mismatch, leaking
// information about secret length and content.
const result = constantTimeCompare(a, b);
```

### Algorithms

```typescript
// BAD: Just names the algorithm
// Binary search
function find(arr, target) {}

// GOOD: Explains approach and complexity
/**
 * Binary search with early termination optimization.
 *
 * Algorithm:
 * 1. Start with full range [0, n-1]
 * 2. Check midpoint against target
 * 3. Narrow to left/right half based on comparison
 * 4. Repeat until found or range exhausted
 *
 * Time: O(log n), Space: O(1)
 *
 * Uses unsigned right shift (>>>) to avoid integer overflow
 * when calculating midpoint for very large arrays.
 */
function find(arr, target) {}
```

## Comment Formats

### Single-Line Comments

Use for brief explanations on the same line or above:

```typescript
const MAX_RETRIES = 3; // Per circuit breaker spec

// Skip validation for internal calls (already validated upstream)
if (!isInternalRequest) {
  validate(input);
}
```

### Multi-Line Comments

Use for longer explanations that need structure:

```typescript
/*
 * Retry Strategy:
 * 1. Initial attempt
 * 2. Wait 1 second, retry
 * 3. Wait 2 seconds, retry
 * 4. Wait 4 seconds, retry (exponential backoff)
 * 5. Give up and throw
 *
 * Total max wait: 7 seconds
 */
```

### JSDoc Comments

Use for public APIs and documentation generation:

```typescript
/**
 * Calculates shipping cost based on weight and destination.
 *
 * @param weight - Package weight in kilograms
 * @param destination - ISO country code
 * @returns Shipping cost in USD cents
 *
 * @throws {InvalidWeightError} If weight is negative or exceeds 50kg
 * @throws {UnsupportedDestinationError} If country not in service area
 */
function calculateShipping(weight: number, destination: string): number {}
```

## Warning Comments

Use to alert developers about risks or requirements:

```typescript
// WARNING: This function is not thread-safe
// WARNING: Order of operations matters - don't reorder
// WARNING: Array must be sorted before calling
// WARNING: This mutates the input - clone first if needed
// WARNING: Rate limited to 100 req/min by external API
```

## Reference Comments

Link to external resources:

```typescript
// See RFC 7231 Section 6.5.1 for status code semantics
// Implementation based on: https://example.com/algorithm
// Bug workaround: https://bugs.chromium.org/p/chromium/issues/detail?id=123
// Ticket: JIRA-456
```

## Temporary Comments

Mark code that needs future attention:

```typescript
// TODO: Add input validation
// TODO(john): Review algorithm performance
// TODO(#123): Implement caching
// TODO(2024-Q2): Deprecate this endpoint

// FIXME: Race condition when user logs out during request
// FIXME(critical): Data loss on concurrent writes

// HACK: Workaround for library bug - remove when v3.0 releases
// TEMP: Debug logging - remove before merge
```

## Section Markers

Organize large files:

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
```

## Anti-Patterns

### Commented-Out Code

```typescript
// BAD: Dead code with no context
// function oldImplementation() {
//   return data.map(x => x * 2);
// }

// If you need to keep old code, use version control.
// If it's an alternative approach, document why:

// Alternative implementation using reduce (10% slower, but
// handles edge cases better). Keeping for reference:
// function altImplementation() { ... }
```

### Obvious Comments

```typescript
// BAD: States what code already says
// Increment i by 1
i++;

// Check if array is empty
if (arr.length === 0) {}

// Return the result
return result;
```

### Outdated Comments

```typescript
// BAD: Comment doesn't match code
// Sort by name
users.sort((a, b) => a.createdAt - b.createdAt);

// Update comments when changing code!
```

### Apologetic Comments

```typescript
// BAD: Acknowledges bad code without fixing it
// Sorry, this is ugly but it works

// Either fix it or document why it must be this way:
// Using nested ternaries because switch doesn't support
// range matching in TypeScript. Consider extracting to
// lookup table if more cases are added.
```

## Comment Maintenance

### Keep Comments Close to Code

```typescript
// GOOD: Comment directly above relevant code
// Skip already-processed items to avoid duplicates
const newItems = items.filter(item => !processed.has(item.id));

// BAD: Comment far from what it describes
// We need to filter out processed items
// ... 20 lines of other code ...
const newItems = items.filter(item => !processed.has(item.id));
```

### Update Comments with Code

When changing code:

1. Read existing comments
2. Verify they're still accurate
3. Update or remove if outdated
4. Add new comments if behavior changes

### Review Comments in Code Review

- Are comments accurate?
- Do they explain "why"?
- Are there missing comments for complex logic?
- Are there unnecessary comments?

## Language-Specific Guidelines

### TypeScript

```typescript
// Don't duplicate type information
// BAD: @param {string} name
// GOOD: @param name - The user's display name

// Use JSDoc for public APIs
// Use inline comments for implementation details

// Let the type system document what's obvious
interface Config {
  timeout: number;  // Milliseconds (document units, not type)
}
```

### React

```typescript
// Document non-obvious prop requirements
interface Props {
  // Must be memoized to prevent infinite re-renders
  onChange: (value: string) => void;

  // Accepts React.ReactNode, not just string
  children: React.ReactNode;
}

// Explain effect dependencies
useEffect(() => {
  // Re-fetch when userId changes (not on every render)
}, [userId]);
```

## Checklist

Before committing, verify:

- [ ] Complex logic has explanatory comments
- [ ] Business rules are documented
- [ ] Workarounds reference issues/bugs
- [ ] No outdated comments
- [ ] No obvious/redundant comments
- [ ] TODOs have context (issue #, deadline, owner)
- [ ] Security-sensitive code is documented
- [ ] Performance optimizations are explained
