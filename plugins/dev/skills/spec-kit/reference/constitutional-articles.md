# The 9 Constitutional Articles

Immutable principles that govern all Specification-Driven Development projects.

## Overview

Every project following SDD must adhere to these constitutional articles. They ensure quality, maintainability, and consistency across the development lifecycle.

**Critical Non-Negotiable**: Article III (Test-First) must ALWAYS be followed. Write failing tests first, verify they fail, then implement.

## Article I: Library-First

**Principle**: Each feature must first be implemented as a reusable library before integration into the application.

**Rationale**:

- Forces clear separation of concerns
- Enables reusability across projects
- Makes testing easier (no UI dependencies)
- Improves maintainability and modularity

**Implementation**:

- All business logic lives in `src/lib/[feature-name]/`
- Libraries should be framework-agnostic when possible
- Application code (CLI, web, etc.) is thin wrapper around libraries

**Example Structure**:

```
project/
├── src/
│   ├── lib/
│   │   ├── auth/           # Authentication library
│   │   │   ├── index.ts
│   │   │   ├── models.ts
│   │   │   └── utils.ts
│   │   └── payments/       # Payments library
│   │       ├── index.ts
│   │       └── providers.ts
│   └── cli/                # CLI integration layer
│       ├── auth.ts
│       └── payments.ts
```

**Validation**:

- [ ] Feature logic is in `src/lib/[feature]/`
- [ ] Library has no dependencies on CLI/UI code
- [ ] Library exports clear public API

## Article II: CLI Interface

**Principle**: All functionality must be exposed via Command Line Interface (text in, text out).

**Rationale**:

- Forces clear input/output contracts
- Enables automation and scripting
- Makes testing straightforward
- Provides universal access (no GUI required)

**Implementation**:

- Each feature has a CLI command in `src/cli/[feature].ts`
- CLI accepts input via flags/arguments
- CLI outputs results as text (JSON, plain text, etc.)

**Example**:

```typescript
// src/cli/auth.ts
import { register, login } from '../lib/auth'

export async function authCLI(args: string[]) {
  const command = args[0]

  if (command === 'register') {
    const [email, password] = args.slice(1)
    const result = await register(email, password)
    console.log(JSON.stringify(result))
  }

  if (command === 'login') {
    const [email, password] = args.slice(1)
    const token = await login(email, password)
    console.log(token)
  }
}
```

**Validation**:

- [ ] CLI command exists in `src/cli/[feature].ts`
- [ ] All library functions accessible via CLI
- [ ] Input/output contract clearly defined

## Article III: Test-First (NON-NEGOTIABLE)

**Principle**: Write tests BEFORE implementation, always. Verify tests fail, then write minimum code to pass.

**Rationale**:

- Ensures code is testable by design
- Documents expected behavior
- Catches regressions immediately
- Forces clear thinking about requirements

**Implementation**:

1. Write failing test for requirement
2. Run test, verify it fails (red)
3. Write minimum code to pass test
4. Run test, verify it passes (green)
5. Refactor while keeping tests green

**Example Workflow**:

```typescript
// tests/auth.test.ts - WRITE THIS FIRST
describe('User Registration', () => {
  it('should create user with valid credentials', async () => {
    const result = await register('user@example.com', 'password123')
    expect(result.success).toBe(true)
    expect(result.userId).toBeDefined()
  })

  it('should reject password < 8 characters', async () => {
    await expect(
      register('user@example.com', 'short')
    ).rejects.toThrow('Password must be at least 8 characters')
  })
})

// src/lib/auth/index.ts - WRITE THIS SECOND (after tests fail)
export async function register(email: string, password: string) {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }
  // ... implementation
}
```

**Validation**:

- [ ] Tests written before implementation
- [ ] Tests verified to fail initially
- [ ] Implementation makes tests pass
- [ ] Tests run in CI/CD pipeline

## Article IV: Documentation Standards

**Principle**: Document all public APIs with clear descriptions and usage examples.

**Rationale**:

- Makes code accessible to others
- Serves as living documentation
- Reduces onboarding time
- Catches unclear designs early

**Implementation**:

- JSDoc comments for all exported functions
- README.md with usage examples
- Inline comments for complex logic only

**Example**:

```typescript
/**
 * Register a new user with email and password.
 *
 * @param email - User's email address (must be unique)
 * @param password - User's password (min 8 characters)
 * @returns Promise resolving to registration result
 * @throws {ValidationError} If email/password invalid
 * @throws {DuplicateError} If email already exists
 *
 * @example
 * ```typescript
 * const result = await register('user@example.com', 'securepass123')
 * console.log(result.userId) // "uuid-here"
 * ```
 */
export async function register(email: string, password: string): Promise<RegistrationResult> {
  // implementation
}
```

**Validation**:

- [ ] All public functions have JSDoc comments
- [ ] README.md includes usage examples
- [ ] Complex logic has inline comments

## Article V: Code Quality

**Principle**: Use linters, formatters, and type checking to maintain consistent, high-quality code.

**Rationale**:

- Catches bugs before runtime
- Enforces team conventions
- Improves readability
- Reduces cognitive load

**Implementation**:

- TypeScript for type safety
- ESLint for code quality rules
- Prettier for consistent formatting
- Pre-commit hooks to enforce standards

**Example Configuration**:

```json
// package.json
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Validation**:

- [ ] TypeScript enabled with strict mode
- [ ] Linter configured and passing
- [ ] Formatter configured and applied
- [ ] Pre-commit hooks enforce quality

## Article VI: Version Control

**Principle**: Use semantic versioning and write meaningful commit messages.

**Rationale**:

- Communicates changes clearly
- Enables automated changelog generation
- Makes rollbacks safer
- Improves collaboration

**Implementation**:

- Semantic versioning (MAJOR.MINOR.PATCH)
- Conventional Commits format
- Descriptive commit messages

**Example Commits**:

```
feat(auth): add user registration endpoint

- Implement email/password validation
- Add bcrypt password hashing
- Create user database schema

BREAKING CHANGE: Changed /register endpoint to require email confirmation
```

**Validation**:

- [ ] Semantic versioning followed
- [ ] Commits follow conventional format
- [ ] Breaking changes clearly marked

## Article VII: Simplicity

**Principle**: Start with maximum 3 projects. Justify all abstractions.

**Rationale**:

- Prevents over-engineering
- Keeps codebase manageable
- Forces clear thinking about boundaries
- Reduces complexity

**Implementation**:

- Limit initial scope to 3 core libraries
- Only add new projects with clear justification
- Document why each abstraction exists

**Example Decision Log**:

```markdown
## Project Structure Decisions

### Core Libraries (Maximum 3)

1. **auth** - User authentication and authorization
   - Justification: Security is critical, needs isolation

2. **data** - Database access and ORM
   - Justification: All features need data persistence

3. **api** - REST API endpoints
   - Justification: External interface needs clear contract
```

**Validation**:

- [ ] ≤ 3 initial core libraries
- [ ] Each library has documented justification
- [ ] New libraries require approval

## Article VIII: Justify Abstractions

**Principle**: Only create abstractions after the 3rd duplication (Rule of Three).

**Rationale**:

- Prevents premature optimization
- Keeps code simple until patterns emerge
- Reduces over-abstraction
- Makes refactoring easier

**Implementation**:

- Copy-paste code up to 2 times
- On 3rd duplication, extract abstraction
- Document why abstraction was created

**Example**:

```typescript
// ❌ BAD: Premature abstraction (only 1 use case)
function createHandler<T>(logic: (data: T) => void) {
  return async (req, res) => {
    try {
      logic(req.body)
      res.status(200).send()
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
}

// ✅ GOOD: Wait for 3rd duplication before abstracting
// auth.ts
app.post('/register', async (req, res) => {
  try {
    await register(req.body)
    res.status(200).send()
  } catch (err) {
    res.status(500).send(err.message)
  }
})

// payments.ts (2nd occurrence - still copy-paste)
app.post('/charge', async (req, res) => {
  try {
    await charge(req.body)
    res.status(200).send()
  } catch (err) {
    res.status(500).send(err.message)
  }
})

// profile.ts (3rd occurrence - NOW extract)
function asyncHandler(fn) {
  return async (req, res) => {
    try {
      await fn(req.body)
      res.status(200).send()
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
}
```

**Validation**:

- [ ] No abstractions until 3rd duplication
- [ ] Abstraction creation documented
- [ ] Clear benefit over duplication

## Article IX: Integration-First

**Principle**: Test with real databases and services. Avoid excessive mocking.

**Rationale**:

- Catches integration issues early
- Tests reflect production reality
- Reduces false confidence from mocks
- Improves reliability

**Implementation**:

- Use Docker containers for local databases
- Integration tests with real services
- Mocks only for external APIs (payment gateways, etc.)

**Example**:

```typescript
// ✅ GOOD: Integration test with real database
describe('User Repository', () => {
  let db: Database

  beforeAll(async () => {
    // Spin up real PostgreSQL container
    db = await createTestDatabase()
  })

  it('should persist user to database', async () => {
    const user = await userRepo.create({ email: 'test@example.com' })

    // Query real database
    const stored = await db.query('SELECT * FROM users WHERE id = $1', [user.id])
    expect(stored.rows[0].email).toBe('test@example.com')
  })

  afterAll(() => db.close())
})

// ❌ BAD: Mock everything
it('should persist user', async () => {
  const mockDb = { query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }] }) }
  // ... test with mock (doesn't catch SQL errors)
})
```

**Validation**:

- [ ] Integration tests use real databases
- [ ] Docker Compose for local services
- [ ] Mocks limited to external APIs

## Constitutional Compliance Checklist

Use this checklist when creating specifications and plans:

- [ ] **Article I**: Feature implemented in `src/lib/[feature]/`
- [ ] **Article II**: CLI interface in `src/cli/[feature].ts`
- [ ] **Article III**: Tests written before implementation
- [ ] **Article IV**: All public APIs documented with examples
- [ ] **Article V**: Linter, formatter, type checker configured
- [ ] **Article VI**: Semantic versioning and conventional commits
- [ ] **Article VII**: ≤ 3 initial projects, abstractions justified
- [ ] **Article VIII**: Abstractions only after 3rd duplication
- [ ] **Article IX**: Integration tests with real services

## Enforcement

These articles are **immutable** and **non-negotiable** for all SDD projects. The only exception is Article III (Test-First), which is absolutely mandatory under all circumstances.

**Violation Consequences**:

- Code reviews must reject constitutional violations
- CI/CD pipelines should enforce articles automatically
- Plans and specs should include constitutional compliance checks

## Learn More

- [Workflow Guide](workflow-guide.md) - Complete 7-phase SDD workflow
- [Official Repository](https://github.com/github/spec-kit) - GitHub spec-kit project
