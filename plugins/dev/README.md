# Dev Plugin

Development CLI skills and GitHub workflows for popular tools and platforms.

## Overview

This plugin provides comprehensive CLI reference skills for modern development tools, GitHub and Git workflows, and repository management. It combines development platform expertise with automated workflows for building, deploying, and collaborating on projects.

## Available Skills & Commands

### Deployment & Hosting

- **vercel-cli** - Vercel CLI expert for serverless deployment
- **railway-cli** - Railway CLI expert for application deployment
- **coolify-api** - Coolify API expert for self-hosted PaaS management

### Backend & Database

- **adonisjs-cli** - AdonisJS Ace CLI expert for TypeScript backend applications
- **convex-cli** - Convex CLI expert for serverless backend and real-time database
- **neon-cli** - Neon CLI expert for serverless PostgreSQL management

### Frontend & Frameworks

- **nextjs-cli** - Next.js CLI expert for React application development

### DevOps & Infrastructure

- **docker-cli** - Docker CLI expert for containerization and orchestration
- **github-cli** - GitHub CLI (gh) expert for repository and workflow management

### Testing & Automation

- **playwright-cli** - Playwright CLI expert for browser automation and testing
- **lighthouse-cli** - Lighthouse CLI expert for web performance auditing

### Tools & Extensions

- **raycast-cli** - Raycast CLI expert for extension development

## Available Commands

### Git & GitHub Workflows

- **commit** - Commitizen-format commit workflow with validation
- **commit-push-pr** - Combined commit, push, and PR creation workflow
- **create-worktree** - Automated git worktree creation with Claude CLI integration
- **clean-gone** - Clean up deleted remote branches
- **debug** - Project issue detection and fixing
- **fix-pr-comments** - Automated PR comment resolution
- **merge-to-main** - Automated merge with conflict resolution
- **run-task** - Task execution workflow with GitHub issues

## Usage

Skills are automatically triggered when users request help with the corresponding CLI tool. Each skill provides comprehensive command references, best practices, and common usage examples.

Commands are invoked via slash commands (e.g., `/commit`, `/create-worktree`) for automated workflows.

## Scripts

- **worktree-manager** - TypeScript-based worktree management tool with GitHub integration
  - Configuration profiles (minimal, fast, full)
  - Package manager detection
  - Git bridge for branch operations
  - Terminal launcher support

## License

MIT
