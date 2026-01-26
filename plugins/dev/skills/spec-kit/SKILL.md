---
name: spec-kit
description: Specification-Driven Development methodology from GitHub spec-kit. Use when users ask to create specifications, plan features, define requirements, write user stories, decompose tasks, establish project constitution, or follow SDD workflow.
allowed-tools: Read, Write, Grep, Glob
---

# Specification-Driven Development (SDD)

Comprehensive implementation of GitHub's [spec-kit](https://github.com/github/spec-kit) methodology where specifications become executable, directly generating functional implementations.

**Source**: This skill is based on the official [GitHub spec-kit](https://github.com/github/spec-kit) project - an open-source toolkit that implements Specification-Driven Development.

## Quick Start

When a user needs to develop a feature or start a project, follow this workflow:

1. **Constitution** - Establish project principles (`/speckit.constitution`)
2. **Specification** - Define requirements (what and why, not how) (`/speckit.specify`)
3. **Clarification** - Address ambiguities with 5 targeted questions (`/speckit.clarify` - optional)
4. **Planning** - Create technical implementation strategy (`/speckit.plan`)
5. **Tasks** - Generate executable task breakdown (`/speckit.tasks`)
6. **Implementation** - Execute according to plan (`/speckit.implement`)

**Note**: The official spec-kit includes slash commands for Claude Code integration. This skill provides the same workflow without requiring the CLI installation.

## Decision Tree

```text
SDD Request → What stage?
    │
    ├─ New Project / Feature
    │   ├─ Create constitution.md (principles)
    │   ├─ Write spec.md (requirements)
    │   ├─ Run clarification (5 questions)
    │   ├─ Generate plan.md (technical)
    │   ├─ Create tasks.md (breakdown)
    │   └─ Implement according to tasks
    │
    ├─ Existing Specifications
    │   ├─ Analyze consistency across artifacts
    │   ├─ Identify gaps or ambiguities
    │   └─ Suggest improvements
    │
    └─ Documentation Only
        ├─ Extract specifications from code
        └─ Generate reverse-engineered docs
```

## Core Philosophy

Spec-Kit inverts traditional development:

- **Traditional**: Write code → Document later
- **Spec-Driven**: Write specifications → Generate code

Specifications are the **first artifact**, and code is their expression in a particular language.

## The 9 Constitutional Articles

For complete details on each article with implementation examples and validation checklists, see [Constitutional Articles](reference/constitutional-articles.md).

**Summary**:

1. **Library-First** - Features as reusable libraries before integration
2. **CLI Interface** - All functionality via CLI (text in, text out)
3. **Test-First (NON-NEGOTIABLE)** - Tests before implementation, always
4. **Documentation Standards** - Document public APIs with examples
5. **Code Quality** - Linters, formatters, type checking
6. **Version Control** - Semantic versioning, conventional commits
7. **Simplicity** - Max 3 initial projects, justify abstractions
8. **Justify Abstractions** - Only after 3rd duplication (Rule of Three)
9. **Integration-First** - Real databases/services, minimal mocking

**Critical**: Article III (Test-First) is non-negotiable. Write failing tests first, verify they fail, then implement.

## Workflow Phases

For complete details on each phase with templates, examples, and best practices, see [Workflow Guide](reference/workflow-guide.md).

### Phase 1: Constitution

Establish immutable project principles in `constitution.md`.

### Phase 2: Specification

Define WHAT to build and WHY (not HOW) in `spec.md`. Include:

- User stories with acceptance criteria
- Functional requirements
- Data entities
- Success metrics

Use `[NEEDS CLARIFICATION]` markers for ambiguities.

### Phase 3: Clarification

Ask 5 targeted questions to eliminate ambiguity before planning.

### Phase 4: Planning

Define HOW to implement in `plan.md` with:

- Technical summary
- Tech stack and dependencies
- Constitution compliance check
- Project structure
- Implementation strategy

### Phase 5: Validation

Ensure plan completeness:

- [ ] All user stories have technical solutions
- [ ] Constitution check passes
- [ ] Dependencies identified
- [ ] Testing strategy defined
- [ ] Edge cases addressed

### Phase 6: Tasks

Generate `tasks.md` with sequential phases:

- Phase 0: Setup
- Phase 1: Foundation
- Phase 2: User Stories (with [P] flag for parallel execution)
- Phase 3: Polish
- Phase 4: Integration

### Phase 7: Implementation

Execute tasks following Test-First approach:

1. Write failing test
2. Verify test fails (red)
3. Write minimum code to pass
4. Verify test passes (green)
5. Refactor while keeping tests green

## Benefits of SDD

- **Clarity**: Everyone understands WHAT to build before HOW
- **Alignment**: Specs serve as shared understanding
- **Quality**: Tests written first ensure correctness
- **Maintainability**: Specifications document intent
- **Agility**: Easy to iterate on specs before coding
- **Onboarding**: New team members read specs to understand system

## When to Use This Skill

Automatically apply SDD methodology when users:

- "Create a specification for..."
- "Plan a new feature..."
- "Write user stories for..."
- "Define requirements for..."
- "Establish project principles..."
- "Decompose this into tasks..."
- "Follow spec-driven development..."
- "Generate a plan for implementing..."

## Official Spec-Kit Slash Commands

If the user has the [spec-kit CLI](https://github.com/github/spec-kit) installed, they can use these slash commands in Claude Code:

**Core Workflow Commands**:

- `/speckit.constitution` - Establish governing principles and development guidelines
- `/speckit.specify` - Define functional requirements and user stories (focus on _what_, not _how_)
- `/speckit.plan` - Create implementation strategy with architecture and tech stack
- `/speckit.tasks` - Generate ordered task lists with dependencies and parallel execution markers
- `/speckit.implement` - Execute implementation following task breakdown

**Enhancement Commands**:

- `/speckit.clarify` - Resolve ambiguities with structured questioning (recommended before planning)
- `/speckit.analyze` - Validate cross-artifact consistency across specs, plans, and tasks
- `/speckit.checklist` - Generate quality validation checklist for requirement completeness

**Installation**:

```bash
# Install spec-kit CLI
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Initialize in current project
specify init . --ai claude
```

**Note**: This skill provides the same methodology **without requiring** the spec-kit CLI installation.

## Communication Style

- Guide users through the 6-phase workflow (matching official spec-kit)
- Ask clarifying questions proactively
- Generate complete, structured specifications
- Validate constitutional compliance
- Provide concrete examples from templates
- Maintain separation between "what" (spec) and "how" (plan)
- Ensure all artifacts are consistent and complete

## Reference Guides

- [Constitutional Articles](reference/constitutional-articles.md) - The 9 immutable principles with detailed implementation guidance
- [Workflow Guide](reference/workflow-guide.md) - Complete 7-phase workflow with templates and examples

## Learn More

- **Official Repository**: <https://github.com/github/spec-kit>
- **Installation Guide**: <https://github.com/github/spec-kit#installation>
- **Documentation**: See repository README for latest updates
- **Supported AI Agents**: Claude Code, Cursor, Gemini CLI, GitHub Copilot, and 16+ others
