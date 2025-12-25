# Spec-Kit Plugin

Intelligent lifecycle management for [spec-kit](https://github.com/github/spec-kit) - the spec-driven development toolkit.

## Features

- **Repository Intelligence**: Analyzes GitHub for latest features, changelog, breaking changes
- **Project Assessment**: Deep scan of `.specify/` directory and spec files
- **Gap Analysis**: Compares installed version vs latest capabilities
- **Smart Installation**: Prerequisites check, uv/pip fallback, auto-init
- **Contextual Recommendations**: Project-specific upgrade strategies

## Usage

```bash
# Full intelligent analysis (recommended)
/speckit

# Install spec-kit
/speckit install

# Update to latest version
/speckit update

# Check version comparison
/speckit check

# Initialize in current project
/speckit init

# Deep analysis of project vs latest features
/speckit analyze

# Initialize with specific AI agent
/speckit init --ai copilot
```

## Intelligent Workflow

When you run `/speckit` without arguments, the plugin performs:

1. **Repository Intelligence Gathering**
   - Fetches latest info from GitHub spec-kit repository
   - Analyzes changelog, new features, breaking changes
   - Extracts latest command additions (`/analyze`, `/clarify`, etc.)

2. **Current Project Assessment**
   - Checks installation status and version
   - Deep scans `.specify/` directory structure
   - Analyzes existing constitution and templates
   - Detects spec.md, plan.md, tasks.md files

3. **Gap Analysis & Recommendations**
   - Compares repository features vs current setup
   - Identifies missing commands and outdated templates
   - Generates project-specific migration strategy

4. **Actionable Summary**
   - Clear status (installed/not installed/outdated)
   - Recommended next action with command
   - List of new features available after update

## What is Spec-Kit?

Spec-kit implements "Spec-Driven Development" - an approach where detailed specifications directly generate working implementations.

### Workflow

1. **Constitution** - Establish project principles
2. **Specify** - Define requirements (what and why)
3. **Clarify** - Address ambiguities
4. **Plan** - Create implementation strategy
5. **Analyze** - Cross-check consistency
6. **Tasks** - Generate task breakdowns
7. **Implement** - Execute the plan

### Slash Commands (after init)

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `/speckit.constitution` | Establish project principles |
| `/speckit.specify`      | Define requirements          |
| `/speckit.clarify`      | Address ambiguities          |
| `/speckit.plan`         | Create implementation plan   |
| `/speckit.analyze`      | Cross-check consistency      |
| `/speckit.tasks`        | Generate task breakdowns     |
| `/speckit.implement`    | Execute implementation       |
| `/speckit.checklist`    | Generate quality checklists  |

## Latest Features to Leverage

| Feature              | Description                              |
| -------------------- | ---------------------------------------- |
| `/analyze`           | Cross-artifact consistency analysis      |
| `/clarify`           | Structured questioning for ambiguities   |
| Enhanced templates   | Improved plan.md and tasks.md generation |
| Better prerequisites | Robust validation scripts                |
| AI agent detection   | Automatic compatibility checks           |

## Requirements

- Python 3.11+
- Git
- uv package manager (auto-installed if missing)

## Supported AI Agents

18+ agents including:

- Claude Code (recommended)
- GitHub Copilot
- Cursor IDE
- Gemini CLI
- Windsurf IDE
- Amp CLI
- Qwen
- And more...

## License

MIT
