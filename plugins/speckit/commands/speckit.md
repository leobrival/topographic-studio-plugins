---
title: Spec-Kit CLI
description: Intelligent spec-kit management with repository analysis, gap detection, and contextual optimization
allowed-tools: [Bash, Read, Glob, Grep, WebFetch]
model: haiku
---

# Spec-Kit CLI Manager

Intelligent spec-kit lifecycle management with repository analysis, project assessment, and contextual optimization recommendations.

## Available Actions

Parse the user's request to determine which action to perform:

- **install** - Fresh installation of spec-kit CLI
- **update** - Update to the latest version
- **version** / **check** - Check installed version and compare with latest
- **init** - Initialize spec-kit in current project
- **analyze** - Deep analysis of current project vs latest features
- **help** - Show available commands and usage

If no action specified, run **full intelligent workflow**:
1. Repository intelligence gathering
2. Current project assessment
3. Gap analysis & recommendations
4. Suggest appropriate action

## Intelligent Workflow

### Step 1: Repository Intelligence Gathering

Use WebFetch to analyze the latest spec-kit repository:

**Required Analysis:**
1. Main repository: https://github.com/github/spec-kit
2. Latest releases and changelog
3. New features and command additions (`/analyze`, `/clarify`, etc.)
4. Template improvements and new capabilities
5. Breaking changes and deprecation notices
6. Constitution updates and best practices

**Extract:**
- Latest version tag
- New commands added since last major version
- Template format changes
- Recommended practices updates

### Step 2: Current Project Assessment

```bash
# Check for existing spec-kit installation
specify --version 2>/dev/null || echo "NOT_INSTALLED"

# Check system prerequisites
python3 --version
uv --version 2>/dev/null || echo "uv not found"
git --version
```

**Deep scan current project structure:**

```bash
# Detect .specify directory
if [ -d ".specify" ]; then
    echo "=== Project Structure ==="
    ls -la .specify/

    echo "=== Constitution Preview ==="
    head -30 .specify/constitution.md 2>/dev/null || echo "No constitution found"

    echo "=== Template Versions ==="
    grep -r "version:" .specify/ 2>/dev/null || echo "No version metadata"
else
    echo "No .specify directory found"
fi

# Detect spec files in project
echo "=== Spec Files Found ==="
find . -maxdepth 3 -name "spec.md" -o -name "plan.md" -o -name "tasks.md" 2>/dev/null | head -10
```

### Step 3: Gap Analysis & Recommendations

**Compare repository features vs current project:**

Based on WebFetch results and project scan, identify:

1. **Missing Commands**: New commands not available in current version
2. **Outdated Templates**: Templates that could be improved
3. **New Validation Scripts**: Prerequisites and checks added
4. **Constitution Updates**: Best practices changes

**Generate upgrade impact assessment:**
- List specific benefits for the current project
- Identify potential compatibility issues
- Suggest migration strategies for existing specifications

### Step 4: Smart Installation/Update

#### Prerequisites Check

```bash
# Check Python version (need 3.11+)
python3 --version

# Check uv availability
uv --version 2>/dev/null || echo "uv not found - will install it first"

# Check git availability
git --version
```

#### Install uv (if needed)

```bash
# Install uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# Reload shell configuration
source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null
```

#### Primary Installation (with uv)

```bash
# Fresh installation (persistent)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Verify installation
specify --version

# Run system check
specify check
```

#### Update Existing Installation

```bash
# Update using uv (preferred)
uv tool upgrade specify-cli

# Or force reinstall for latest from git
uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git

# Verify new version
specify --version
```

#### Fallback Installation (without uv)

```bash
# Using pip if uv is not available
python3 -m pip install --upgrade git+https://github.com/github/spec-kit.git

# Verify installation
python3 -m specify --version
```

### Step 5: Project Integration & Auto-Init

```bash
# Auto-initialize if no .specify directory exists
if [ ! -d ".specify" ]; then
    echo "No .specify directory found. Initializing with Claude AI agent..."
    specify init . --ai claude --force
    echo "Project initialized successfully!"
else
    echo "Project already initialized with spec-kit"
    # Validate existing setup
    specify check
fi
```

#### Available AI Agents

When initializing, choose from 18+ supported agents:
- `claude` - Claude Code (recommended)
- `copilot` - GitHub Copilot
- `cursor-agent` - Cursor IDE
- `gemini` - Gemini CLI
- `windsurf` - Windsurf IDE
- `amp` - Amp CLI
- `qwen` - Qwen
- And more...

### Step 6: Post-Installation Validation & Optimization

```bash
# Test core commands
specify check
specify --help

# List created/existing files
ls -la .specify/

# Show constitution
cat .specify/constitution.md
```

**If project has existing specs, run analysis:**

```bash
# Check for existing spec files
if [ -f "spec.md" ] || [ -f ".specify/spec.md" ]; then
    echo "Found existing specifications - recommend running /analyze"
fi
```

### Step 7: Contextual Enhancement Recommendations

Based on gap analysis, provide:

1. **Immediate Actions After Update:**
   - Run `/analyze` to audit current specification quality
   - Compare current constitution with latest repository version
   - Identify gaps between current templates and newest versions

2. **Progressive Enhancement:**
   - Use `/clarify` to improve ambiguous requirements
   - Migrate to new template formats if improvements available
   - Apply new validation scripts and prerequisites

3. **Compliance & Optimization:**
   - Validate compliance with latest constitution standards
   - Implement new best practices from CHANGELOG
   - Leverage new features for project structure

## Latest Features to Leverage

After installation/update, these new features are available:

| Feature | Description |
|---------|-------------|
| `/analyze` | Cross-artifact consistency analysis for existing specs |
| `/clarify` | Structured questioning to reduce ambiguities |
| Enhanced templates | Improved plan.md and tasks.md generation |
| Better prerequisites | Robust bash/powershell validation scripts |
| AI agent detection | Automatic compatibility checks |

## Slash Commands Reference

After initialization, these commands are available:

| Command | Description |
|---------|-------------|
| `/speckit.constitution` | Establish project principles |
| `/speckit.specify` | Define requirements |
| `/speckit.clarify` | Address ambiguities |
| `/speckit.plan` | Create implementation plan |
| `/speckit.analyze` | Cross-check consistency |
| `/speckit.tasks` | Generate task breakdowns |
| `/speckit.implement` | Execute implementation |
| `/speckit.checklist` | Generate quality checklists |

## Execution Protocol

**The AI must perform these steps in order:**

### For `/speckit` (no args) or `/speckit analyze`:

1. **Repository Intelligence** (WebFetch required):
   - Fetch and analyze https://github.com/github/spec-kit
   - Extract latest features, breaking changes, improvements
   - Document version differences and new capabilities

2. **Current State Assessment** (Bash + Read):
   - Check installation status and version
   - Scan current directory for `.specify/` and spec files
   - Read existing constitution, templates, configurations
   - Map current project structure against latest patterns

3. **Gap Analysis & Recommendations**:
   - Compare repository capabilities vs current setup
   - Identify specific benefits available through upgrade
   - Generate project-specific migration strategy
   - Prioritize improvements based on current needs

4. **Actionable Summary**:
   - Clear status (installed/not installed/outdated)
   - Recommended next action with command
   - List of new features available after update

### For `/speckit install`:

1. Prerequisites check (Python, uv, git)
2. Install uv if missing
3. Install spec-kit via uv
4. Auto-init project if no `.specify/`
5. Validation and feature summary

### For `/speckit update`:

1. Current version check
2. Repository intelligence for what's new
3. Update via uv
4. Gap analysis for new features
5. Recommendations for leveraging updates

### For `/speckit init`:

1. Check if already initialized
2. Initialize with Claude AI agent
3. Validation of created files
4. Available commands summary

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `uv not found` | Run: `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| `Python < 3.11` | Install Python 3.11+ |
| `Permission denied` | Use `--user` flag with pip |
| `Rate limit error` | Wait or use `--github-token` |
| `Agent not detected` | Use `--ignore-agent-tools` flag |
| `Repository access` | Ensure internet connectivity for WebFetch |
| `No .specify/ found` | Run `/speckit init` to initialize |

$ARGUMENTS
