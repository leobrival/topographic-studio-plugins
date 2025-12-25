---
description: Code quality standards based on NASA's Power of 10 rules for safety-critical code
---

# Code Quality Standards

Guidelines based on NASA JPL's Power of 10 rules, adapted for TypeScript/JavaScript development.

## The Power of 10 Rules

Developed by Gerard J. Holzmann at NASA's Jet Propulsion Laboratory for mission-critical software (Mars Curiosity Rover).

### Rule 1: Simple Control Flow

Restrict code to simple control flow constructs.

```typescript
// AVOID
goto, setjmp, longjmp
direct or indirect recursion

// PREFER
Simple if/else, for, while
Early returns for guard clauses
```

**Why:** Complex control flow makes code difficult to analyze and verify.

### Rule 2: Fixed Loop Bounds

All loops must have a fixed upper bound.

```typescript
// GOOD - Fixed bound
for (let i = 0; i < items.length; i++) { }
for (const item of items.slice(0, MAX_ITEMS)) { }

// RISKY - Unbounded
while (condition) { } // Could run forever
for (;;) { } // Infinite loop
```

**Why:** Enables verification that loops terminate and allows static analysis.

### Rule 3: No Dynamic Memory After Init

Avoid dynamic memory allocation after initialization.

```typescript
// PREFER - Pre-allocate
const buffer = new Array(MAX_SIZE);
const cache = new Map<string, Data>();

// AVOID - Runtime allocation in hot paths
function process() {
  const temp = []; // New allocation each call
}
```

**Why:** Prevents memory leaks, fragmentation, and non-deterministic behavior.

### Rule 4: Function Length Limit

No function longer than one printed page (~60 lines).

```typescript
// GOOD - Focused function
function validateUser(user: User): ValidationResult {
  // 20-30 lines max
}

// BAD - Monolithic function
function processEverything() {
  // 200+ lines doing multiple things
}
```

**Why:** Promotes readability, testability, and comprehensibility.

### Rule 5: Assertion Density

Minimum two assertions per function.

```typescript
function divide(a: number, b: number): number {
  assert(typeof a === "number", "a must be number");
  assert(b !== 0, "Cannot divide by zero");

  const result = a / b;

  assert(isFinite(result), "Result must be finite");
  return result;
}
```

**Why:** Assertions catch errors early and document assumptions.

### Rule 6: Minimal Scope

Declare variables at the smallest possible scope.

```typescript
// GOOD - Minimal scope
function process(items: Item[]) {
  for (const item of items) {
    const processed = transform(item); // Scoped to loop
    save(processed);
  }
}

// BAD - Excessive scope
function process(items: Item[]) {
  let processed; // Declared too early
  for (const item of items) {
    processed = transform(item);
    save(processed);
  }
}
```

**Why:** Reduces unintended side effects and improves clarity.

### Rule 7: Parameter & Return Validation

Validate all inputs and check all return values.

```typescript
// GOOD - Defensive programming
function createUser(data: UserInput): Result<User, Error> {
  // Validate inputs
  if (!data.email || !isValidEmail(data.email)) {
    return { error: new Error("Invalid email") };
  }

  // Check return values
  const result = database.insert(data);
  if (!result.success) {
    return { error: result.error };
  }

  return { value: result.user };
}
```

**Why:** Prevents error propagation and ensures defensive programming.

### Rule 8: Limited Preprocessor Use

In TypeScript/JavaScript context: limit metaprogramming.

```typescript
// AVOID
- Complex decorators
- Excessive use of Proxy
- Runtime code generation
- eval() and new Function()

// PREFER
- Simple, explicit code
- Type-safe patterns
- Compile-time checks
```

**Why:** Complex metaprogramming makes code difficult to analyze.

### Rule 9: Pointer Restrictions

In TypeScript context: limit reference complexity.

```typescript
// AVOID
- Deep nested object access: a.b.c.d.e.f
- Complex callback chains
- Circular references

// PREFER
- Optional chaining: a?.b?.c
- Early destructuring
- Flat data structures
```

**Why:** Reduces complexity and improves static analysis.

### Rule 10: Compiler Warnings

Enable all possible warnings and fix them.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Why:** Compiler warnings often indicate real problems.

## Additional Guidelines

### Before Editing Files

**Non-negotiable:** Read at least 3 relevant existing files before editing.

1. **Read** similar functionality files + imported dependencies
2. **Understand** patterns, conventions, and API usage
3. **Proceed** only after understanding the codebase

**Why:**

- Ensures consistency with project patterns
- Prevents breaking changes
- Follows established conventions
- Learns from existing implementations

### Avoid Over-Engineering

Only make changes that are directly requested or clearly necessary.

**Don't:**

- Add features beyond what was asked
- Refactor surrounding code during a bug fix
- Add docstrings/comments to unchanged code
- Add error handling for impossible scenarios
- Create abstractions for one-time operations
- Design for hypothetical future requirements

**Do:**

- Keep solutions simple and focused
- Trust internal code and framework guarantees
- Delete unused code completely
- Three similar lines > premature abstraction

### No Backwards Compatibility Hacks

```typescript
// AVOID
const _unusedVar = oldFunction; // Renamed but kept
export { newFunc as oldFunc }; // Re-export for compatibility
// removed: oldFunction()

// PREFER
// Just delete unused code completely
```

## Quick Checklist

- [ ] Simple control flow (no goto, no recursion)
- [ ] Fixed loop bounds
- [ ] Pre-allocated memory where possible
- [ ] Functions < 60 lines
- [ ] 2+ assertions per function
- [ ] Variables at minimal scope
- [ ] All inputs validated
- [ ] All return values checked
- [ ] No complex metaprogramming
- [ ] Flat reference chains
- [ ] All warnings fixed
- [ ] Read 3 files before editing
- [ ] No over-engineering
