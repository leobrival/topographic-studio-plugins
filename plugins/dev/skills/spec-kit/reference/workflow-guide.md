# Specification-Driven Development - Workflow Guide

Complete guide to the 7-phase SDD workflow with templates, examples, and best practices.

## Table of Contents

1. [Phase 1: Constitution](#phase-1-constitution)
2. [Phase 2: Specification](#phase-2-specification)
3. [Phase 3: Clarification](#phase-3-clarification)
4. [Phase 4: Planning](#phase-4-planning)
5. [Phase 5: Validation](#phase-5-validation)
6. [Phase 6: Tasks](#phase-6-tasks)
7. [Phase 7: Implementation](#phase-7-implementation)
8. [Document Templates](#document-templates)
9. [Best Practices](#best-practices)
10. [Anti-Patterns](#anti-patterns)

## Phase 1: Constitution

**Purpose**: Establish immutable project principles

**Output**: `constitution.md`

**Content**:

- Project philosophy and values
- Technical constraints
- Quality standards
- The 9 constitutional articles applied to this project

**Example**:

```markdown
# Project Constitution

## Article I: Library-First

All features in this project must be implemented as standalone libraries before
integration...
```

## Phase 2: Specification

**Purpose**: Define WHAT to build and WHY (not HOW)

**Output**: `spec.md` in `.specify/specs/[###]-[feature-name]/`

**Structure**:

```markdown
# Feature Name

## User Stories

### US1: [Priority] Title

As a [user type]
I want [capability]
So that [benefit]

**Acceptance Criteria**:

- [ ] Criterion 1
- [ ] Criterion 2

### Requirements

**Functional Requirements**:

- REQ1: [Description]
- REQ2: [Description]

**Data Entities**:

- Entity1: [Description]
- Entity2: [Description]

### Success Criteria

- Metric 1: [Target]
- Metric 2: [Target]
```

**Key Points**:

- Use `[NEEDS CLARIFICATION]` markers for ambiguities
- Prioritize stories: P1 (must-have), P2 (should-have), P3 (nice-to-have)
- Focus on user value, not technical implementation

## Phase 3: Clarification

**Purpose**: Resolve under-specified requirements

**Method**: Ask 5 targeted questions to eliminate ambiguity

**Questions Target**:

- Unclear user interactions
- Missing edge cases
- Undefined data relationships
- Ambiguous success criteria
- Technical constraints

**Output**: Updated `spec.md` with clarifications

## Phase 4: Planning

**Purpose**: Define HOW to implement (technical strategy)

**Output**: `plan.md` in `.specify/specs/[###]-[feature-name]/`

**Structure**:

```markdown
# Implementation Plan: [Feature Name]

## Technical Summary

[1-2 paragraphs summarizing technical approach]

## Technical Context

**Language**: [Programming language]
**Dependencies**: [Key libraries/frameworks]
**Storage**: [Database/file system]
**Testing Framework**: [Test framework]

## Constitution Check

- [x] Article I (Library-First): Feature implemented as `lib/feature-name`
- [x] Article II (CLI Interface): Exposed via `cli/feature-name.ts`
- [x] Article III (Test-First): Tests in `tests/feature-name.test.ts`

## Project Structure
```

project/
├── docs/
│ └── feature-name.md
├── src/
│ ├── lib/
│ │ └── feature-name/
│ └── cli/
│ └── feature-name.ts
└── tests/
└── feature-name.test.ts

```

## Implementation Strategy

[Detailed technical approach]
```

## Phase 5: Validation

**Purpose**: Ensure plan is complete and executable

**Checklist**:

- [ ] All user stories have technical solutions
- [ ] Constitution check passes
- [ ] Dependencies identified
- [ ] Testing strategy defined
- [ ] Edge cases addressed

## Phase 6: Tasks

**Purpose**: Break down implementation into executable tasks

**Output**: `tasks.md` in `.specify/specs/[###]-[feature-name]/`

**Format**: `[ID] [P?] [Story] Description`

- **[ID]**: T001, T002, etc.
- **[P]**: Parallel execution flag (optional)
- **[Story]**: US1, US2, etc.
- **Description**: Clear action with file paths

**5 Sequential Phases**:

```markdown
# Tasks: [Feature Name]

## Phase 0: Setup

- T001 [] Initialize project structure in `project/`
- T002 [] Install dependencies listed in plan.md

## Phase 1: Foundational

- T003 [] Create core library in `src/lib/feature-name/index.ts`
- T004 [] Implement data models in `src/lib/feature-name/models.ts`

## Phase 2: User Stories

- T005 [P] [US1] Implement user story 1 in `src/lib/feature-name/us1.ts`
- T006 [P] [US2] Implement user story 2 in `src/lib/feature-name/us2.ts`

## Phase 3: Polish

- T007 [] Add error handling across all modules
- T008 [] Optimize performance

## Phase 4: Dependencies

See dependencies guide for task ordering
```

## Phase 7: Implementation

**Purpose**: Execute tasks according to plan

**Process**:

1. Follow tasks sequentially by phase
2. Execute parallel tasks ([P] flag) concurrently within phase
3. Write tests BEFORE implementation (Article III)
4. Verify tests fail before writing code
5. Implement minimum code to pass tests
6. Refactor while keeping tests green

## Naming Conventions

### Branch Names

**Format**: `[###]-[feature-name]`

**Example**: `001-user-authentication`

**Rules**:

- Use 3-digit sequence number
- Use kebab-case for feature name
- Filter stop words (the, a, an, to, for, etc.)
- Maximum 244 bytes (GitHub limit)

### Feature Directories

**Format**: `.specify/specs/[###]-[feature-name]/`

**Contents**:

- `spec.md` - Functional specification
- `plan.md` - Technical implementation plan
- `tasks.md` - Task breakdown
- `data-model.md` - Data entity definitions (optional)
- `contracts/` - API contracts (optional)

## Document Templates

### spec.md Template

```markdown
# [Feature Name]

## Overview

[1-2 paragraph summary of what this feature does and why it's valuable]

## User Stories

### US1: [P1] [Title]

As a [user type]
I want [capability]
So that [benefit]

Acceptance Criteria:

- [ ] Given [context], when [action], then [outcome]
- [ ] [Edge case]

Success Metrics:

- [Metric]: [Target]

## Requirements

### Functional Requirements

- REQ1: [Description]
- REQ2: [Description] [NEEDS CLARIFICATION]

### Data Entities

#### Entity1: [Name]

Attributes:

- `id`: Unique identifier
- `attribute1`: [Type] - [Description]

Relationships:

- Has many [Entity2]

## Success Criteria

- Metric 1: [Target value]
- Metric 2: [Target value]
```

### plan.md Template

```markdown
# Implementation Plan: [Feature Name]

## Technical Summary

[2-3 paragraphs describing technical approach]

## Technical Context

- Language: [Language and version]
- Dependencies: [Key packages]
- Storage: [Database/file system]
- Testing: [Framework]

## Constitution Check

- [ ] Article I (Library-First): Feature in `src/lib/[feature]/`
- [ ] Article II (CLI): CLI in `src/cli/[feature].ts`
- [ ] Article III (Test-First): Tests in `tests/[feature].test.ts`
- [ ] Articles IV-IX: [Verify compliance]

## Project Structure
```

src/
├── lib/[feature]/
│ ├── index.ts
│ └── core.ts
└── cli/[feature].ts
tests/[feature].test.ts

```

## Implementation Strategy
[Detailed technical approach with phases]
```

### tasks.md Template

```markdown
# Tasks: [Feature Name]

## Phase 0: Setup

- T001 [] Create project structure
- T002 [] Install dependencies

## Phase 1: Foundation

- T003 [] Define types in `src/lib/[feature]/types.ts`
- T004 [] Create models

## Phase 2: User Stories

### US1: [Title]

- T005 [P] [US1] Write failing tests
- T006 [P] [US1] Implement feature
- T007 [P] [US1] Verify tests pass

## Phase 3: Polish

- T008 [] Add error handling
- T009 [] Add documentation

## Phase 4: Integration

- T010 [] Integration tests
- T011 [] Build and deploy
```

## Quick Example: User Authentication Spec

```markdown
# User Authentication

## User Stories

### US1: [P1] User Registration

As a new visitor
I want to create an account with email and password
So that I can access personalized features

Acceptance Criteria:

- [ ] Given valid email/password, account is created
- [ ] Given duplicate email, show "Email already in use"
- [ ] Given password < 8 chars, show error

### US2: [P1] User Login

As a registered user
I want to log in with credentials
So that I can access my account

Acceptance Criteria:

- [ ] Given valid credentials, redirect to dashboard
- [ ] Given invalid credentials, show error
- [ ] Given 3 failed attempts, lock account for 15 min

## Data Entities

### User

- `id`: UUID
- `email`: String (unique)
- `password_hash`: String (bcrypt)
- `created_at`: Timestamp

### Session

- `id`: UUID
- `user_id`: UUID
- `token`: String (hashed)
- `expires_at`: Timestamp
```

## Best Practices

### DO

- Write specifications without technical bias
- Run clarification before planning
- Write tests before implementation
- Use [NEEDS CLARIFICATION] markers liberally
- Validate plan completeness before tasks
- Follow constitutional principles
- Keep user stories independent and testable

### DON'T

- Jump directly to implementation without specs
- Mix "what" and "how" in specifications
- Skip the clarification phase
- Implement before writing tests
- Create abstractions without justification
- Bypass constitutional checks

## Anti-Patterns

**Premature Implementation**:

```markdown
❌ BAD:
User Story: "Use MongoDB for data storage"

✅ GOOD:
User Story: "Persist user data reliably with sub-100ms read latency"
Plan: "Use MongoDB for implementation (justification: ...)"
```

**Under-Specified Requirements**:

```markdown
❌ BAD:
"User can upload files"

✅ GOOD:
"User can upload files (max 10MB, formats: PDF, DOCX, TXT) with progress
indicator [NEEDS CLARIFICATION: What happens if upload fails?]"
```

**Skipping Tests**:

```markdown
❌ BAD:
T001 [] Implement feature
T002 [] Write tests

✅ GOOD:
T001 [] Write failing tests for feature
T002 [] Implement feature (tests should pass)
```

## Integration with Existing Codebase

When adding SDD to an existing project:

1. Create `.specify/` directory structure
2. Write constitution based on existing patterns
3. Start with ONE new feature using SDD
4. Gradually migrate existing features to spec-driven approach
5. Use reverse engineering to create specs for existing code

## Benefits of SDD

- **Clarity**: Everyone understands WHAT to build before HOW
- **Alignment**: Specs serve as shared understanding
- **Quality**: Tests written first ensure correctness
- **Maintainability**: Specifications document intent
- **Agility**: Easy to iterate on specs before coding
- **Onboarding**: New team members read specs to understand system

## Complementary Resources

- [Constitutional Articles](constitutional-articles.md) - The 9 immutable principles
- [Official Repository](https://github.com/github/spec-kit) - GitHub spec-kit project
