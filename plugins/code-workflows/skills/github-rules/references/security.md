# Security Policies and Configuration

Security features and policies for GitHub repositories.

## Security Policy (SECURITY.md)

Create `.github/SECURITY.md` or `SECURITY.md` in repo root:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities to security@example.com.

**Do NOT create a public GitHub issue.**

We will respond within 48 hours and work with you to:
1. Confirm the vulnerability
2. Determine affected versions
3. Develop and test a fix
4. Release a patch
5. Credit you in the release notes (if desired)

## Security Measures

- All dependencies are automatically scanned
- Security patches are applied within 7 days
- We follow responsible disclosure practices
```

## Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    groups:
      development:
        dependency-type: "development"
      production:
        dependency-type: "production"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "ci"
      - "dependencies"

  # Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"

  # Python (pip)
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Dependabot Options

```yaml
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
      time: "09:00"
      timezone: "Europe/Paris"

    # Limit PRs
    open-pull-requests-limit: 5

    # Auto-merge minor updates
    allow:
      - dependency-type: "direct"

    # Ignore specific packages
    ignore:
      - dependency-name: "lodash"
        versions: ["4.x"]
      - dependency-name: "aws-*"
        update-types: ["version-update:semver-major"]

    # Commit message format
    commit-message:
      prefix: "chore(deps)"
      include: "scope"

    # PR assignees and reviewers
    assignees:
      - "developer"
    reviewers:
      - "team-leads"
```

## Secret Scanning

### Enable Secret Scanning

Settings > Code security and analysis > Secret scanning

```bash
# Check if enabled via API
gh api repos/{owner}/{repo} | jq '.security_and_analysis'
```

### Custom Secret Patterns

Settings > Code security > Secret scanning > Custom patterns

```regex
# Example: Internal API keys
internal_api_key_[a-zA-Z0-9]{32}
```

### Push Protection

Block pushes containing secrets:

Settings > Code security > Secret scanning > Push protection

## Code Scanning (CodeQL)

Create `.github/workflows/codeql.yml`:

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript', 'typescript']

    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: +security-extended

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

## Private Vulnerability Reporting

Enable in Settings > Code security > Private vulnerability reporting

Users can report vulnerabilities privately through:
Security tab > Report a vulnerability

## Security Advisories

Create security advisories for vulnerabilities:

1. Go to Security tab > Security advisories
2. Click "New draft security advisory"
3. Fill in details (severity, affected versions)
4. Request CVE (optional)
5. Publish when fix is ready

## Audit Log

For organizations:

```bash
# View security events
gh api orgs/{org}/audit-log --jq '.[] | select(.action | startswith("repo."))'
```

## Repository Security Settings

```bash
# Enable all security features
gh api repos/{owner}/{repo} --method PATCH --input - << 'EOF'
{
  "security_and_analysis": {
    "secret_scanning": {"status": "enabled"},
    "secret_scanning_push_protection": {"status": "enabled"},
    "dependabot_security_updates": {"status": "enabled"}
  }
}
EOF
```

## Best Practices

1. **Enable everything**: Secret scanning, Dependabot, CodeQL
2. **Require signed commits**: For sensitive repos
3. **Private vulnerability reporting**: Better than public issues
4. **Regular audits**: Review security alerts weekly
5. **Patch quickly**: Security updates within 7 days
6. **Document process**: Clear SECURITY.md
